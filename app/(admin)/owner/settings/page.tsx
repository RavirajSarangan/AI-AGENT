"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Shield, Mail, Palette, Database, Bell } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function OwnerSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to Firestore platform_settings collection
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings Saved",
        description: "Platform settings updated successfully.",
      });
    }, 1000);
  };

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure global platform settings and defaults
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Platform Branding
            </CardTitle>
            <CardDescription>
              Customize the platform name, logo, and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Platform Name</Label>
                <Input defaultValue="AI Agent Platform" />
              </div>
              <div>
                <Label>Support Email</Label>
                <Input type="email" defaultValue="support@aiagent.com" />
              </div>
            </div>
            <div>
              <Label>Platform URL</Label>
              <Input defaultValue="https://aiagent.com" />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input placeholder="https://..." />
            </div>
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" defaultValue="#8B5CF6" className="w-20" />
                <span className="text-sm text-gray-600">#8B5CF6 (Purple)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure SMTP settings for platform emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>SMTP Host</Label>
                <Input defaultValue="smtp.sendgrid.net" />
              </div>
              <div>
                <Label>SMTP Port</Label>
                <Input defaultValue="587" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>SMTP Username</Label>
                <Input defaultValue="apikey" />
              </div>
              <div>
                <Label>SMTP Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <Label>From Email</Label>
              <Input defaultValue="noreply@aiagent.com" />
            </div>
            <Button variant="outline">Send Test Email</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Access
            </CardTitle>
            <CardDescription>
              Platform-wide security policies and restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" defaultValue="60" />
              </div>
              <div>
                <Label>Max Login Attempts</Label>
                <Input type="number" defaultValue="5" />
              </div>
            </div>
            <div>
              <Label>Password Policy</Label>
              <Select defaultValue="strong">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (8+ chars)</SelectItem>
                  <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                  <SelectItem value="strong">Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enforce 2FA for all admins</p>
                <p className="text-sm text-gray-600">Require two-factor authentication</p>
              </div>
              <Badge className="bg-green-600">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">IP Whitelist</p>
                <p className="text-sm text-gray-600">Restrict access by IP address</p>
              </div>
              <Badge variant="outline">Disabled</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database & Storage
            </CardTitle>
            <CardDescription>
              Firestore configuration and backup settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Database Usage</span>
                <span className="text-sm text-gray-600">24.3 GB / 100 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "24.3%" }} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Automatic Backups</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Retention Period</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline">Run Manual Backup Now</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Platform Notifications
            </CardTitle>
            <CardDescription>
              Configure alerts and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Critical Error Alerts</p>
                <p className="text-sm text-gray-600">Immediate notification for critical failures</p>
              </div>
              <Badge className="bg-green-600">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Daily Usage Reports</p>
                <p className="text-sm text-gray-600">Daily summary of platform metrics</p>
              </div>
              <Badge className="bg-green-600">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">New Workspace Signup</p>
                <p className="text-sm text-gray-600">Alert when new workspace is created</p>
              </div>
              <Badge className="bg-green-600">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Payment Failures</p>
                <p className="text-sm text-gray-600">Alert on failed payment attempts</p>
              </div>
              <Badge className="bg-green-600">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Default Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Default Plan Limits
            </CardTitle>
            <CardDescription>
              Configure message limits for each subscription tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { plan: "Free", whatsapp: 100, instagram: 100, price: "$0" },
                { plan: "Starter", whatsapp: 1000, instagram: 1000, price: "$29" },
                { plan: "Pro", whatsapp: 5000, instagram: 5000, price: "$99" },
                { plan: "Agency", whatsapp: 20000, instagram: 20000, price: "$299" },
                { plan: "Enterprise", whatsapp: 999999, instagram: 999999, price: "$999" },
              ].map((item) => (
                <div key={item.plan} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-600">{item.plan}</Badge>
                      <span className="font-bold text-gray-900">{item.price}/mo</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">WhatsApp: </span>
                      <span className="font-medium">
                        {item.whatsapp === 999999 ? "Unlimited" : item.whatsapp.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Instagram: </span>
                      <span className="font-medium">
                        {item.instagram === 999999 ? "Unlimited" : item.instagram.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
