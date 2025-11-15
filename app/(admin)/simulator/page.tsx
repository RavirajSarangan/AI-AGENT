"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Bot, User, MessageSquare, Instagram } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Contact,
  subscribeToContacts,
  createContact,
} from "@/lib/firebase/contacts";
import {
  createConversation,
  sendMessage,
  subscribeToMessages,
  Message,
} from "@/lib/firebase/conversations";

export default function SimulatorPage() {
  const { userProfile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "instagram">("whatsapp");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time contacts subscription
  useEffect(() => {
    if (!userProfile?.currentTenant) return;

    const unsubscribe = subscribeToContacts(userProfile.currentTenant, (data) => {
      setContacts(data);
    });

    return () => unsubscribe();
  }, [userProfile?.currentTenant]);

  // Real-time messages subscription
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (data) => {
      setMessages(data);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateContact = async () => {
    if (!userProfile?.currentTenant) return;

    const name = prompt("Enter contact name:");
    if (!name) return;

    const phone = prompt("Enter phone number (optional):");
    const email = prompt("Enter email (optional):");

    try {
      const contactId = await createContact({
        name,
        phone: phone || undefined,
        email: email || undefined,
        channel,
        tenant_id: userProfile.currentTenant,
        tags: [],
        custom_fields: {},
        last_contacted: new Date(),
        conversation_count: 0,
      });

      // Select the newly created contact
      const newContact = {
        id: contactId,
        name,
        phone: phone || "",
        email: email || "",
        channel,
        tags: [],
        custom_fields: {},
        last_contacted: new Date(),
        conversation_count: 0,
        tenant_id: userProfile.currentTenant,
        created_at: new Date(),
        updated_at: new Date(),
      } as Contact;

      setSelectedContact(newContact);
    } catch (error) {
      console.error("Failed to create contact:", error);
      alert("Failed to create contact. Please try again.");
    }
  };

  const handleStartConversation = async () => {
    if (!selectedContact || !userProfile?.currentTenant) return;

    try {
      const convId = await createConversation({
        tenant_id: userProfile.currentTenant,
        contact_id: selectedContact.id,
        contact_name: selectedContact.name,
        contact_phone: selectedContact.phone,
        channel,
        status: "active",
        last_message: "",
        last_message_time: new Date(),
        unread_count: 0,
        tags: [],
      });

      setConversationId(convId);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to start conversation. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !selectedContact) return;

    try {
      await sendMessage({
        conversation_id: conversationId,
        sender: "user",
        sender_name: selectedContact.name,
        content: newMessage,
        status: "sent",
        metadata: {
          channel,
        },
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Customer Simulator
          </h1>
          <p className="text-gray-400 mt-2">
            Test your workflows and AI responses by simulating customer messages
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Contact Selector */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="font-bold text-white">Select Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Channel</Label>
                <Select
                  value={channel}
                  onValueChange={(value: any) => setChannel(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        WhatsApp
                      </div>
                    </SelectItem>
                    <SelectItem value="instagram">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-purple-500" />
                        Instagram
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Existing Contact</Label>
                <Select
                  value={selectedContact?.id || ""}
                  onValueChange={(value) => {
                    const contact = contacts.find((c) => c.id === value);
                    setSelectedContact(contact || null);
                    setConversationId(null);
                    setMessages([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} {contact.phone && `(${contact.phone})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleCreateContact} variant="outline">
                  Create New Contact
                </Button>
                {selectedContact && !conversationId && (
                  <Button onClick={handleStartConversation}>
                    Start Conversation
                  </Button>
                )}
              </div>

              {selectedContact && (
                <div className="pt-4 border-t">
                  <h3 className="font-bold text-sm text-white mb-2">
                    Selected Contact
                  </h3>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {selectedContact.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {selectedContact.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {selectedContact.phone || selectedContact.email || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="col-span-8">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="font-bold text-white">
                  {selectedContact ? selectedContact.name : "No contact selected"}
                </CardTitle>
                {conversationId && (
                  <Badge variant="outline" className="capitalize">
                    {channel}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {conversationId ? (
                <>
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto p-4 space-y-3">
                    {messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === "user" ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender === "user"
                                ? "bg-gray-100 text-white"
                                : msg.sender === "ai"
                                ? "bg-purple-100 text-white"
                                : "bg-blue-100 text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {msg.sender === "user" ? (
                                <User className="h-3 w-3" />
                              ) : msg.sender === "ai" ? (
                                <Bot className="h-3 w-3" />
                              ) : (
                                <MessageSquare className="h-3 w-3" />
                              )}
                              <span className="text-xs font-medium">
                                {msg.sender === "user"
                                  ? selectedContact?.name
                                  : msg.sender === "ai"
                                  ? "AI Assistant"
                                  : "Agent"}
                              </span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {msg.timestamp instanceof Date
                                ? msg.timestamp.toLocaleTimeString()
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 mt-8">
                        No messages yet. Send a message to start the conversation.
                      </p>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message as a customer..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={2}
                        className="resize-none"
                      />
                      <Button onClick={handleSendMessage} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400">
                  Select a contact and start a conversation to begin testing
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-white">
              How to Use the Simulator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
              <li>Select a channel (WhatsApp or Instagram)</li>
              <li>Choose an existing contact or create a new one</li>
              <li>Click "Start Conversation" to begin a new thread</li>
              <li>Type messages as if you were the customer</li>
              <li>
                Watch how your AI workflows respond in real-time with purple bubbles
              </li>
              <li>Human agents can join the conversation with blue bubbles</li>
              <li>Use this to test triggers, conditions, and automated responses</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
