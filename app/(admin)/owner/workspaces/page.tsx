"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Pause,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Workspace,
  subscribeToAllWorkspaces,
  updateWorkspaceStatus,
} from "@/lib/firebase/platform";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function OwnerWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  // Real-time subscription to all workspaces
  useEffect(() => {
    const unsubscribe = subscribeToAllWorkspaces((data) => {
      setWorkspaces(data);
    });

    return () => unsubscribe();
  }, []);

  // Filter workspaces
  useEffect(() => {
    let filtered = workspaces;

    if (searchQuery) {
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    if (planFilter !== "all") {
      filtered = filtered.filter((w) => w.plan === planFilter);
    }

    setFilteredWorkspaces(filtered);
  }, [workspaces, searchQuery, statusFilter, planFilter]);

  const handleStatusChange = async (workspaceId: string, newStatus: "active" | "suspended") => {
    try {
      await updateWorkspaceStatus(workspaceId, newStatus);
      toast({
        title: "Status Updated",
        description: `Workspace ${newStatus === "active" ? "activated" : "suspended"} successfully.`,
      });
    } catch (error) {
      console.error("Failed to update workspace status:", error);
      toast({
        title: "Error",
        description: "Failed to update workspace status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case "suspended":
        return <Badge variant="destructive"><Pause className="h-3 w-3 mr-1" />Suspended</Badge>;
      case "deleted":
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Deleted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: "bg-gray-500",
      starter: "bg-blue-500",
      pro: "bg-purple-600",
      agency: "bg-orange-500",
      enterprise: "bg-red-600",
    };
    return <Badge className={colors[plan as keyof typeof colors] || ""}>{plan.toUpperCase()}</Badge>;
  };

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspace Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all tenant workspaces across the platform
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Create a new workspace for a customer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Workspace Name</Label>
                  <Input placeholder="Acme Corp" />
                </div>
                <div>
                  <Label>Owner Email</Label>
                  <Input type="email" placeholder="owner@acme.com" />
                </div>
                <div>
                  <Label>Plan</Label>
                  <Select defaultValue="free">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button>Create Workspace</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Workspaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{workspaces.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {workspaces.filter((w) => w.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Suspended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {workspaces.filter((w) => w.status === "suspended").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Paying Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {workspaces.filter((w) => w.plan !== "free").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search workspaces or owners..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Workspaces Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">All Workspaces</CardTitle>
            <CardDescription>
              {filteredWorkspaces.length} workspace{filteredWorkspaces.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-purple-500" />
                        {workspace.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {workspace.owner_email}
                    </TableCell>
                    <TableCell>{getPlanBadge(workspace.plan)}</TableCell>
                    <TableCell>{getStatusBadge(workspace.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {workspace.channels.whatsapp_connected && (
                          <Badge variant="outline" className="text-xs bg-green-50">WA</Badge>
                        )}
                        {workspace.channels.instagram_connected && (
                          <Badge variant="outline" className="text-xs bg-pink-50">IG</Badge>
                        )}
                        {!(workspace.channels.whatsapp_connected || workspace.channels.instagram_connected) && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {workspace.usage.whatsapp_messages + workspace.usage.instagram_messages} msg
                      <br />
                      {workspace.usage.contacts} contacts
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {workspace.created_at?.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/owner/workspaces/${workspace.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        {workspace.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(workspace.id, "suspended")}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(workspace.id, "active")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
