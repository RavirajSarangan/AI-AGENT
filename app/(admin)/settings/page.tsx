"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Building,
  MessageSquare,
  Instagram,
  Bot,
  Clock,
  Users,
  CreditCard,
  Shield,
  ArrowRight,
} from "lucide-react";


const settingsSections = [
  {
    title: "Business Profile",
    description: "Company information, logo, timezone, and currency",
    icon: Building,
    href: "/settings/business",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Profile & Security",
    description: "Personal info, password, 2FA, and notifications",
    icon: User,
    href: "/settings/profile",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "WhatsApp",
    description: "WhatsApp Cloud API integration and messaging settings",
    icon: MessageSquare,
    href: "/settings/whatsapp",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Instagram",
    description: "Instagram Messaging API and DM automation",
    icon: Instagram,
    href: "/settings/instagram",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    title: "AI Assistant",
    description: "System prompt, tone, language, and AI behavior",
    icon: Bot,
    href: "/settings/ai",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Business Hours",
    description: "Operating hours, after-hours replies, holidays",
    icon: Clock,
    href: "/settings/hours",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Team",
    description: "Invite members, manage roles and permissions",
    icon: Users,
    href: "/settings/team",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    title: "Billing",
    description: "Subscription, usage, payment method, invoices",
    icon: CreditCard,
    href: "/settings/billing",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your workspace, integrations, and preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.href}
              className="cursor-pointer hover:shadow-md transition-all group"
              onClick={() => router.push(section.href)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-bold text-lg mb-2">{section.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="font-bold text-blue-900">Security Status</h3>
            </div>
            <p className="text-sm text-blue-800 mb-4">
              Your account is protected. Consider enabling 2FA for extra security.
            </p>
            <Button 
              variant="outline" 
              className="bg-white"
              onClick={() => router.push("/settings/profile#security")}
            >
              Review Security
            </Button>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="h-6 w-6 text-green-600" />
              <h3 className="font-bold text-green-900">Channel Connections</h3>
            </div>
            <p className="text-sm text-green-800 mb-4">
              Connect WhatsApp and Instagram to start automating conversations.
            </p>
            <Button 
              variant="outline" 
              className="bg-white"
              onClick={() => router.push("/settings/whatsapp")}
            >
              Connect Channels
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
