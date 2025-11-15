'use client';

import { useState, useEffect } from 'react';
import { subscribeToSettings, updateWhatsAppSettings } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  AlertCircle,
  Key,
  Webhook
} from 'lucide-react';

const TENANT_ID = "tenant-1";

export default function WhatsAppSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');
  
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToSettings(TENANT_ID, (data) => {
      if (data) {
        setSettings(data);
        const whatsapp = data.whatsapp || {};
        setPhoneNumberId(whatsapp.phone_number_id || '');
        setBusinessAccountId(whatsapp.waba_id || '');
        setAccessToken(whatsapp.access_token || '');
        setVerifyToken(whatsapp.verify_token || '');
        setWebhookUrl((whatsapp as any).webhook_url || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp`);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWhatsAppSettings(TENANT_ID, {
        phone_number_id: phoneNumberId,
        waba_id: businessAccountId,
        access_token: accessToken,
        verify_token: verifyToken,
        connected: !!(phoneNumberId && accessToken),
      } as any);
    } catch (error) {
      console.error('Failed to save WhatsApp settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const isConnected = settings?.whatsapp?.connected;

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">WhatsApp Integration</h1>
            {isConnected ? (
              <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 font-medium border-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/20 font-medium border-0">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            Connect your WhatsApp Business Cloud API to start automating conversations
          </p>
        </div>

        {/* Setup Guide Card */}
        <Card className="p-6 bg-[#7C3AED]/10 border border-[#7C3AED]/20 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#7C3AED] rounded-lg shrink-0">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-3">Quick Setup Guide</h3>
              <ol className="space-y-2.5 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="font-semibold text-[#7C3AED]">1.</span>
                  <span>Create a Meta Developer App and get your WhatsApp Business Account ID</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-[#7C3AED]">2.</span>
                  <span>Generate a permanent access token from Meta Business Settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-[#7C3AED]">3.</span>
                  <span>Configure the webhook URL in your Meta App dashboard</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-[#7C3AED]">4.</span>
                  <span>Enter your credentials below and save</span>
                </li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 bg-white/5 hover:bg-white/10 border-white/10 text-white"
                onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/cloud-api/get-started', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Meta Documentation
              </Button>
            </div>
          </div>
        </Card>

        {/* Configuration Card */}
        <Card className="p-8 bg-[#1A1F3A] border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">API Configuration</h2>
          
          <div className="space-y-6">
            {/* Phone Number ID */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumberId" className="text-sm font-medium text-gray-300">
                Phone Number ID
              </Label>
              <Input
                id="phoneNumberId"
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Enter your WhatsApp Phone Number ID"
                className="bg-[#0A0E27] border-white/10 text-white placeholder:text-gray-500 font-mono text-sm focus:border-[#7C3AED] focus:ring-[#7C3AED]"
              />
              <p className="text-xs text-gray-500">
                Found in your Meta App Dashboard under WhatsApp {">"} API Setup
              </p>
            </div>

            {/* Business Account ID */}
            <div className="space-y-2">
              <Label htmlFor="businessAccountId" className="text-sm font-medium text-gray-300">
                WhatsApp Business Account ID (WABA ID)
              </Label>
              <Input
                id="businessAccountId"
                type="text"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                placeholder="Enter your WABA ID"
                className="bg-[#0A0E27] border-white/10 text-white placeholder:text-gray-500 font-mono text-sm focus:border-[#7C3AED] focus:ring-[#7C3AED]"
              />
              <p className="text-xs text-gray-500">
                Your WhatsApp Business Account identifier
              </p>
            </div>

            {/* Access Token */}
            <div className="space-y-2">
              <Label htmlFor="accessToken" className="text-sm font-medium text-gray-300">
                Access Token
              </Label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your permanent access token"
                className="bg-[#0A0E27] border-white/10 text-white placeholder:text-gray-500 font-mono text-sm focus:border-[#7C3AED] focus:ring-[#7C3AED]"
              />
              <p className="text-xs text-gray-500">
                Generate a permanent token from Meta Business Settings (never expires)
              </p>
            </div>

            {/* Verify Token */}
            <div className="space-y-2">
              <Label htmlFor="verifyToken" className="text-sm font-medium text-gray-300">
                Webhook Verify Token
              </Label>
              <Input
                id="verifyToken"
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder="Enter a custom verify token"
                className="bg-[#0A0E27] border-white/10 text-white placeholder:text-gray-500 font-mono text-sm focus:border-[#7C3AED] focus:ring-[#7C3AED]"
              />
              <p className="text-xs text-gray-500">
                A secret string you create - use this same value in Meta's webhook setup
              </p>
            </div>
          </div>
        </Card>

        {/* Webhook Configuration Card */}
        <Card className="p-8 bg-[#1A1F3A] border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Webhook className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Webhook Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-300 mb-2 block">
                Callback URL
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="bg-[#0A0E27] border-white/10 text-gray-400 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                  className="shrink-0 bg-white/5 hover:bg-white/10 border-white/10 text-white"
                >
                  {copied === 'webhook' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use this URL in your Meta App's webhook configuration
              </p>
            </div>

            {verifyToken && (
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2 block">
                  Verify Token (for Meta Dashboard)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={verifyToken}
                    readOnly
                    className="bg-[#0A0E27] border-white/10 text-gray-400 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(verifyToken, 'token')}
                    className="shrink-0 bg-white/5 hover:bg-white/10 border-white/10 text-white"
                  >
                    {copied === 'token' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-200">
                <strong>Important:</strong> After saving your settings, configure the webhook in your Meta App 
                with the callback URL and verify token shown above.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving || !phoneNumberId || !accessToken}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
          
          {isConnected && (
            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 px-4 py-2 border-0">
              ✓ Integration Active
            </Badge>
          )}
        </div>

        {/* Testing Card */}
        {isConnected && (
          <Card className="p-6 bg-green-500/10 border border-green-500/20">
            <h3 className="font-semibold text-green-300 mb-2">✓ Successfully Connected</h3>
            <p className="text-sm text-green-200/80 mb-4">
              Your WhatsApp Business API is connected and ready to receive messages. Test your setup by sending 
              a message to your WhatsApp number.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 hover:bg-white/10 border-green-500/30 text-green-300"
              onClick={() => window.open('/workflows', '_self')}
            >
              Create Your First Workflow →
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
