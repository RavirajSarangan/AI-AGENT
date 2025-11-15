"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Play, Edit, Copy, Trash } from "lucide-react";

// Mock data
const workflows = [
  {
    id: "1",
    name: "Lead Capture",
    description: "Capture leads and send to CRM",
    trigger: "incoming_message",
    enabled: true,
    lastRun: "2 min ago",
    totalRuns: 145,
    successRate: 98,
    status: "active",
  },
  {
    id: "2",
    name: "Order Status",
    description: "Provide order status updates",
    trigger: "incoming_message",
    enabled: true,
    lastRun: "15 min ago",
    totalRuns: 98,
    successRate: 92,
    status: "active",
  },
  {
    id: "3",
    name: "After Hours Support",
    description: "Auto-reply outside business hours",
    trigger: "incoming_message",
    enabled: true,
    lastRun: "1 hour ago",
    totalRuns: 54,
    successRate: 100,
    status: "active",
  },
  {
    id: "4",
    name: "FAQ Handler",
    description: "Answer common questions",
    trigger: "incoming_message",
    enabled: false,
    lastRun: "3 days ago",
    totalRuns: 12,
    successRate: 85,
    status: "inactive",
  },
];

export default function WorkflowsListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">
            Automate your WhatsApp conversations with workflows
          </p>
        </div>
        <Button asChild>
          <Link href="/app/workflows/new">
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workflows..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Workflows Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Runs</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{workflow.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workflow.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {workflow.trigger.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={workflow.enabled} />
                    <span className="text-sm">
                      {workflow.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{workflow.totalRuns}</TableCell>
                <TableCell>
                  <Badge
                    variant={workflow.successRate >= 95 ? "default" : "secondary"}
                  >
                    {workflow.successRate}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {workflow.lastRun}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/app/workflows/${workflow.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/app/workflows/${workflow.id}/logs`}>
                          <Play className="mr-2 h-4 w-4" />
                          View Logs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Workflows</div>
          <div className="text-2xl font-bold">{workflows.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Workflows</div>
          <div className="text-2xl font-bold">
            {workflows.filter((w) => w.enabled).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Executions</div>
          <div className="text-2xl font-bold">
            {workflows.reduce((sum, w) => sum + w.totalRuns, 0)}
          </div>
        </Card>
      </div>
    </div>
  );
}
