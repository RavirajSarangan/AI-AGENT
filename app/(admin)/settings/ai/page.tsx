"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToSettings, updateAISettings } from "@/lib/firebase/settings";
import { Loader2 } from "lucide-react";

export default function AISettingsPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personality, setPersonality] = useState("You are a friendly support assistant for Acme, polite and concise.");
  const [tone, setTone] = useState("Friendly");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("400");
  const [useHistory, setUseHistory] = useState(true);
  const [showSource, setShowSource] = useState(true);

  useEffect(() => {
    if (!userProfile?.currentTenant) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToSettings(userProfile.currentTenant, (data) => {
      if (data?.ai) {
        setPersonality(data.ai.personality_prompt || "");
        setTone(data.ai.tone || "Friendly");
        setTemperature(data.ai.temperature?.toString() || "0.7");
        setMaxTokens(data.ai.max_tokens?.toString() || "400");
        setUseHistory(data.ai.use_context !== false);
        setShowSource(data.ai.show_sources !== false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.currentTenant]);

  const handleSave = async () => {
    if (!userProfile?.currentTenant) return;
    
    setSaving(true);
    try {
      await updateAISettings(userProfile.currentTenant, {
        personality_prompt: personality,
        tone: tone as any,
        temperature: Number.parseFloat(temperature),
        max_tokens: Number.parseInt(maxTokens, 10),
        use_context: useHistory,
        show_sources: showSource,
        model: "gpt-4",
      });
      alert("AI settings saved successfully!");
    } catch (error) {
      console.error("Failed to save AI settings:", error);
      alert("Failed to save. Please try again.");
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
          <h2 className="text-3xl font-bold text-white">AI configuration</h2>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Real-time
          </div>
        </div>
        <p className="text-sm text-slate-400">Define the persona, tone, and fallback logic for GPT replies.</p>
      </header>
      <Card className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Personality prompt</label>
          <textarea
            rows={4}
            className="w-full rounded-3xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Tone</label>
            <select 
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Friendly</option>
              <option>Formal</option>
              <option>Fun</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Temperature</label>
            <input 
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white" 
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Max tokens</label>
            <input 
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white" 
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <label className="inline-flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={useHistory}
              onChange={(e) => setUseHistory(e.target.checked)}
            />
            {' '}Use conversation history for better context
          </label>
          <label className="inline-flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={showSource}
              onChange={(e) => setShowSource(e.target.checked)}
            />
            {' '}Always show AI prompt source when replying
          </label>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          variant="primary" 
          className="rounded-2xl px-6 py-3 text-sm"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save AI settings'
          )}
        </Button>
      </Card>
    </div>
  );
}
