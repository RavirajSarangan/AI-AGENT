"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Activity,
  DollarSign,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  PlatformStats,
  Workspace,
  subscribeToPlatformStats,
  subscribeToAllWorkspaces,
} from "@/lib/firebase/platform";

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscriptions
  useEffect(() => {
    const unsubscribeStats = subscribeToPlatformStats((data) => {
      setStats(data);
      setLoading(false);
    });

    const unsubscribeWorkspaces = subscribeToAllWorkspaces((data) => {
      setWorkspaces(data.slice(0, 5)); // Show top 5
    });

    return () => {
      unsubscribeStats();
      unsubscribeWorkspaces();
    };
  }, []);

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Owner Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              System-wide overview and workspace management
            </p>
          </div>
          <Button asChild>
            <Link href="/owner/workspaces">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Workspaces
            </Link>
          </Button>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Workspaces
              </CardTitle>
              <Building2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_workspaces || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">{stats?.active_workspaces || 0}</span> active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_users || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Across all workspaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Messages Today
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_messages_today.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Platform-wide traffic
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Workflow Runs
              </CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_workflow_runs_today.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Today's executions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Workspaces */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-bold text-gray-900">Recent Workspaces</CardTitle>
                <CardDescription>Latest workspace activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/owner/workspaces">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">{workspace.name}</div>
                      <div className="text-xs text-gray-600">
                        {workspace.owner_email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-600">{workspace.plan.toUpperCase()}</Badge>
                    <Badge variant={workspace.status === "active" ? "default" : "destructive"}>
                      {workspace.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Uptime</span>
                <Badge variant="default" className="bg-green-600">99.9%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Workspaces</span>
                <Badge variant="default" className="bg-green-600">
                  {stats?.active_workspaces || 0}/{stats?.total_workspaces || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Response Time</span>
                <Badge variant="secondary">1.2s avg</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Latency</span>
                <Badge variant="secondary">45ms avg</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/owner/workspaces">
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Workspaces
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/owner/analytics">
                  <Activity className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/owner/billing">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Global Billing
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/owner/logs">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  System Logs
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
