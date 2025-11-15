"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Bot, 
  Clock, 
  TrendingUp, 
  Users, 
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { subscribeToConversations, Conversation } from "@/lib/firebase/conversations";
import { subscribeToContacts, Contact } from "@/lib/firebase/contacts";
import { subscribeToWorkflows, Workflow } from "@/lib/firebase/workflows";
import { subscribeToExecutionLogs, ExecutionLog } from "@/lib/firebase/execution-logs";



export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

  // Real-time subscriptions
  useEffect(() => {
    if (!userProfile?.currentTenant) return;

    const unsubConv = subscribeToConversations(userProfile.currentTenant, setConversations);
    const unsubContacts = subscribeToContacts(userProfile.currentTenant, setContacts);
    const unsubWorkflows = subscribeToWorkflows(userProfile.currentTenant, setWorkflows);
    const unsubLogs = subscribeToExecutionLogs(userProfile.currentTenant, setExecutionLogs);

    return () => {
      unsubConv();
      unsubContacts();
      unsubWorkflows();
      unsubLogs();
    };
  }, [userProfile?.currentTenant]);

  // Calculate real KPIs
  const kpis = useMemo(() => {
    const totalConv = conversations.length;
    
    const getTimestamp = (lastContact: any): number => {
      if (lastContact instanceof Date) return lastContact.getTime();
      if (typeof lastContact === 'number') return lastContact;
      return 0;
    };
    
    const activeContacts = contacts.filter(c => {
      const lastContact = c.last_contacted;
      if (!lastContact) return false;
      const timestamp = getTimestamp(lastContact);
      const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;

    const aiReplies = executionLogs.filter(log => log.status === 'success').length;
    const totalMessages = executionLogs.length;
    const autoReplyRate = totalMessages > 0 ? Math.round((aiReplies / totalMessages) * 100) : 0;

    const successLogs = executionLogs.filter(log => log.status === 'success' && log.duration);
    const avgDuration = successLogs.length > 0
      ? successLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / successLogs.length
      : 0;

    return [
      { label: "Total Conversations", value: totalConv.toString(), change: "+12%", trend: "up", icon: MessageSquare, color: "text-blue-500" },
      { label: "Auto-Reply Rate", value: `${autoReplyRate}%`, change: "+5%", trend: "up", icon: Bot, color: "text-green-500" },
      { label: "Avg Response Time", value: `${(avgDuration / 1000).toFixed(1)}s`, change: "-18%", trend: "down", icon: Clock, color: "text-purple-500" },
      { label: "Active Contacts", value: activeContacts.toString(), change: "+8%", trend: "up", icon: Users, color: "text-orange-500" },
    ];
  }, [conversations, contacts, executionLogs]);

  // Recent activity from execution logs
  const recentActivity = useMemo(() => {
    const getStartedAt = (started_at: any): Date | null => {
      if (started_at instanceof Date) return started_at;
      if (started_at?.toDate) return started_at.toDate();
      return null;
    };
    
    return executionLogs
      .slice(0, 5)
      .map(log => {
        const startedAt = getStartedAt(log.started_at);
        
        return {
          id: log.id,
          type: log.status === 'error' ? 'error' : 'workflow' as const,
          message: `Workflow executed: ${log.workflow_id}`,
          time: startedAt ? startedAt.toLocaleTimeString() : 'Unknown',
          status: log.status,
        };
      });
  }, [executionLogs]);

  // Workflow runs stats
  const workflowRuns = useMemo(() => {
    return workflows.map(workflow => {
      const workflowLogs = executionLogs.filter(log => log.workflow_id === workflow.id);
      const successLogs = workflowLogs.filter(log => log.status === 'success');
      const avgDur = successLogs.length > 0
        ? successLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / successLogs.length
        : 0;
      const successRate = workflowLogs.length > 0
        ? Math.round((successLogs.length / workflowLogs.length) * 100)
        : 0;

      return {
        name: workflow.name,
        status: workflow.is_active ? 'Active' : 'Inactive',
        runs: workflowLogs.length,
        duration: `${(avgDur / 1000).toFixed(1)}s`,
        success: successRate,
      };
    });
  }, [workflows, executionLogs]);
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting()}, {user?.displayName?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your WhatsApp automation today
          </p>
        </div>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />

        {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.label}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-green-500" />
                )}
                <span className="text-green-500">{kpi.change}</span>
                <span>from last week</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart Area */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Conversation Analytics</CardTitle>
                <CardDescription>
                  Messages and auto-replies over the last 7 days
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="7days" className="space-y-4">
              <TabsList>
                <TabsTrigger value="7days">7 Days</TabsTrigger>
                <TabsTrigger value="30days">30 Days</TabsTrigger>
                <TabsTrigger value="90days">90 Days</TabsTrigger>
              </TabsList>
              <TabsContent value="7days" className="space-y-4">
                <div className="h-[300px] rounded-lg border bg-muted/50 p-4 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Chart visualization placeholder</p>
                    <p className="text-xs mt-1">Integration with recharts for analytics</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Real-time events from your automation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>
                Execution stats for your active workflows
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/workflows">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowRuns.map((workflow) => (
              <div
                key={workflow.name}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{workflow.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workflow.runs} executions today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{workflow.success}%</p>
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{workflow.duration}</p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                  <Badge variant={workflow.status === "Success" ? "default" : "secondary"}>
                    {workflow.status}
                  </Badge>
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
