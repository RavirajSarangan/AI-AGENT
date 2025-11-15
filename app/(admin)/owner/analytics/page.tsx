"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Building2,
  DollarSign,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { subscribeToPlatformStats, PlatformStats } from "@/lib/firebase/platform";

export default function OwnerAnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  // Real-time subscription to platform stats
  useEffect(() => {
    const unsubscribe = subscribeToPlatformStats((data) => {
      setStats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Mock data for charts (TODO: Replace with real data from analytics collection)
  const messageVolumeData = [
    { date: "Jan 1", messages: 12458, workspaces: 42 },
    { date: "Jan 2", messages: 13892, workspaces: 43 },
    { date: "Jan 3", messages: 15234, workspaces: 45 },
    { date: "Jan 4", messages: 14567, workspaces: 46 },
    { date: "Jan 5", messages: 16892, workspaces: 48 },
    { date: "Jan 6", messages: 18234, workspaces: 50 },
    { date: "Jan 7", messages: 19567, workspaces: 52 },
  ];

  const planDistribution = [
    { name: "Free", value: 25, color: "#6B7280" },
    { name: "Starter", value: 15, color: "#3B82F6" },
    { name: "Pro", value: 8, color: "#8B5CF6" },
    { name: "Agency", value: 3, color: "#F97316" },
    { name: "Enterprise", value: 1, color: "#EF4444" },
  ];

  const revenueData = [
    { month: "Jul", revenue: 45000 },
    { month: "Aug", revenue: 52000 },
    { month: "Sep", revenue: 61000 },
    { month: "Oct", revenue: 68000 },
    { month: "Nov", revenue: 75000 },
    { month: "Dec", revenue: 82000 },
    { month: "Jan", revenue: 91000 },
  ];

  const workspaceGrowth = [
    { month: "Jul", new: 5, churned: 1 },
    { month: "Aug", new: 7, churned: 2 },
    { month: "Sep", new: 8, churned: 1 },
    { month: "Oct", new: 10, churned: 2 },
    { month: "Nov", new: 12, churned: 1 },
    { month: "Dec", new: 15, churned: 3 },
    { month: "Jan", new: 18, churned: 2 },
  ];

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              System-wide metrics and insights across all workspaces
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Workspaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_workspaces || 52}
              </div>
              <p className="text-xs text-green-600 mt-1">+18 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.active_workspaces || 48}
              </div>
              <p className="text-xs text-gray-500 mt-1">92% uptime</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_users || 1248}
              </div>
              <p className="text-xs text-green-600 mt-1">+127 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.total_messages_today || 19567}
              </div>
              <p className="text-xs text-green-600 mt-1">+24% vs yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                MRR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$91k</div>
              <p className="text-xs text-green-600 mt-1">+12% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Workflow Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_workflow_runs_today || 8943}
              </div>
              <p className="text-xs text-green-600 mt-1">+18% vs yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Message Volume</CardTitle>
              <CardDescription>
                Platform-wide message traffic over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={messageVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Plan Distribution</CardTitle>
              <CardDescription>
                Workspace count by subscription tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planDistribution.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Revenue Growth</CardTitle>
              <CardDescription>
                Monthly recurring revenue trend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Workspace Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Workspace Growth</CardTitle>
              <CardDescription>
                New signups vs churn by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workspaceGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new" fill="#10B981" name="New" />
                  <Bar dataKey="churned" fill="#EF4444" name="Churned" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Workspaces */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">Top Performing Workspaces</CardTitle>
            <CardDescription>
              Highest message volume and engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Acme Corp", messages: 8234, plan: "Enterprise", growth: "+45%" },
                { name: "TechStart Inc", messages: 6892, plan: "Agency", growth: "+32%" },
                { name: "Retail Pro", messages: 5234, plan: "Pro", growth: "+28%" },
                { name: "Service Hub", messages: 4567, plan: "Pro", growth: "+21%" },
                { name: "Local Biz", messages: 3421, plan: "Starter", growth: "+18%" },
              ].map((workspace) => (
                <div
                  key={workspace.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-900">{workspace.name}</p>
                      <p className="text-xs text-gray-500">
                        {workspace.messages.toLocaleString()} messages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-600">{workspace.plan}</Badge>
                    <span className="text-sm text-green-600 font-medium">
                      {workspace.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
