'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToWorkflows, deleteWorkflow, toggleWorkflowStatus, type Workflow } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  MoreVertical,
} from 'lucide-react';

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time subscription to workflows
  useEffect(() => {
    const tenantId = 'default'; // TODO: Get from auth
    
    const unsubscribe = subscribeToWorkflows(tenantId, (updatedWorkflows) => {
      setWorkflows(updatedWorkflows);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleStatus = async (workflowId: string) => {
    try {
      await toggleWorkflowStatus(workflowId);
    } catch (error) {
      console.error('Error toggling workflow status:', error);
    }
  };

  const handleDelete = async (workflowId: string, workflowName: string) => {
    if (confirm(`Are you sure you want to delete "${workflowName}"?`)) {
      try {
        await deleteWorkflow(workflowId);
      } catch (error) {
        console.error('Error deleting workflow:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 font-bold text-white">Loading workflows from Firebase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Workflows</h2>
          <p className="text-gray-400">
            Create and manage automation flows for your messaging
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push("/workflows/builder")}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="font-bold">New Workflow</span>
          </Button>
        </div>
      </header>

      {/* Real-time indicator */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-purple-900">
            🔥 Real-time Firebase sync active · {workflows.length} workflows loaded from Firestore
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-bold text-white">Total Workflows</p>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{workflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-bold text-white">Active</p>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {workflows.filter((w) => w.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-bold text-white">Total Executions</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {workflows.reduce((sum, w) => sum + w.execution_count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-bold text-white">Success Rate</p>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {workflows.reduce((sum, w) => sum + w.execution_count, 0) > 0
                ? Math.round(
                    (workflows.reduce((sum, w) => sum + w.success_count, 0) /
                      workflows.reduce((sum, w) => sum + w.execution_count, 0)) *
                      100
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-white">Name</TableHead>
              <TableHead className="font-bold text-white">Trigger</TableHead>
              <TableHead className="font-bold text-white">Status</TableHead>
              <TableHead className="font-bold text-white">Last Run</TableHead>
              <TableHead className="font-bold text-white">Result</TableHead>
              <TableHead className="font-bold text-white">Executions</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-white font-bold mb-1">No workflows found</p>
                  <p className="text-sm text-gray-500">Click "New Workflow" to create your first automation</p>
                </TableCell>
              </TableRow>
            ) : (
              workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-bold text-white">
                    {workflow.name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-400 font-medium">
                    {workflow.nodes?.[0]?.name || 'No trigger'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.status === "active"}
                        onCheckedChange={() => handleToggleStatus(workflow.id)}
                      />
                      <Badge
                        variant={workflow.status === "active" ? "default" : "secondary"}
                        className="font-bold"
                      >
                        {workflow.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-300">
                    {(() => {
                      if (!workflow.last_executed_at) return 'Never';
                      if (workflow.last_executed_at instanceof Date) {
                        return workflow.last_executed_at.toLocaleString();
                      }
                      return (workflow.last_executed_at as any).toDate().toLocaleString();
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-500 font-bold">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {workflow.success_count}
                      </Badge>
                      {workflow.error_count > 0 && (
                        <Badge variant="destructive" className="font-bold">
                          <XCircle className="mr-1 h-3 w-3" />
                          {workflow.error_count}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-white">
                    {workflow.execution_count}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/workflows/${workflow.id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span className="font-bold">View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/workflows/builder?edit=${workflow.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span className="font-bold">Edit in Builder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/workflows/${workflow.id}/logs`)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          <span className="font-bold">View Logs</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(workflow.id, workflow.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span className="font-bold">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
