"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Settings, Trash2, BarChart3, Edit2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToWorkflow, Workflow, deleteWorkflow, updateWorkflow } from "@/lib/firebase/workflows";
import { subscribeToExecutionLogs, ExecutionLog } from "@/lib/firebase/execution-logs";

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

  // Real-time workflow subscription
  useEffect(() => {
    if (!workflowId) return;

    const unsubscribe = subscribeToWorkflow(workflowId, (data) => {
      setWorkflow(data);
    });

    return () => unsubscribe();
  }, [workflowId]);

  // Real-time execution logs subscription
  useEffect(() => {
    if (!userProfile?.currentTenant) return;

    const unsubscribe = subscribeToExecutionLogs(
      userProfile.currentTenant,
      (data) => {
        // Filter logs for this workflow
        const workflowLogs = data.filter((log) => log.workflow_id === workflowId);
        setExecutionLogs(workflowLogs);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.currentTenant, workflowId]);

  const handleToggleActive = async () => {
    if (!workflow) return;
    
    try {
      await updateWorkflow(workflow.id, { is_active: !workflow.is_active });
    } catch (error) {
      console.error("Failed to toggle workflow:", error);
    }
  };

  const handleDelete = async () => {
    if (!workflow || !confirm(`Delete workflow "${workflow.name}"?`)) return;

    try {
      await deleteWorkflow(workflow.id);
      router.push("/workflows");
    } catch (error) {
      console.error("Failed to delete workflow:", error);
    }
  };

  // Calculate stats
  const stats = {
    total_executions: executionLogs.length,
    success_rate: executionLogs.length > 0
      ? Math.round((executionLogs.filter(log => log.status === 'success').length / executionLogs.length) * 100)
      : 0,
    avg_duration: executionLogs.length > 0
      ? executionLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / executionLogs.length / 1000
      : 0,
    last_executed: executionLogs.length > 0 ? executionLogs[0].started_at : null,
  };

  if (!workflow) {
    return (
      <RoleGuard allowedRoles={["admin", "owner"]}>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workflows">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{workflow.name}</h1>
              <p className="text-gray-600 mt-1">{workflow.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={workflow.is_active ? "default" : "outline"}>
              {workflow.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleToggleActive}>
              <Play className="h-4 w-4 mr-2" />
              {workflow.is_active ? "Pause" : "Activate"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/workflows/${workflowId}/builder`}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Executions
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total_executions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Success Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.success_rate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Duration
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.avg_duration.toFixed(2)}s
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last Executed
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-gray-900">
                {(() => {
                  if (!stats.last_executed) return "Never";
                  const date = stats.last_executed instanceof Date 
                    ? stats.last_executed 
                    : (stats.last_executed as any).toDate?.() || new Date();
                  return date.toLocaleString();
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">
              Workflow Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Trigger Type</h3>
                <Badge variant="outline" className="capitalize">
                  {workflow.trigger_type?.replaceAll("_", " ") || "Not set"}
                </Badge>
              </div>
              {workflow.config && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Configuration</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(workflow.config, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/workflows/${workflowId}/builder`}>
                    Open Visual Builder
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/workflows/${workflowId}/logs`}>
                    View Execution Logs
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">
              Recent Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executionLogs.length > 0 ? (
              <div className="space-y-3">
                {executionLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={(() => {
                            if (log.status === "success") return "default";
                            if (log.status === "error") return "destructive";
                            return "outline";
                          })()}
                        >
                          {log.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {(() => {
                            if (!log.started_at) return "Unknown";
                            const date = log.started_at instanceof Date 
                              ? log.started_at 
                              : (log.started_at as any).toDate?.() || new Date();
                            return date.toLocaleString();
                          })()}
                        </span>
                      </div>
                      {(log.error || log.error_message) && (
                        <p className="text-sm text-red-600 mt-1">{log.error || log.error_message}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {(() => {
                        const duration = log.duration || log.duration_ms;
                        return duration ? `${(duration / 1000).toFixed(2)}s` : "—";
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No executions yet. Activate the workflow to start.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
