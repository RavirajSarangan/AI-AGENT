"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, Settings, Play } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactFlow, {
  Node,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { useAuth } from "@/contexts/AuthContext";
import {
  Workflow,
  subscribeToWorkflow,
  updateWorkflow,
  createWorkflow,
} from "@/lib/firebase/workflows";

// Custom node types for workflow
const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  aiReply: AIReplyNode,
  webhook: WebhookNode,
  template: TemplateNode,
};

// Node components
function TriggerNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 border-2 border-green-500 bg-green-50 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
        <div className="font-bold text-sm text-gray-900">Trigger</div>
      </div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  );
}

function ConditionNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 border-2 border-yellow-500 bg-yellow-50 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
        <div className="font-bold text-sm text-gray-900">Condition</div>
      </div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  );
}

function ActionNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 border-2 border-blue-500 bg-blue-50 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        <div className="font-bold text-sm text-gray-900">Action</div>
      </div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  );
}

function AIReplyNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 border-2 border-purple-500 bg-purple-50 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
        <div className="font-bold text-sm text-gray-900">AI Reply</div>
      </div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  );
}

function WebhookNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 border-2 border-orange-500 bg-orange-50 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
        <div className="font-bold text-sm text-gray-900">Webhook</div>
      </div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  );
}

function TemplateNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 border-2 border-pink-500 bg-pink-50 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full bg-pink-500"></div>
        <div className="font-bold text-sm text-gray-900">Template</div>
      </div>
      <div className="text-xs text-gray-700">{data.label}</div>
    </div>
  );
}

export default function WorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Real-time workflow subscription
  useEffect(() => {
    if (!workflowId || workflowId === "new") return;

    const unsubscribe = subscribeToWorkflow(workflowId, (data) => {
      if (data) {
        setWorkflow(data);
        setWorkflowName(data.name);
        setWorkflowDescription(data.description || "");

        // Load nodes and edges from workflow config
        if (data.config?.nodes) {
          setNodes(data.config.nodes);
        }
        if (data.config?.edges) {
          setEdges(data.config.edges);
        }
      }
    });

    return () => unsubscribe();
  }, [workflowId]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const addNode = (type: string, label: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
      data: { label },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    if (!userProfile?.currentTenant) return;
    if (!workflowName.trim()) {
      alert("Please enter a workflow name");
      return;
    }

    setIsSaving(true);

    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        trigger_type: "message_received", // Default
        config: {
          nodes,
          edges,
        },
        is_active: workflow?.is_active ?? true,
      };

      if (workflowId === "new") {
        // Create new workflow
        const newId = await createWorkflow({
          ...workflowData,
          tenant_id: userProfile.currentTenant,
          status: "draft" as const,
          nodes: [],
          connections: [],
          canvas_state: { zoom: 1, pan_x: 0, pan_y: 0 },
          execution_count: 0,
          success_count: 0,
          error_count: 0,
        } as any);
        router.push(`/workflows/${newId}/builder`);
      } else {
        // Update existing workflow
        await updateWorkflow(workflowId, workflowData);
      }

      alert("Workflow saved successfully!");
    } catch (error) {
      console.error("Failed to save workflow:", error);
      alert("Failed to save workflow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workflows">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <Input
                placeholder="Workflow name..."
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-bold border-none focus-visible:ring-0 px-0"
              />
              <Input
                placeholder="Add description..."
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="text-sm text-gray-600 border-none focus-visible:ring-0 px-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={workflow?.is_active ? "default" : "outline"}>
              {workflow?.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Sidebar - Node Palette */}
          <div className="w-64 bg-gray-50 border-r p-4 space-y-4 overflow-y-auto">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Triggers</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("trigger", "Message Received")}
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Message Received
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("trigger", "Keyword Match")}
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Keyword Match
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("trigger", "New Contact")}
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  New Contact
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Conditions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("condition", "If Contains")}
                >
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                  If Contains
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("condition", "If Tag Exists")}
                >
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                  If Tag Exists
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("condition", "Time-based")}
                >
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                  Time-based
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("action", "Add Tag")}
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  Add Tag
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("action", "Assign to Agent")}
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  Assign to Agent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("action", "Update Status")}
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  Update Status
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Responses</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("aiReply", "AI Reply")}
                >
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  AI Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("template", "Send Template")}
                >
                  <div className="h-2 w-2 rounded-full bg-pink-500 mr-2"></div>
                  Send Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode("webhook", "Call Webhook")}
                >
                  <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                  Call Webhook
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
              <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 m-4">
                <div className="text-xs text-gray-600">
                  <p className="font-bold mb-1">Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Drag nodes from the left panel</li>
                    <li>Connect nodes by dragging from circles</li>
                    <li>Double-click nodes to edit</li>
                    <li>Press Delete to remove selected</li>
                  </ul>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
