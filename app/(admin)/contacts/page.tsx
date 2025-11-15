"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreVertical,
  MessageSquare,
  User,
  Clock,
  Download,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Contact, subscribeToContacts, deleteContact } from "@/lib/firebase/contacts";
import { useAuth } from "@/contexts/AuthContext";

export default function ContactsPage() {
  const { userProfile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all-tags");

  // Real-time contacts subscription
  useEffect(() => {
    if (!userProfile?.currentTenant) return;

    const unsubscribe = subscribeToContacts(userProfile.currentTenant, (data) => {
      setContacts(data);
    });

    return () => unsubscribe();
  }, [userProfile?.currentTenant]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Channel filter
      const matchesChannel =
        channelFilter === "all" ||
        contact.channel === channelFilter ||
        (channelFilter === "both" && contact.channel === "both");

      // Tag filter
      const matchesTag =
        tagFilter === "all-tags" || contact.tags.includes(tagFilter);

      return matchesSearch && matchesChannel && matchesTag;
    });
  }, [contacts, searchQuery, channelFilter, tagFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: contacts.length,
      whatsapp: contacts.filter((c) => c.channel === "whatsapp" || c.channel === "both").length,
      instagram: contacts.filter((c) => c.channel === "instagram" || c.channel === "both").length,
      newThisMonth: contacts.filter((c) => {
        let createdAt: Date;
        if (c.created_at instanceof Date) {
          createdAt = c.created_at;
        } else if ((c.created_at as any).toDate) {
          createdAt = (c.created_at as any).toDate();
        } else {
          createdAt = new Date();
        }
        return createdAt >= firstOfMonth;
      }).length,
    };
  }, [contacts]);

  const handleDelete = async (contactId: string, contactName: string) => {
    if (!confirm(`Are you sure you want to delete ${contactName}?`)) return;

    try {
      await deleteContact(contactId);
    } catch (error) {
      console.error("Failed to delete contact:", error);
      alert("Failed to delete contact. Please try again.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Phone", "Email", "Instagram", "Channel", "Tags", "Conversations", "Created At"];
    const rows = filteredContacts.map((c) => [
      c.name,
      c.phone || "",
      c.email || "",
      c.instagram_username || "",
      c.channel,
      c.tags.join("; "),
      c.conversation_count,
      c.created_at instanceof Date ? c.created_at.toLocaleDateString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  };

  const formatLastContacted = (date: Date | any) => {
    if (!date) return "Never";
    const contactDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - contactDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return contactDate.toLocaleDateString();
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner", "agent"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Contacts
            </h1>
            <p className="text-gray-400 mt-2">
              Manage all your contacts and customer data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Contacts</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <User className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">WhatsApp</p>
                  <p className="text-2xl font-bold text-white">{stats.whatsapp}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Instagram</p>
                  <p className="text-2xl font-bold text-white">{stats.instagram}</p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">New This Month</p>
                  <p className="text-2xl font-bold text-white">{stats.newThisMonth}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by name, phone, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-tags">All Tags</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Last Contacted</TableHead>
                    <TableHead>Conversations</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <TableRow
                        key={contact.id}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {contact.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/contacts/${contact.id}`}
                                className="font-medium text-white hover:underline"
                              >
                                {contact.name}
                              </Link>
                              <p className="text-sm text-gray-400">{contact.email || "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-white">
                          {contact.phone || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize"
                          >
                            {contact.channel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatLastContacted(contact.last_contacted)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/conversations`}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          >
                            <MessageSquare className="h-3 w-3" />
                            {contact.conversation_count}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{contact.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/contacts/${contact.id}`}>
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/conversations`}>
                                  View Conversations
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(contact.id, contact.name)}
                              >
                                Delete Contact
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                        {searchQuery || channelFilter !== "all" || tagFilter !== "all-tags"
                          ? "No contacts match your filters"
                          : "No contacts yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
