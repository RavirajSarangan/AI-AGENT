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
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Download,
  Filter,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function OwnerBillingPage() {
  // Mock revenue data
  const revenueData = [
    { month: "Jul", mrr: 45000, arr: 540000 },
    { month: "Aug", mrr: 52000, arr: 624000 },
    { month: "Sep", mrr: 61000, arr: 732000 },
    { month: "Oct", mrr: 68000, arr: 816000 },
    { month: "Nov", mrr: 75000, arr: 900000 },
    { month: "Dec", mrr: 82000, arr: 984000 },
    { month: "Jan", mrr: 91000, arr: 1092000 },
  ];

  const subscriptions = [
    {
      workspace: "Acme Corp",
      plan: "Enterprise",
      mrr: 999,
      status: "active",
      nextBilling: "2024-02-15",
    },
    {
      workspace: "TechStart Inc",
      plan: "Agency",
      mrr: 299,
      status: "active",
      nextBilling: "2024-02-18",
    },
    {
      workspace: "Retail Pro",
      plan: "Pro",
      mrr: 99,
      status: "active",
      nextBilling: "2024-02-20",
    },
    {
      workspace: "Service Hub",
      plan: "Pro",
      mrr: 99,
      status: "past_due",
      nextBilling: "2024-01-25",
    },
    {
      workspace: "Local Biz",
      plan: "Starter",
      mrr: 29,
      status: "active",
      nextBilling: "2024-02-12",
    },
  ];

  const getPlanBadge = (plan: string) => {
    const colors = {
      Free: "bg-gray-500",
      Starter: "bg-blue-500",
      Pro: "bg-purple-600",
      Agency: "bg-orange-500",
      Enterprise: "bg-red-600",
    };
    return <Badge className={colors[plan as keyof typeof colors] || ""}>{plan}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      case "canceled":
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Billing</h1>
            <p className="text-sm text-gray-600 mt-1">
              Platform-wide revenue and subscription management
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
          </div>
        </div>

        {/* Revenue KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                MRR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$91,000</div>
              <p className="text-xs text-green-600 mt-1">+12% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                ARR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$1.09M</div>
              <p className="text-xs text-green-600 mt-1">+18% YoY</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Paying Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">27</div>
              <p className="text-xs text-green-600 mt-1">+5 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                ARPU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$3,370</div>
              <p className="text-xs text-green-600 mt-1">+8% vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">Revenue Growth</CardTitle>
            <CardDescription>MRR and ARR trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  name="MRR"
                />
                <Area
                  type="monotone"
                  dataKey="arr"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  name="ARR"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">Active Subscriptions</CardTitle>
            <CardDescription>
              All paying workspace subscriptions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.workspace}>
                    <TableCell className="font-medium">{sub.workspace}</TableCell>
                    <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      ${sub.mrr}/mo
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(sub.nextBilling).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Revenue by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { plan: "Enterprise", mrr: 42000, count: 1, color: "bg-red-600" },
                  { plan: "Agency", mrr: 28000, count: 3, color: "bg-orange-500" },
                  { plan: "Pro", mrr: 15000, count: 8, color: "bg-purple-600" },
                  { plan: "Starter", mrr: 6000, count: 15, color: "bg-blue-500" },
                ].map((item) => (
                  <div
                    key={item.plan}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={item.color}>{item.plan}</Badge>
                      <span className="text-sm text-gray-600">{item.count} workspaces</span>
                    </div>
                    <div className="font-bold text-gray-900">
                      ${item.mrr.toLocaleString()}/mo
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">Churn Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Monthly Churn Rate</span>
                    <span className="text-2xl font-bold text-gray-900">3.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: "3.2%" }} />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Revenue Churn</span>
                    <span className="text-2xl font-bold text-gray-900">2.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "2.8%" }} />
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Net Revenue Retention</span>
                    <span className="text-2xl font-bold text-green-600">115%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
