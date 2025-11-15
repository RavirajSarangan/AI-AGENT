'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  subscribeToWorkflow, 
  updateWorkflow, 
  createWorkflow,
  type Workflow,
  type WorkflowNode as FirebaseWorkflowNode,
} from '@/lib/firebase';

import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  ArrowLeft,
  Save,
  Zap,
  MessageCircle,
  GitBranch,
  Sparkles,
  Send,
  Globe,
  Tag,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Trash2,
  X,
} from 'lucide-react';

// Node library
const nodeLibrary = [
  {
    id: 'triggers',
    name: 'Triggers',
    nodes: [
      { type: 'trigger', name: 'Incoming Message', icon: MessageCircle, color: 'bg-purple-500' },
      { type: 'keyword', name: 'Keyword Trigger', icon: Zap, color: 'bg-purple-600' },
    ],
  },
  {
    id: 'actions',
    name: 'Actions',
    nodes: [
      { type: 'ai_reply', name: 'AI Reply', icon: Sparkles, color: 'bg-blue-500' },
      { type: 'send_message', name: 'Send Message', icon: Send, color: 'bg-green-500' },
      { type: 'http_request', name: 'HTTP Request', icon: Globe, color: 'bg-orange-500' },
      { type: 'tag', name: 'Add Tag', icon: Tag, color: 'bg-pink-500' },
    ],
  },
  {
    id: 'logic',
    name: 'Logic',
    nodes: [
      { type: 'condition', name: 'Condition', icon: GitBranch, color: 'bg-yellow-500' },
    ],
  },
];

