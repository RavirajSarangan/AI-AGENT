"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToExecutionLogs, ExecutionLog } from "@/lib/firebase/execution-logs";
import { subscribeToWorkflow, Workflow } from "@/lib/firebase/workflows";

export default function WorkflowLogsPage() {
  const params = useParams();
  const { userProfile } = useAuth();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
        // Filter logs for this workflow and sort by date desc
        const workflowLogs = data
          .filter((log) => log.workflow_id === workflowId)
          .sort((a, b) => {
            const aTime = a.started_at instanceof Date 
              ? a.started_at.getTime() 
              : (a.started_at as any).toMillis?.() || 0;
            const bTime = b.started_at instanceof Date 
              ? b.started_at.getTime() 
              : (b.started_at as any).toMillis?.() || 0;
            return bTime - aTime;
          });
        setExecutionLogs(workflowLogs);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.currentTenant, workflowId]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return executionLogs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.error?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [executionLogs, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = executionLogs.length;
    const successful = executionLogs.filter((log) => log.status === "success").length;
    const failed = executionLogs.filter((log) => log.status === "error").length;
    const running = executionLogs.filter((log) => log.status === "running").length;
    const avgDuration = executionLogs.length > 0
      ? executionLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / executionLogs.length / 1000
      : 0;

    return { total, successful, failed, running, avgDuration };
  }, [executionLogs]);

  const handleExportCSV = () => {
    const headers = ["ID", "Status", "Started At", "Duration (s)", "Error"];
    const rows = filteredLogs.map((log) => {
      const startedAt = log.started_at instanceof Date 
        ? log.started_at.toISOString() 
        : (log.started_at as any).toDate?.()?.toISOString() || "";
      const duration = log.duration || log.duration_ms;
      const errorMsg = log.error || log.error_message;
      
      return [
        log.id,
        log.status,
        startedAt,
        duration ? (duration / 1000).toFixed(2) : "",
        errorMsg || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow_${workflowId}_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/workflows/${workflowId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Execution Logs</h1>
              <p className="text-gray-600 mt-1">
                {workflow?.name || `Workflow ${workflowId}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Executions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Running
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.avgDuration.toFixed(2)}s
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Logs Table */}
        <Card>
          <CardContent className="p-0">
            {filteredLogs.length > 0 ? (
              <div className="divide-y">
                {filteredLogs.map((log) => {
                  const startedAt = log.started_at instanceof Date 
                    ? log.started_at 
                    : (log.started_at as any).toDate?.() || new Date();
                  const errorMsg = log.error || log.error_message;
                  const duration = log.duration || log.duration_ms;
                  const steps = log.steps || log.steps_completed;
                  
                  let badgeVariant: "default" | "destructive" | "outline" = "outline";
                  if (log.status === "success") badgeVariant = "default";
                  else if (log.status === "error") badgeVariant = "destructive";
                  
                  return (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={badgeVariant}
                            className="capitalize"
                          >
                            {log.status}
                          </Badge>
                          <span className="text-sm font-mono text-gray-600">
                            {log.id}
                          </span>
                          <span className="text-sm text-gray-600">
                            {startedAt.toLocaleString()}
                          </span>
                        </div>
                        {errorMsg && (
                          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Error:</strong> {errorMsg}
                          </p>
                        )}
                        {steps && (
                          <div className="text-xs text-gray-600">
                            <strong>Steps:</strong> {steps} steps executed
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 ml-4">
                        {duration ? `${(duration / 1000).toFixed(2)}s` : "—"}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                {searchQuery || statusFilter !== "all"
                  ? "No logs match your filters"
                  : "No execution logs yet"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
