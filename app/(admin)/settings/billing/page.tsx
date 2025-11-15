"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  Loader2,
  CreditCard,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Instagram,
  Zap,
  Users,
  Calendar,
  XCircle,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const TENANT_ID = "tenant-1";

// Mock usage data for graphs
const usageData = [
  { date: "Jan 1", whatsapp: 450, instagram: 120 },
  { date: "Jan 5", whatsapp: 680, instagram: 190 },
  { date: "Jan 10", whatsapp: 890, instagram: 250 },
  { date: "Jan 15", whatsapp: 1200, instagram: 310 },
  { date: "Jan 20", whatsapp: 1580, instagram: 420 },
  { date: "Jan 25", whatsapp: 1920, instagram: 550 },
  { date: "Today", whatsapp: 2340, instagram: 680 },
];

const workflowData = [
  { name: "Pricing Q&A", executions: 892 },
  { name: "Lead Capture", executions: 645 },
  { name: "After Hours", executions: 421 },
  { name: "FAQ Bot", executions: 312 },
  { name: "Order Status", executions: 245 },
];

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: "paid" | "pending" | "failed";
  pdfUrl: string;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const currentPlan = "pro";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Real-time subscription to settings
  useEffect(() => {
    setLoading(false);
  }, []);

  // Current plan data
  const plans = {
    free: {
      name: "Free",
      price: 0,
      whatsappMessages: 200,
      instagramMessages: 0,
      workflows: "Limited",
      teamMembers: 1,
      aiReplies: "Limited",
    },
    starter: {
      name: "Starter",
      price: billingCycle === "monthly" ? 39 : 390,
      whatsappMessages: 2000,
      instagramMessages: 1000,
      workflows: "Unlimited",
      teamMembers: 3,
      aiReplies: "Unlimited",
    },
    pro: {
      name: "Pro",
      price: billingCycle === "monthly" ? 149 : 1490,
      whatsappMessages: 10000,
      instagramMessages: 5000,
      workflows: "Unlimited",
      teamMembers: "Unlimited",
      aiReplies: "Unlimited",
    },
  };

  const activePlan = plans[currentPlan as keyof typeof plans];

  // Current usage
  const usage = {
    whatsappMessages: 3812,
    whatsappLimit: activePlan.whatsappMessages,
    instagramMessages: 842,
    instagramLimit: activePlan.instagramMessages,
    workflowExecutions: 12493,
    teamMembers: 5,
  };

  const whatsappPercentage = (usage.whatsappMessages / usage.whatsappLimit) * 100;
  const instagramPercentage = usage.instagramLimit > 0 ? (usage.instagramMessages / usage.instagramLimit) * 100 : 0;

  // Next billing date
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  // Invoices
  const invoices: Invoice[] = [
    {
      id: "INV-10023",
      date: new Date("2025-01-12"),
      amount: 149,
      status: "paid",
      pdfUrl: "/invoices/INV-10023.pdf",
    },
    {
      id: "INV-10022",
      date: new Date("2024-12-12"),
      amount: 149,
      status: "paid",
      pdfUrl: "/invoices/INV-10022.pdf",
    },
    {
      id: "INV-10021",
      date: new Date("2024-11-12"),
      amount: 149,
      status: "paid",
      pdfUrl: "/invoices/INV-10021.pdf",
    },
  ];

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId}...`);
  };

  const handleChangePlan = (newPlan: string) => {
    setShowUpgradeModal(true);
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Billing & Usage</h1>
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Real-time
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Manage your subscription, track usage, and view invoices
          </p>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          {/* Plan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">{activePlan.name} Plan</CardTitle>
                  <CardDescription>
                    ${activePlan.price}/{billingCycle === "monthly" ? "month" : "year"}
                  </CardDescription>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-bold text-white">WhatsApp Messages</span>
                  </div>
                  <p className="text-lg font-bold">
                    {activePlan.whatsappMessages.toLocaleString()}/month
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    <span className="text-sm font-bold text-white">Instagram DMs</span>
                  </div>
                  <p className="text-lg font-bold">
                    {typeof activePlan.instagramMessages === 'number' 
                      ? activePlan.instagramMessages.toLocaleString() 
                      : activePlan.instagramMessages}/month
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-white">Workflow Runs</span>
                  </div>
                  <p className="text-lg font-bold">{activePlan.workflows}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-bold text-white">Team Members</span>
                  </div>
                  <p className="text-lg font-bold">{activePlan.teamMembers}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Next billing: <strong>{nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleChangePlan("enterprise")}
                >
                  Upgrade Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                >
                  Switch to {billingCycle === "monthly" ? "Yearly" : "Monthly"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Summary - Meters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-bold text-white">
                <TrendingUp className="h-5 w-5" />
                Usage This Billing Cycle
              </CardTitle>
              <CardDescription>
                Track your consumption across all channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WhatsApp Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-sm">WhatsApp Messages</span>
                  </div>
                  <span className="text-sm font-bold">
                    {usage.whatsappMessages.toLocaleString()} / {usage.whatsappLimit.toLocaleString()}
                  </span>
                </div>
                <Progress value={whatsappPercentage} className="h-3" />
                <div className="flex justify-between items-center">
                  <Badge variant={whatsappPercentage >= 80 ? "destructive" : "secondary"}>
                    {whatsappPercentage.toFixed(1)}% used
                  </Badge>
                  {whatsappPercentage >= 80 && (
                    <p className="text-xs text-destructive font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Approaching limit
                    </p>
                  )}
                </div>
              </div>

              {/* Instagram Usage */}
              {usage.instagramLimit > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      <span className="font-bold text-sm">Instagram DMs</span>
                    </div>
                    <span className="text-sm font-bold">
                      {usage.instagramMessages.toLocaleString()} / {usage.instagramLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={instagramPercentage} className="h-3" />
                  <Badge variant="secondary">{instagramPercentage.toFixed(1)}% used</Badge>
                </div>
              )}

              {/* Workflow Executions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-sm">Workflow Executions</span>
                  </div>
                  <span className="text-sm font-bold">
                    {usage.workflowExecutions.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ✅ Unlimited on {activePlan.name} plan
                </p>
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-sm">Team Members</span>
                  </div>
                  <span className="text-sm font-bold">
                    {usage.teamMembers} active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {typeof activePlan.teamMembers === 'number' 
                    ? `${usage.teamMembers} / ${activePlan.teamMembers} limit` 
                    : "✅ Unlimited on your plan"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Graph */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-white">Daily Message Usage</CardTitle>
              <CardDescription>
                Message volume over the current billing period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
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

          {/* Top Workflows */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-white">Top 5 Workflows by Usage</CardTitle>
              <CardDescription>
                Most executed workflows this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={workflowData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" style={{ fontSize: "12px" }} />
                  <YAxis dataKey="name" type="category" width={120} style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Bar dataKey="executions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3 bg-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-14 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 11/28</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">Update Card</Button>

              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-bold text-white">Billing Email</p>
                <p className="text-sm text-muted-foreground">billing@flowreplyai.com</p>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Change Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm">{invoice.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      ${invoice.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={(() => {
                        if (invoice.status === "paid") return "default";
                        if (invoice.status === "pending") return "secondary";
                        return "destructive";
                      })()}
                      className="text-xs"
                    >
                      {invoice.status === "paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {invoice.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                      {invoice.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs gap-1"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2">View All Invoices</Button>
            </CardContent>
          </Card>

          {/* Subscription Actions */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-red-900">Subscription Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full bg-white"
                onClick={() => alert("Pausing subscription...")}
              >
                Pause Subscription
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
              <p className="text-xs text-red-800 mt-2">
                ⚠️ Cancellation takes effect at the end of your billing period
              </p>
            </CardContent>
          </Card>

          {/* Usage Alert */}
          {whatsappPercentage >= 80 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-yellow-900 mb-1">Usage Alert</p>
                    <p className="text-yellow-800 mb-2">
                      You've used {whatsappPercentage.toFixed(0)}% of your WhatsApp messages this month.
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => handleChangePlan("pro")}
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive font-bold">
                <XCircle className="h-5 w-5" />
                Cancel Subscription?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel your {activePlan.name} subscription? You will lose access to:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Automated workflows</li>
                <li>AI-powered responses</li>
                <li>WhatsApp & Instagram integrations</li>
                <li>Team collaboration features</li>
              </ul>
              <p className="text-sm font-medium">
                Access continues until {nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Subscription
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    alert("Subscription canceled. Access until: " + nextBillingDate.toDateString());
                    setShowCancelModal(false);
                  }}
                >
                  Yes, Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-bold">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Upgrade Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your plan upgrade will take effect immediately and you'll be charged the prorated amount.
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    alert("Plan upgraded successfully!");
                    setShowUpgradeModal(false);
                  }}
                >
                  Confirm Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
