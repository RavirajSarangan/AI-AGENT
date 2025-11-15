"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Save,
  Play,
  Trash2,
  GripVertical,
  Bot,
  MessageSquare,
  GitBranch,
  Globe,
  Tag as TagIcon,
  ChevronDown,
  ChevronUp,
  Zap,
  TestTube,
  AlertCircle,
  CheckCircle2,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import type { WorkflowConfig, WorkflowTestResult } from "@/types/workflow";
import type { WorkflowNode as VisualWorkflowNode } from "@/types/visual-workflow";

interface LocalWorkflowNode {
  id: string;
  type: "condition" | "ai" | "send_message" | "http_request" | "tag";
  config: Record<string, any>;
  expanded: boolean;
}

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [isActive, setIsActive] = useState(false);
  const [triggerType, setTriggerType] = useState("incoming_message");
  const [triggerCondition, setTriggerCondition] = useState("always");
  const [triggerValue, setTriggerValue] = useState("");

  const [nodes, setNodes] = useState<LocalWorkflowNode[]>([
    {
      id: "node-1",
      type: "condition",
      config: {
        field: "message.text",
        operator: "contains",
        value: "price",
      },
      expanded: true,
    },
  ]);

  const addNode = (type: LocalWorkflowNode["type"]) => {
    const newNode: LocalWorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      config: {},
      expanded: true,
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id));
  };

  const toggleNode = (id: string) => {
    setNodes(
      nodes.map((n) => (n.id === id ? { ...n, expanded: !n.expanded } : n))
    );
  };

  const updateNodeConfig = (id: string, config: Record<string, any>) => {
    setNodes(nodes.map((n) => (n.id === id ? { ...n, config } : n)));
  };

  const moveNode = (id: string, direction: "up" | "down") => {
    const index = nodes.findIndex((n) => n.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === nodes.length - 1) return;

    const newNodes = [...nodes];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newNodes[index], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[index]];
    setNodes(newNodes);
  };

  const handleSave = () => {
    // TODO: Save to Firestore
    console.log("Saving workflow:", {
      name: workflowName,
      active: isActive,
      trigger: { type: triggerType, condition: triggerCondition, value: triggerValue },
      nodes,
    });
    router.push("/workflows");
  };

  const getNodeIcon = (type: LocalWorkflowNode["type"]) => {
    switch (type) {
      case "condition":
        return <GitBranch className="h-4 w-4" />;
      case "ai":
        return <Bot className="h-4 w-4" />;
      case "send_message":
        return <MessageSquare className="h-4 w-4" />;
      case "http_request":
        return <Globe className="h-4 w-4" />;
      case "tag":
        return <TagIcon className="h-4 w-4" />;
    }
  };

  const getNodeTitle = (type: LocalWorkflowNode["type"]) => {
    switch (type) {
      case "condition":
        return "Condition";
      case "ai":
        return "AI Response";
      case "send_message":
        return "Send WhatsApp Message";
      case "http_request":
        return "HTTP Request";
      case "tag":
        return "Add Tag";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground">Create automated conversation flows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/workflows")}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: Workflow Canvas */}
        <div className="space-y-4">
          {/* Workflow Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Label htmlFor="active-toggle">Active</Label>
                  <Switch
                    id="active-toggle"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Trigger Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Trigger
              </CardTitle>
              <CardDescription>When should this workflow run?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming_message">Incoming WhatsApp Message</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="schedule">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {triggerType === "incoming_message" && (
                <>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={triggerCondition} onValueChange={setTriggerCondition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always (all messages)</SelectItem>
                        <SelectItem value="new_contact">Only new contacts</SelectItem>
                        <SelectItem value="business_hours">Only during business hours</SelectItem>
                        <SelectItem value="tagged">Only tagged contacts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {triggerCondition === "tagged" && (
                    <Input
                      placeholder="Enter tag name"
                      value={triggerValue}
                      onChange={(e) => setTriggerValue(e.target.value)}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Workflow Steps */}
          <div className="space-y-2">
            {nodes.map((node, index) => (
              <Card key={node.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        {getNodeIcon(node.type)}
                      </div>
                      <div>
                        <p className="font-medium">{getNodeTitle(node.type)}</p>
                        <p className="text-xs text-muted-foreground">Step {index + 1}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveNode(node.id, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveNode(node.id, "down")}
                        disabled={index === nodes.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleNode(node.id)}
                      >
                        {node.expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNode(node.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {node.expanded && (
                  <CardContent>
                    <NodeConfiguration
                      node={node}
                      onChange={(config) => updateNodeConfig(node.id, config)}
                    />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Add Step Button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => addNode("condition")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </div>

        {/* Right: Node Library */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Nodes</CardTitle>
              <CardDescription>Click to add to your workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addNode("condition")}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Condition
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addNode("ai")}
              >
                <Bot className="mr-2 h-4 w-4" />
                AI Response
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addNode("send_message")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addNode("http_request")}
              >
                <Globe className="mr-2 h-4 w-4" />
                HTTP Request
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addNode("tag")}
              >
                <TagIcon className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <code className="rounded bg-muted px-1 py-0.5">{`{{message.text}}`}</code>
                <p className="text-xs text-muted-foreground">Incoming message</p>
              </div>
              <div>
                <code className="rounded bg-muted px-1 py-0.5">{`{{contact.name}}`}</code>
                <p className="text-xs text-muted-foreground">Contact name</p>
              </div>
              <div>
                <code className="rounded bg-muted px-1 py-0.5">{`{{contact.phone}}`}</code>
                <p className="text-xs text-muted-foreground">Phone number</p>
              </div>
              <div>
                <code className="rounded bg-muted px-1 py-0.5">{`{{ai.response}}`}</code>
                <p className="text-xs text-muted-foreground">AI node output</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Node Configuration Components
function NodeConfiguration({
  node,
  onChange,
}: {
  node: LocalWorkflowNode;
  onChange: (config: Record<string, any>) => void;
}) {
  switch (node.type) {
    case "condition":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Field</Label>
            <Select
              value={node.config.field || "message.text"}
              onValueChange={(value) => onChange({ ...node.config, field: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="message.text">Message Text</SelectItem>
                <SelectItem value="contact.tag">Contact Tag</SelectItem>
                <SelectItem value="time">Time of Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Operator</Label>
            <Select
              value={node.config.operator || "contains"}
              onValueChange={(value) => onChange({ ...node.config, operator: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="regex">Regex Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              value={node.config.value || ""}
              onChange={(e) => onChange({ ...node.config, value: e.target.value })}
              placeholder="e.g. price"
            />
          </div>
        </div>
      );

    case "ai":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Prompt Template</Label>
            <Textarea
              value={node.config.prompt || ""}
              onChange={(e) => onChange({ ...node.config, prompt: e.target.value })}
              placeholder="Respond to: {{message.text}}"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select
              value={node.config.tone || "support"}
              onValueChange={(value) => onChange({ ...node.config, tone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="support">Professional Support</SelectItem>
                <SelectItem value="sales">Friendly Sales</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "send_message":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Message Content</Label>
            <Textarea
              value={node.config.content || ""}
              onChange={(e) => onChange({ ...node.config, content: e.target.value })}
              placeholder="Use {{ai.response}} or write static text"
              rows={4}
            />
          </div>
        </div>
      );

    case "http_request":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Method</Label>
            <Select
              value={node.config.method || "POST"}
              onValueChange={(value) => onChange({ ...node.config, method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={node.config.url || ""}
              onChange={(e) => onChange({ ...node.config, url: e.target.value })}
              placeholder="https://api.example.com/webhook"
            />
          </div>
          <div className="space-y-2">
            <Label>Body (JSON)</Label>
            <Textarea
              value={node.config.body || ""}
              onChange={(e) => onChange({ ...node.config, body: e.target.value })}
              placeholder='{"contact": "{{contact.phone}}"}'
              rows={3}
            />
          </div>
        </div>
      );

    case "tag":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Tag Name</Label>
            <Input
              value={node.config.tag || ""}
              onChange={(e) => onChange({ ...node.config, tag: e.target.value })}
              placeholder="Lead, VIP, Support..."
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
