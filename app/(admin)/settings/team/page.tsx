'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToTenantMembers, TenantMember } from "@/lib/firebase/users";

export default function TeamSettingsPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TenantMember[]>([]);

  useEffect(() => {
    if (!userProfile?.currentTenant) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToTenantMembers(userProfile.currentTenant, (members) => {
      setTeam(members);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.currentTenant]);

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
          <h2 className="text-3xl font-bold text-white">Team Members</h2>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Real-time
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">Invite teammates, assign roles, and manage access</p>
      </header>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white">{team.length} team members</p>
            <p className="text-sm text-gray-400">Manage your team access</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 font-bold">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        <div className="space-y-3">
          {team.map((member) => (
            <div key={member.uid} className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="font-bold text-purple-400">{member.displayName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-bold text-white">{member.displayName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3 text-gray-500" />
                    <p className="text-sm text-gray-400">{member.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold capitalize">
                  <Shield className="w-3 h-3 mr-1" />
                  {member.role}
                </Badge>
                <div className="flex gap-2">
                  {member.status === 'invited' && (
                    <Button variant="outline" size="sm" className="font-bold border-white/10 text-gray-300 hover:bg-white/5">
                      Resend Invite
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300 font-bold border-white/10 hover:bg-red-500/10">
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
