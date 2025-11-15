"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  User,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

export default function AgentDashboardPage() {
  return (
    <RoleGuard allowedRoles={["agent"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer conversations and support requests
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Assigned to Me
              </CardTitle>
              <User className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="text-xs text-gray-600 mt-1">Active conversations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Replies
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Resolved Today
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">+4</span> vs yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">2.5m</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">-30s</span> improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-bold text-gray-900">My Conversations</CardTitle>
                <CardDescription>Conversations assigned to you</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9 w-[300px]"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Sarah Johnson",
                  channel: "WhatsApp",
                  message: "Hi, I need help with my recent order #12345",
                  time: "2m ago",
                  status: "new",
                  unread: 2,
                },
                {
                  name: "Mike Chen",
                  channel: "Instagram",
                  message: "What are your business hours?",
                  time: "15m ago",
                  status: "open",
                  unread: 1,
                },
                {
                  name: "Emma Davis",
                  channel: "WhatsApp",
                  message: "Thanks for the help!",
                  time: "1h ago",
                  status: "open",
                  unread: 0,
                },
                {
                  name: "Alex Kumar",
                  channel: "Instagram",
                  message: "Can I get a price quote?",
                  time: "2h ago",
                  status: "new",
                  unread: 1,
                },
              ].map((conv) => (
                <Link
                  key={conv.name}
                  href={`/conversations/${conv.name.replaceAll(/\s+/g, '-').toLowerCase()}`}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-purple-700 font-semibold text-lg">
                      {conv.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">{conv.name}</span>
                      <Badge
                        variant={conv.channel === "WhatsApp" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {conv.channel}
                      </Badge>
                      {conv.status === "new" && (
                        <Badge variant="outline" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-gray-500">{conv.time}</span>
                    {conv.unread > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/conversations">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View All Conversations
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/contacts">
                  <User className="h-4 w-4 mr-2" />
                  Browse Contacts
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/workflows/logs">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  View Workflow Logs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Access Note */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <MessageCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-yellow-900 mb-1">Agent Access Level</p>
                <p className="text-yellow-800">
                  You can view and reply to conversations, view contacts, and check workflow logs.
                  For settings, workflows, or billing, please contact your workspace admin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
