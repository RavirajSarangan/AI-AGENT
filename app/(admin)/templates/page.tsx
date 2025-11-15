"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
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
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  MessageSquare,
  Instagram,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageTemplate,
  subscribeToTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/firebase/templates";

export default function TemplatesPage() {
  const { userProfile } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "general",
    channel: "both" as "whatsapp" | "instagram" | "both",
  });

  // Real-time templates subscription
  useEffect(() => {
    if (!userProfile?.currentTenant) return;

    const unsubscribe = subscribeToTemplates(userProfile.currentTenant, (data) => {
      setTemplates(data);
    });

    return () => unsubscribe();
  }, [userProfile?.currentTenant]);

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = (template?: MessageTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        content: template.content,
        category: template.category,
        channel: template.channels?.[0] || "whatsapp",
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        content: "",
        category: "general",
        channel: "both",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      name: "",
      content: "",
      category: "general",
      channel: "both",
    });
  };

  const handleSave = async () => {
    if (!userProfile?.currentTenant) return;
    if (!formData.name.trim() || !formData.content.trim()) {
      alert("Name and content are required");
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        await updateTemplate(editingTemplate.id, {
          name: formData.name,
          content: formData.content,
          category: formData.category as "greeting" | "sales" | "support" | "marketing" | "custom",
          channels: formData.channel === "both" ? ["whatsapp", "instagram"] : [formData.channel as "whatsapp" | "instagram"],
        } as any);
      } else {
        // Create new template
        await createTemplate(userProfile.currentTenant, {
          name: formData.name,
          content: formData.content,
          category: formData.category as "greeting" | "sales" | "support" | "marketing" | "custom",
          channels: formData.channel === "both" ? ["whatsapp", "instagram"] : [formData.channel as "whatsapp" | "instagram"],
          variables: [],
          language: "en",
          status: "active",
          created_by: userProfile.uid,
        } as any);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Failed to save template. Please try again.");
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"?`)) return;

    try {
      await deleteTemplate(templateId);
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Failed to delete template. Please try again.");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Template content copied to clipboard!");
  };

  const insertVariable = (variable: string) => {
    setFormData({
      ...formData,
      content: formData.content + `{{${variable}}}`,
    });
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Templates
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage message templates for quick responses
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Greetings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.filter((t) => t.category === "greeting").length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.filter((t) => t.category === "sales").length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Support</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.filter((t) => t.category === "support").length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="greeting">Greeting</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Templates Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium text-gray-900">
                        {template.name}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-gray-700 truncate">
                          {template.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {template.channels?.includes("whatsapp") && (
                            <MessageSquare className="h-4 w-4 text-green-500" />
                          )}
                          {template.channels?.includes("instagram") && (
                            <Instagram className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {template.usage_count || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(template.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template.id, template.name)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-600">
                      {searchQuery || categoryFilter !== "all"
                        ? "No templates match your filters"
                        : "No templates yet. Create your first template!"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "New Template"}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate
                  ? "Update your message template"
                  : "Create a new message template for quick responses"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Welcome Message"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  rows={6}
                  placeholder="Enter your template message here..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <p className="text-xs text-gray-600 w-full">Insert variables:</p>
                  {["name", "phone", "email", "order_id", "agent_name"].map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => insertVariable(v)}
                    >
                      {`{{${v}}}`}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greeting">Greeting</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, channel: value })
                    }
                  >
                    <SelectTrigger id="channel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingTemplate ? "Update" : "Create"} Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
