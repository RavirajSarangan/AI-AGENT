"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Users,
  Zap,
  Clock,
  Bot,
  Calendar,
} from "lucide-react";

// Mock data - replace with Firebase real-time data
const messageData = [
  { date: "Nov 9", whatsapp: 120, instagram: 45, total: 165 },
  { date: "Nov 10", whatsapp: 145, instagram: 52, total: 197 },
  { date: "Nov 11", whatsapp: 132, instagram: 48, total: 180 },
  { date: "Nov 12", whatsapp: 158, instagram: 61, total: 219 },
  { date: "Nov 13", whatsapp: 175, instagram: 68, total: 243 },
  { date: "Nov 14", whatsapp: 189, instagram: 73, total: 262 },
  { date: "Nov 15", whatsapp: 198, instagram: 79, total: 277 },
];

const workflowData = [
  { name: "Lead Capture", success: 145, failed: 5 },
  { name: "FAQ Bot", success: 234, failed: 12 },
  { name: "Pricing Info", success: 89, failed: 3 },
  { name: "After Hours", success: 67, failed: 1 },
  { name: "Support Triage", success: 156, failed: 8 },
];

const channelBreakdown = [
  { name: "WhatsApp", value: 68, color: "#10b981" },
  { name: "Instagram", value: 32, color: "#ec4899" },
];

const responseTimeData = [
  { hour: "00:00", avgTime: 45 },
  { hour: "04:00", avgTime: 38 },
  { hour: "08:00", avgTime: 52 },
  { hour: "12:00", avgTime: 67 },
  { hour: "16:00", avgTime: 58 },
  { hour: "20:00", avgTime: 43 },
];

export default function AnalyticsPage() {
  // Real-time data subscription placeholder

  return (
    <RoleGuard allowedRoles={["owner", "admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track performance, usage, and insights across all channels
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Last 7 Days
            </Button>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        <WorkspaceSwitcher />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">1,543</div>
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+12.5%</span>
                <span>from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">892</div>
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+8.3%</span>
                <span>from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                AI Reply Rate
              </CardTitle>
              <Bot className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">67.3%</div>
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+5.2%</span>
                <span>from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">2.3s</div>
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-green-600">-18%</span>
                <span>improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Message Volume</CardTitle>
              <CardDescription>WhatsApp and Instagram messages over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={messageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="whatsapp"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="WhatsApp"
                  />
                  <Area
                    type="monotone"
                    dataKey="instagram"
                    stackId="1"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.6}
                    name="Instagram"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Workflow Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Workflow Success Rate</CardTitle>
              <CardDescription>Executions by workflow (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workflowData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" style={{ fontSize: "12px" }} />
                  <YAxis dataKey="name" type="category" width={120} style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="success" fill="#10b981" name="Success" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Channel Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Channel Distribution</CardTitle>
              <CardDescription>Messages by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={channelBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelBreakdown.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {channelBreakdown.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: channel.color }}
                      />
                      <span className="text-sm text-gray-700">{channel.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{channel.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response Time Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Response Time Trend</CardTitle>
              <CardDescription>Average response time by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgTime"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Avg Time (seconds)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">Top Workflows</CardTitle>
            <CardDescription>Most executed workflows this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowData.map((workflow) => {
                const total = workflow.success + workflow.failed;
                const successRate = ((workflow.success / total) * 100).toFixed(1);
                return (
                  <div
                    key={workflow.name}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{workflow.name}</div>
                        <div className="text-xs text-gray-600">
                          {total} executions · {successRate}% success rate
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{workflow.success}</div>
                        <div className="text-xs text-gray-600">Success</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{workflow.failed}</div>
                        <div className="text-xs text-gray-600">Failed</div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
