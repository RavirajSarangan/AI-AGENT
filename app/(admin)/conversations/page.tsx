"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Mail,
  Tag,
  Pause,
  Play,
  UserPlus,
  Clock,
  MessageSquare,
  Instagram,
  User,
  Bot,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Conversation,
  Message,
  subscribeToConversations,
  subscribeToMessages,
  sendMessage as sendMessageToDb,
  markConversationAsRead,
  updateConversationStatus,
  addConversationTags,
} from "@/lib/firebase/conversations";
import {
  Contact,
  subscribeToContact,
  updateContact,
  addContactTags,
} from "@/lib/firebase/contacts";


export default function ConversationsPage() {
  const { userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [aiPaused, setAiPaused] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [contactNote, setContactNote] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time conversations subscription
  useEffect(() => {
    if (!userProfile?.currentTenant) return;

    const unsubscribe = subscribeToConversations(
      userProfile.currentTenant,
      (data) => {
        // Filter conversations for agents - show only assigned ones
        const filteredData =
          userProfile.role === "agent"
            ? data.filter((conv) => conv.assigned_to === userProfile.uid)
            : data;

        setConversations(filteredData);
        // Auto-select first conversation if none selected
        if (!selectedConversation && filteredData.length > 0) {
          setSelectedConversation(filteredData[0]);
        }
      }
    );

    return () => unsubscribe();
  }, [userProfile?.currentTenant, userProfile?.role, userProfile?.uid]);

  // Real-time messages subscription for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = subscribeToMessages(selectedConversation.id, (data) => {
      setMessages(data);
      markConversationAsRead(selectedConversation.id);
    });

    return () => unsubscribe();
  }, [selectedConversation?.id]);

  // Real-time contact subscription for selected conversation
  useEffect(() => {
    if (!selectedConversation?.contact_id) return;

    const unsubscribe = subscribeToContact(
      selectedConversation.contact_id,
      (data) => {
        setContact(data);
        if (data?.notes) setContactNote(data.notes);
      }
    );

    return () => unsubscribe();
  }, [selectedConversation?.contact_id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessageToDb({
        conversation_id: selectedConversation.id,
        sender: "agent",
        sender_name: userProfile?.displayName || "Agent",
        content: newMessage,
        status: "sent",
        metadata: {
          channel: selectedConversation.channel,
        },
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedConversation) return;

    try {
      await addConversationTags(selectedConversation.id, [newTag]);
      if (contact) {
        await addContactTags(contact.id, [newTag]);
      }
      setNewTag("");
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const handleSaveContactNote = async () => {
    if (!contact) return;

    try {
      await updateContact(contact.id, { notes: contactNote });
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleToggleAiPause = async () => {
    if (!selectedConversation) return;

    try {
      setAiPaused(!aiPaused);
      await updateConversationStatus(selectedConversation.id, selectedConversation.status);
    } catch (error) {
      console.error("Failed to toggle AI:", error);
    }
  };

  const getMessageSenderIcon = (sender: string, senderName?: string) => {
    if (sender === "user") return <User className="h-4 w-4" />;
    if (sender === "ai") return <Bot className="h-4 w-4" />;
    return senderName?.substring(0, 1) || "A";
  };

  const getMessageBgColor = (sender: string) => {
    if (sender === "user") return "bg-gray-100";
    if (sender === "ai") return "bg-purple-100";
    return "bg-blue-100";
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    const matchesChannel = channelFilter === "all" || conv.channel === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const stats = {
    total: conversations.length,
    active: conversations.filter((c) => c.status === "active").length,
    unread: conversations.reduce((sum, c) => sum + c.unread_count, 0),
    resolved: conversations.filter((c) => c.status === "resolved").length,
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner", "agent"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Conversations</h1>
          <p className="text-sm text-gray-400 mt-1">
            Unified inbox for WhatsApp and Instagram
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Inbox Layout */}
        <div className="grid grid-cols-12 gap-6 h-[700px]">
          {/* Conversations List */}
          <Card className="col-span-4 flex flex-col">
            <CardHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="snoozed">Snoozed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedConversation(conv)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedConversation(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedConversation?.id === conv.id
                        ? "bg-purple-50 border-2 border-purple-500"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conv.contact_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {conv.channel === "whatsapp" ? (
                            <Phone className="h-3 w-3 text-green-600" />
                          ) : (
                            <Instagram className="h-3 w-3 text-pink-600" />
                          )}
                          <span className="font-medium text-sm truncate">
                            {conv.contact_name}
                          </span>
                          {conv.unread_count > 0 && (
                            <Badge className="h-4 px-1.5 text-xs bg-purple-600">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {conv.last_message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {conv.last_message_time instanceof Date
                              ? conv.last_message_time.toLocaleTimeString()
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="col-span-5 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {selectedConversation.contact_name
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-white">
                          {selectedConversation.contact_name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.contact_phone ||
                            `@${selectedConversation.contact_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={aiPaused ? "default" : "outline"}
                        size="sm"
                        onClick={handleToggleAiPause}
                      >
                        {aiPaused ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume AI
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause AI
                          </>
                        )}
                      </Button>
                      <Select
                        value={selectedConversation.status}
                        onValueChange={(status: any) =>
                          updateConversationStatus(selectedConversation.id, status)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="snoozed">Snoozed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "user" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[70%] ${
                          msg.sender === "user" ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getMessageSenderIcon(msg.sender, msg.sender_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg p-3 ${getMessageBgColor(msg.sender)}`}>
                          {msg.sender !== "user" && (
                            <p className="text-xs font-medium text-gray-400 mb-1">
                              {msg.sender === "ai" ? "AI Assistant" : msg.sender_name}
                            </p>
                          )}
                          <p className="text-sm text-white">{msg.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {msg.timestamp instanceof Date
                              ? msg.timestamp.toLocaleTimeString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Composer */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">Select a conversation to view messages</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Contact Sidebar */}
          <Card className="col-span-3 flex flex-col">
            {selectedConversation && contact ? (
              <>
                <CardHeader>
                  <CardTitle className="font-bold text-white">
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-2xl">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-white">
                        {contact.name}
                      </h3>
                      {contact.phone && (
                        <p className="text-sm text-gray-400 flex items-center justify-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </p>
                      )}
                      {contact.email && (
                        <p className="text-sm text-gray-400 flex items-center justify-center gap-1 mt-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-sm font-medium text-white">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button size="sm" onClick={handleAddTag}>
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="text-sm font-medium text-white">Notes</Label>
                    <Textarea
                      placeholder="Add notes about this contact..."
                      className="mt-2"
                      rows={4}
                      value={contactNote}
                      onChange={(e) => setContactNote(e.target.value)}
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={handleSaveContactNote}
                    >
                      Save Note
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm text-white">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Conversations:</span>
                        <span className="font-medium">{contact.conversation_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Contacted:</span>
                        <span className="font-medium">
                          {contact.last_contacted instanceof Date
                            ? contact.last_contacted.toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Channel:</span>
                        <span className="font-medium capitalize">
                          {contact.channel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <UserPlus className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Conversation History
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">
                    Select a conversation to view contact details
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
