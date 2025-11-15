"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Pause,
  Play,
  Phone,
  Mail,
  Tag,
  X,
  Clock,
  MessageSquare,
  Bot,
  User,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Message {
  id: string;
  type: "in" | "out";
  content: string;
  timestamp: Date;
  sender: "user" | "ai" | "admin" | "workflow";
  workflowName?: string;
  status: "sent" | "delivered" | "read" | "failed";
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  email?: string;
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
}

interface Conversation {
  id: string;
  contactId: string;
  status: "open" | "closed";
  aiPaused: boolean;
  messages: Message[];
  notes: string;
}

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - will be replaced with real-time Firestore
  const [contact, setContact] = useState<Contact>({
    id: "c-1",
    name: "Luna Morales",
    phone: "+1 555-100-1234",
    email: "luna@example.com",
    firstSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastSeen: new Date(),
    tags: ["Lead", "Urgent", "VIP"],
  });

  const [conversation, setConversation] = useState<Conversation>({
    id: conversationId,
    contactId: "c-1",
    status: "open",
    aiPaused: false,
    messages: [
      {
        id: "m1",
        type: "in",
        content: "Hi, what are your prices?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sender: "user",
        status: "read",
      },
      {
        id: "m2",
        type: "out",
        content: "Our pricing tiers are posted in the catalog.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
        sender: "workflow",
        workflowName: "Pricing Flow",
        status: "read",
      },
      {
        id: "m3",
        type: "in",
        content: "Can you break down the Enterprise one?",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        sender: "user",
        status: "read",
      },
      {
        id: "m4",
        type: "out",
        content: "Sure! Enterprise includes unlimited automation workflows, dedicated support, and custom integrations.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15000),
        sender: "ai",
        status: "read",
      },
    ],
    notes: "Escalate to the CRM if pricing changes apply.",
  });

  const [newMessage, setNewMessage] = useState("");
  const [newTag, setNewTag] = useState("");
  const [notes, setNotes] = useState(conversation.notes);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  // Real-time listener (TODO: implement with Firestore)
  useEffect(() => {
    // const unsubscribe = onSnapshot(
    //   doc(db, "conversations", conversationId),
    //   (doc) => {
    //     setConversation(doc.data());
    //   }
    // );
    // return () => unsubscribe();
  }, [conversationId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `m${Date.now()}`,
      type: "out",
      content: newMessage,
      timestamp: new Date(),
      sender: "admin",
      status: "sent",
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
    setNewMessage("");

    // TODO: Send to backend/WhatsApp API
  };

  const toggleAI = () => {
    setConversation((prev) => ({
      ...prev,
      aiPaused: !prev.aiPaused,
    }));
    // TODO: Update in Firestore
  };

  const toggleStatus = () => {
    setConversation((prev) => ({
      ...prev,
      status: prev.status === "open" ? "closed" : "open",
    }));
    // TODO: Update in Firestore
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    setContact((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));
    setNewTag("");
    // TODO: Update in Firestore
  };

  const removeTag = (tag: string) => {
    setContact((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
    // TODO: Update in Firestore
  };

  const saveNotes = () => {
    setConversation((prev) => ({
      ...prev,
      notes,
    }));
    // TODO: Update in Firestore
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getSenderIcon = (sender: Message["sender"]) => {
    switch (sender) {
      case "ai":
        return <Bot className="h-3 w-3" />;
      case "workflow":
        return <Workflow className="h-3 w-3" />;
      case "admin":
        return <User className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Chat Window */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={contact.avatar} />
              <AvatarFallback>
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{contact.name}</h2>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={conversation.status === "open" ? "default" : "secondary"}>
              {conversation.status}
            </Badge>
            <Button
              variant={conversation.aiPaused ? "default" : "outline"}
              size="sm"
              onClick={toggleAI}
            >
              {conversation.aiPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume AI
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-4">
          <div className="space-y-4">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === "out" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    message.type === "out"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  {message.type === "out" && message.sender !== "admin" && (
                    <div className="mb-1 flex items-center gap-1 text-xs opacity-80">
                      {getSenderIcon(message.sender)}
                      <span>
                        {message.sender === "ai"
                          ? "AI Reply"
                          : message.workflowName || "Workflow"}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-xs opacity-70">
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-border bg-card p-4">
          {conversation.aiPaused && (
            <div className="mb-2 rounded-md bg-yellow-500/10 p-2 text-sm text-yellow-600">
              AI is paused for this conversation. Your messages will be sent manually.
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 space-y-4 overflow-y-auto border-l border-border bg-card p-4">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.phone}</span>
            </div>
            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>First seen: {contact.firstSeen.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>Last seen: {contact.lastSeen.toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button size="icon" variant="outline" onClick={addTag}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="status-toggle">
                {conversation.status === "open" ? "Open" : "Closed"}
              </Label>
              <Switch
                id="status-toggle"
                checked={conversation.status === "open"}
                onCheckedChange={toggleStatus}
              />
            </div>
          </CardContent>
        </Card>

        {/* Internal Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="Add internal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <Button size="sm" onClick={saveNotes} className="w-full">
              Save Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
