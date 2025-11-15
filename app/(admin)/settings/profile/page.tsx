"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToUserProfile } from "@/lib/firebase/users";
import { Loader2 } from "lucide-react";

export default function BusinessProfilePage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("Acme Support");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("America/New_York");

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserProfile(user.uid, (profile) => {
      if (profile) {
        // You can load user-specific settings here
        // For now using default values
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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
          <h2 className="text-3xl font-bold text-white">Business profile</h2>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Real-time
          </div>
        </div>
        <p className="text-sm text-slate-400">Update name, logo, timezone, and language defaults.</p>
      </header>
      <Card className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Business name</label>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white" defaultValue="Acme Support" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Default reply language</label>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white" defaultValue="English" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Timezone</label>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white" defaultValue="America/New_York" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Logo</label>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full border border-white/10 bg-indigo-500/30" />
            <Button variant="ghost" className="rounded-full px-4 py-2 text-xs">
              Upload logo
            </Button>
          </div>
        </div>
        <Button variant="primary" className="mt-4 rounded-2xl px-6 py-3 text-sm">
          Save changes
        </Button>
      </Card>
    </div>
  );
}
