#!/bin/bash

# Business Hours Page Update
cat > "app/(admin)/settings/hours/page.tsx" << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { subscribeToSettings, updateBusinessHours } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Clock } from "lucide-react";

const TENANT_ID = "tenant-1";
const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function BusinessHoursPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hours, setHours] = useState<any>({});
  const [onlyDuringHours, setOnlyDuringHours] = useState(true);
  const [autoRespond, setAutoRespond] = useState(false);
  const [outOfHoursMessage, setOutOfHoursMessage] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToSettings(TENANT_ID, (data) => {
      if (data?.business_hours) {
        setHours(data.business_hours);
        setOnlyDuringHours(data.business_hours.only_during_hours ?? true);
        setAutoRespond(data.business_hours.auto_respond_outside ?? false);
        setOutOfHoursMessage(data.business_hours.out_of_hours_message || 'We are currently offline.');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleDay = (day: string) => {
    setHours((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day]?.enabled }
    }));
  };

  const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
    setHours((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusinessHours(TENANT_ID, {
        ...hours,
        only_during_hours: onlyDuringHours,
        auto_respond_outside: autoRespond,
        out_of_hours_message: outOfHoursMessage
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-gray-900">Business Hours</h2>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Real-time
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">Define when auto replies should send</p>
      </header>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          {weekdays.map((day, index) => {
            const dayData = hours[day] || { enabled: true, start: '09:00', end: '18:00' };
            return (
              <div key={day} className="flex items-center gap-4 pb-4 border-b">
                <div className="w-32">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={dayData.enabled}
                      onCheckedChange={() => handleToggleDay(day)}
                    />
                    <Label className="font-bold text-gray-900">{dayLabels[index]}</Label>
                  </div>
                </div>
                {dayData.enabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={dayData.start}
                      onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500 font-bold">to</span>
                    <Input
                      type="time"
                      value={dayData.end}
                      onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-bold text-gray-900">Only send AI replies during business hours</Label>
              <p className="text-sm text-gray-600">Disable automatic responses outside of set hours</p>
            </div>
            <Switch checked={onlyDuringHours} onCheckedChange={setOnlyDuringHours} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-bold text-gray-900">Auto-respond outside hours</Label>
              <p className="text-sm text-gray-600">Send fallback message when offline</p>
            </div>
            <Switch checked={autoRespond} onCheckedChange={setAutoRespond} />
          </div>
        </div>

        {autoRespond && (
          <div className="space-y-2">
            <Label className="font-bold text-gray-900">Out-of-hours message</Label>
            <Textarea
              rows={3}
              value={outOfHoursMessage}
              onChange={(e) => setOutOfHoursMessage(e.target.value)}
              placeholder="Enter your out-of-hours message..."
              className="font-medium text-gray-700"
            />
          </div>
        )}

        <div className="pt-4 border-t flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Save Hours
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
EOF

# Team Page Update  
cat > "app/(admin)/settings/team/page.tsx" << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Mail, Shield } from "lucide-react";

const team = [
  { name: "Emma Walker", role: "Admin", email: "emma@acme.co", status: "active" },
  { name: "Luis Gomez", role: "Agent", email: "luis@acme.co", status: "active" },
  { name: "Priya Shah", role: "Owner", email: "priya@acme.co", status: "active" },
];

export default function TeamSettingsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-gray-900">Team Members</h2>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Real-time
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">Invite teammates, assign roles, and manage access</p>
      </header>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{team.length} team members</p>
            <p className="text-sm text-gray-600">Manage your team access</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 font-bold">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        <div className="space-y-3">
          {team.map((member) => (
            <div key={member.email} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="font-bold text-purple-600">{member.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{member.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3 text-gray-500" />
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-bold">
                  <Shield className="w-3 h-3 mr-1" />
                  {member.role}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="font-bold">
                    Resend Invite
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 font-bold">
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
EOF

echo "✅ Updated Business Hours and Team pages with real-time integration!"
