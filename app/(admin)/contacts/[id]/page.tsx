"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Mail,
  Instagram,
  MessageSquare,
  Tag,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Contact,
  subscribeToContact,
  updateContact,
  deleteContact,
  addContactTags,
  removeContactTags,
} from "@/lib/firebase/contacts";
import {
  Conversation,
  subscribeToConversations,
} from "@/lib/firebase/conversations";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function ContactProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Partial<Contact>>({});
  const [newTag, setNewTag] = useState("");

  // Real-time contact subscription
  useEffect(() => {
    if (!contactId) return;

    const unsubscribe = subscribeToContact(contactId, (data) => {
      setContact(data);
      setEditedContact(data || {});
    });

    return () => unsubscribe();
  }, [contactId]);

  // Real-time conversations subscription for this contact
  useEffect(() => {
    if (!userProfile?.currentTenant || !contactId) return;

    const unsubscribe = subscribeToConversations(
      userProfile.currentTenant,
      (data) => {
        const filtered = data.filter((c) => c.contact_id === contactId);
        setConversations(filtered);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.currentTenant, contactId]);

  const handleSave = async () => {
    if (!contact) return;

    try {
      await updateContact(contact.id, editedContact);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update contact:", error);
    }
  };

  const handleDelete = async () => {
    if (!contact || !confirm("Are you sure you want to delete this contact?"))
      return;

    try {
      await deleteContact(contact.id);
      router.push("/contacts");
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !contact) return;

    try {
      await addContactTags(contact.id, [newTag]);
      setNewTag("");
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!contact) return;

    try {
      await removeContactTags(contact.id, [tag]);
    } catch (error) {
      console.error("Failed to remove tag:", error);
    }
  };

  if (!contact) {
    return (
      <RoleGuard allowedRoles={["admin", "owner", "agent"]}>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading contact...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "owner", "agent"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/contacts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
              <p className="text-sm text-gray-600 mt-1">Contact Profile</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-bold text-gray-900">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar & Basic Info */}
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-3xl">
                    {contact.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label>Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedContact.name || ""}
                        onChange={(e) =>
                          setEditedContact({ ...editedContact, name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {contact.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editedContact.phone || ""}
                          onChange={(e) =>
                            setEditedContact({ ...editedContact, phone: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{contact.phone || "—"}</p>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedContact.email || ""}
                          onChange={(e) =>
                            setEditedContact({ ...editedContact, email: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{contact.email || "—"}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram Username
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedContact.instagram_username || ""}
                        onChange={(e) =>
                          setEditedContact({
                            ...editedContact,
                            instagram_username: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">
                        {contact.instagram_username || "—"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {contact.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
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
                )}
              </div>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                {isEditing ? (
                  <Textarea
                    rows={4}
                    value={editedContact.notes || ""}
                    onChange={(e) =>
                      setEditedContact({ ...editedContact, notes: e.target.value })
                    }
                    placeholder="Add notes about this contact..."
                  />
                ) : (
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {contact.notes || "No notes yet"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats & Activity */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bold text-gray-900">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Channel:</span>
                  <Badge className="capitalize">{contact.channel}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conversations:</span>
                  <span className="font-bold text-gray-900">
                    {contact.conversation_count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Contacted:</span>
                  <span className="font-medium text-gray-900">
                    {contact.last_contacted instanceof Date
                      ? contact.last_contacted.toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Added:</span>
                  <span className="font-medium text-gray-900">
                    {contact.created_at instanceof Date
                      ? contact.created_at.toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Conversation History */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bold text-gray-900">
                  Recent Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversations.length > 0 ? (
                  <div className="space-y-3">
                    {conversations.slice(0, 5).map((conv) => (
                      <div
                        key={conv.id}
                        className="p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant={conv.status === "active" ? "default" : "outline"}
                          >
                            {conv.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {conv.last_message_time instanceof Date
                              ? conv.last_message_time.toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 truncate">
                          {conv.last_message}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-2" asChild>
                          <Link href={`/conversations`}>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No conversations yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
