"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  SystemIncident,
  subscribeToSystemIncidents,
  resolveIncident,
} from "@/lib/firebase/platform";
import { useToast } from "@/hooks/use-toast";

export default function OwnerLogsPage() {
  const [incidents, setIncidents] = useState<SystemIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Real-time subscription to system incidents
  useEffect(() => {
    const unsubscribe = subscribeToSystemIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResolve = async (incidentId: string) => {
    try {
      await resolveIncident(incidentId);
      toast({
        title: "Incident Resolved",
        description: "The incident has been marked as resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve incident.",
        variant: "destructive",
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Low
          </Badge>
        );
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "webhook_failure":
        return "🔗";
      case "workflow_error":
        return "⚙️";
      case "api_error":
        return "🌐";
      case "channel_disconnected":
        return "📱";
      default:
        return "❓";
    }
  };

  const unresolvedCount = incidents.filter((i) => !i.resolved).length;
  const criticalCount = incidents.filter(
    (i) => i.severity === "critical" && !i.resolved
  ).length;

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Logs & Incidents</h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring of platform-wide errors and issues
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Incidents (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{incidents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unresolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unresolvedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">99.8%</div>
            </CardContent>
          </Card>
        </div>

        {/* Incidents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">Recent Incidents</CardTitle>
            <CardDescription>
              Real-time feed of platform errors and warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Stack Trace</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getTypeIcon(incident.type)}</span>
                        <span className="text-sm font-medium">
                          {incident.type.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {incident.tenant_id?.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {incident.message}
                    </TableCell>
                    <TableCell className="text-xs text-gray-400 max-w-xs truncate">
                      {incident.stack_trace || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {incident.created_at?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {incident.resolved ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <Clock className="h-3 w-3 mr-1" />
                          Open
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!incident.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(incident.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {incidents.length === 0 && !loading && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  No incidents in the last 24 hours
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Incidents by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "webhook_failure", count: 12, icon: "🔗" },
                  { type: "workflow_error", count: 8, icon: "⚙️" },
                  { type: "api_error", count: 5, icon: "🌐" },
                  { type: "channel_disconnected", count: 3, icon: "📱" },
                ].map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-medium text-gray-900">
                        {item.type.replace("_", " ")}
                      </span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">
                Most Affected Workspaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Acme Corp", incidents: 8 },
                  { name: "TechStart", incidents: 6 },
                  { name: "Retail Pro", incidents: 4 },
                  { name: "Service Hub", incidents: 3 },
                ].map((workspace) => (
                  <div
                    key={workspace.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium text-gray-900">{workspace.name}</span>
                    <Badge variant="destructive">{workspace.incidents} errors</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