// Custom node component
function CustomNode({ data }: { data: any }) {
  const Icon = data.icon || MessageCircle;
  
  return (
    <div className={`${data.color} text-white p-4 rounded-lg shadow-lg border-2 border-white min-w-[200px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <span className="font-bold text-sm">{data.label}</span>
      </div>
      
      {data.description && (
        <p className="text-xs mt-1 opacity-90">{data.description}</p>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

function WorkflowBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editWorkflowId = searchParams.get('edit');
  
  // Workflow state
  const [workflowId, setWorkflowId] = useState<string>(editWorkflowId || '');
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowStatus, setWorkflowStatus] = useState<'active' | 'inactive' | 'draft'>('draft');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(!!editWorkflowId);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const nodeIdCounter = useRef(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Real-time workflow subscription
  useEffect(() => {
    if (!editWorkflowId) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToWorkflow(editWorkflowId, (workflow) => {
      if (workflow) {
        setWorkflowName(workflow.name);
        setWorkflowStatus(workflow.status);
        setWorkflowId(workflow.id);
        
        // Only update nodes/edges if not currently saving
        if (!isSavingRef.current && workflow.nodes && Array.isArray(workflow.nodes)) {
          const loadedNodes = workflow.nodes.map((node) => {
            const nodeInfo = nodeLibrary
              .flatMap(cat => cat.nodes)
              .find(n => n.type === node.type);
            
            return {
              id: node.id,
              type: 'custom',
              position: node.position || { x: 250, y: 100 },
              data: {
                label: node.name || nodeInfo?.name || 'Unnamed Node',
                type: node.type,
                icon: nodeInfo?.icon || MessageCircle,
                color: nodeInfo?.color || 'bg-gray-500',
                config: node.data || {},
              },
            };
          });
          setNodes(loadedNodes);

          // Update counter
          const maxId = loadedNodes.reduce((max, node) => {
            const nodeNum = Number.parseInt(node.id.split('_')[1] || '0', 10);
            return Math.max(max, nodeNum);
          }, 0);
          nodeIdCounter.current = maxId;
        }

        if (!isSavingRef.current && workflow.connections && Array.isArray(workflow.connections)) {
          setEdges(workflow.connections.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#64748b', strokeWidth: 2 },
          })));
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [editWorkflowId]);

  // Initialize with trigger node for new workflows
  useEffect(() => {
    if (nodes.length === 0 && !isLoading && !editWorkflowId) {
      addNode('trigger');
    }
  }, [isLoading, editWorkflowId]);

  // Auto-save on changes (debounced 2 seconds)
  useEffect(() => {
    if (!workflowId || isLoading || nodes.length === 0) return;

    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    setSaveStatus('saving');
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveWorkflow();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [nodes, edges, workflowName, workflowStatus]);

  // Auto-save function
  const autoSaveWorkflow = async () => {
    if (!workflowId) return;

    isSavingRef.current = true;

    try {
      // Convert React Flow nodes to Firebase format
      const workflowNodes: FirebaseWorkflowNode[] = nodes.map((node) => ({
        id: node.id,
        type: (node.data as any).type,
        name: (node.data as any).label,
        position: node.position,
        data: (node.data as any).config,
      }));

      // Convert React Flow edges to Firebase format
      const workflowConnections = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }));

      await updateWorkflow(workflowId, {
        name: workflowName,
        status: workflowStatus,
        nodes: workflowNodes,
        connections: workflowConnections,
        canvas_state: reactFlowInstance ? {
          zoom: reactFlowInstance.getZoom(),
          pan_x: reactFlowInstance.getViewport().x,
          pan_y: reactFlowInstance.getViewport().y,
        } : { zoom: 1, pan_x: 0, pan_y: 0 },
      });

      setSaveStatus('saved');
      
      // Clear saved status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      isSavingRef.current = false;
    }
  };

  // Manual save for new workflows
  const handleManualSave = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const workflowNodes: FirebaseWorkflowNode[] = nodes.map((node) => ({
        id: node.id,
        type: (node.data as any).type,
        name: (node.data as any).label,
        position: node.position,
        data: (node.data as any).config,
      }));

      const workflowConnections = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }));

      const newWorkflowData: Omit<Workflow, 'id' | 'created_at' | 'updated_at'> = {
        name: workflowName,
        tenant_id: 'default', // TODO: Get from auth
        status: workflowStatus,
        nodes: workflowNodes,
        connections: workflowConnections,
        canvas_state: { zoom: 1, pan_x: 0, pan_y: 0 },
        execution_count: 0,
        success_count: 0,
        error_count: 0,
      };

      const newId = await createWorkflow(newWorkflowData);
      setWorkflowId(newId);
      router.push(`/workflows/builder?edit=${newId}`);

      setSaveStatus('saved');
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  };

  const addNode = useCallback((type: string, position?: { x: number; y: number }) => {
    const id = `node_${++nodeIdCounter.current}`;
    const nodeInfo = nodeLibrary
      .flatMap(cat => cat.nodes)
      .find(n => n.type === type);
    
    if (!nodeInfo) return;

    const newNode: Node = {
      id,
      type: 'custom',
      position: position || { x: 250, y: nodes.length * 120 + 50 },
      data: {
        label: nodeInfo.name,
        type: type,
        icon: nodeInfo.icon,
        color: nodeInfo.color,
        config: {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#64748b', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge as Edge, eds));
    },
    [setEdges]
  );

  const deleteNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 font-bold text-gray-900">Loading workflow...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Panel - Node Library */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-base text-gray-900">Node Library</h2>
          <p className="text-sm text-gray-500 mt-0.5">Drag to add to canvas</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {nodeLibrary.map((category) => (
            <div key={category.id} className="border-b">
              <h3 className="px-6 py-3 font-semibold text-sm text-gray-700 bg-gray-50">{category.name}</h3>
              <div className="p-3 space-y-2">
                {category.nodes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button
                      key={node.type}
                      onClick={() => addNode(node.type)}
                      className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200"
                    >
                      <div className={`${node.color} p-2 rounded-md`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {node.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/workflows')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="h-6 w-px bg-gray-200" />

            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-80 border-none text-lg font-semibold text-gray-900 px-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Workflow name"
            />
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={workflowStatus === 'active' ? 'default' : 'secondary'} className="px-3 py-1 font-medium">
              {workflowStatus}
            </Badge>

            {saveStatus === 'saving' && (
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                Saved
              </span>
            )}

            <Input
              className="w-48 h-9 text-sm"
              placeholder="Search..."
            />

            <Button
              variant={workflowStatus === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={handleManualSave}
              disabled={isSavingRef.current}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Workflow
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-gray-700"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Info Bar */}
        <div className="bg-gray-50 px-6 py-2.5 border-b flex items-center justify-center">
          <p className="text-sm text-gray-600">
            {nodes.length} nodes · {edges.length} connections
          </p>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 bg-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-white"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
            <Controls className="!bottom-6 !left-6" />
            <MiniMap
              nodeColor={(node) => {
                const data = node.data as any;
                const colorMap: Record<string, string> = {
                  'bg-purple-500': '#a855f7',
                  'bg-purple-600': '#9333ea',
                  'bg-blue-500': '#3b82f6',
                  'bg-green-500': '#22c55e',
                  'bg-orange-500': '#f97316',
                  'bg-pink-500': '#ec4899',
                  'bg-yellow-500': '#eab308',
                };
                return colorMap[data.color] || '#94a3b8';
              }}
              className="!bg-white !border !border-gray-200 !shadow-lg !bottom-6 !right-6"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Right Panel - Node Inspector */}
      {selectedNode && (
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="font-semibold text-base text-gray-900">Node Inspector</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Node Info */}
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Node Name</Label>
                <p className="mt-2 text-sm font-medium text-gray-900">{(selectedNode.data as any).label}</p>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">ID</Label>
                <p className="mt-2 text-xs font-mono text-gray-600">{selectedNode.id}</p>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Node Type</Label>
                <p className="mt-2 text-sm text-gray-900">{(selectedNode.data as any).type}</p>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Description</Label>
                <Textarea
                  className="min-h-[120px] text-sm resize-none"
                  placeholder="Add a description for this node..."
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Configuration</Label>
                <Textarea
                  className="font-mono text-xs resize-none min-h-[160px] bg-gray-50"
                  rows={8}
                  value={JSON.stringify((selectedNode.data as any).config, null, 2)}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-white">
            <Button
              variant="destructive"
              className="w-full font-medium"
              onClick={deleteNode}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <ReactFlowProvider>
        <WorkflowBuilderContent />
      </ReactFlowProvider>
    </Suspense>
  );
}
