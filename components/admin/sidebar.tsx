"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Workflow,
  Settings,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight,
  MessageSquare as Logo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";

const allNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin", "agent"] },
  { name: "Conversations", href: "/conversations", icon: MessageSquare, roles: ["owner", "admin", "agent"] },
  { name: "Contacts", href: "/contacts", icon: Users, roles: ["owner", "admin", "agent"] },
  { name: "Workflows", href: "/workflows", icon: Workflow, roles: ["owner", "admin"] },
  { name: "Simulator", href: "/simulator", icon: MessageSquare, roles: ["owner", "admin"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["owner", "admin"] },
  { name: "Billing", href: "/billing", icon: CreditCard, roles: ["owner"] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const userInitials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase() || "U";

  // Filter navigation based on user role
  const navigation = useMemo(() => {
    const userRole = userProfile?.role || "agent";
    return allNavigation.filter((item) => item.roles.includes(userRole));
  }, [userProfile?.role]);

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Logo className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">FlowReplyAI</span>
              <Badge variant="secondary" className="text-xs">Pro</Badge>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        {collapsed ? (
          <Avatar className="mx-auto h-8 w-8">
            <AvatarImage src={user?.photoURL || ""} />
            <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ""} />
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {user?.displayName || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
