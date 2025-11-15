"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Globe, MapPin, Mail, Phone, Save, Loader2 } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToSettings } from "@/lib/firebase/settings";

export default function BusinessProfilePage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState("FlowReplyAI");
  const [website, setWebsite] = useState("https://flowreplyai.com");
  const [industry, setIndustry] = useState("technology");
  const [country, setCountry] = useState("US");
  const [supportEmail, setSupportEmail] = useState("support@flowreplyai.com");
  const [supportPhone, setSupportPhone] = useState("+1 555-987-6543");
  const [address, setAddress] = useState("123 Business St, San Francisco, CA 94102");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile?.currentTenant) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToSettings(userProfile.currentTenant, (data) => {
      if (data?.business) {
        const biz = data.business;
        setBusinessName(biz.business_name || "FlowReplyAI");
        setWebsite(biz.website || "");
        setIndustry(biz.industry || "technology");
        setCountry(biz.country || "US");
        setSupportEmail(biz.support_email || "");
        setSupportPhone(biz.support_phone || "");
        setAddress(biz.address || "");
        setTimezone(biz.timezone || "America/New_York");
        setLanguage(biz.language || "en");
        setCurrency(biz.currency || "USD");
        setLogo(biz.logo_url || null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.currentTenant]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.currentTenant) return;
    
    setSaving(true);
    try {
      const settingsRef = doc(db, "settings", userProfile.currentTenant);
      await setDoc(settingsRef, {
        business: {
          business_name: businessName,
          website,
          industry,
          country,
          support_email: supportEmail,
          support_phone: supportPhone,
          address,
          timezone,
          language,
          currency,
          logo_url: logo,
        },
        updated_at: serverTimestamp(),
      }, { merge: true });
      alert("Business profile saved successfully!");
    } catch (error) {
      console.error("Failed to save business profile:", error);
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
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Business Profile</h1>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Real-time
          </div>
        </div>
        <p className="text-muted-foreground">
          Manage your business information and system preferences
        </p>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            This information is used across your workspace and in AI responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Business Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Building className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business-name" className="text-sm font-bold text-white">
              Business Name *
            </Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Company Name"
            />
            <p className="text-xs text-gray-400 font-medium">
              Used in AI responses as <code className="bg-blue-100 text-blue-800 px-1 rounded">&#123;&#123;business_name&#125;&#125;</code>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-bold text-white">
                Website URL
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-bold text-white">
                Industry
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Default Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-bold text-white">
              Default Country
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="BR">Brazil</SelectItem>
                <SelectItem value="MX">Mexico</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="ES">Spain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Details
          </CardTitle>
          <CardDescription>
            Customer-facing contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Support Email */}
            <div className="space-y-2">
              <Label htmlFor="support-email" className="text-sm font-bold text-white">
                Support Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Support Phone */}
            <div className="space-y-2">
              <Label htmlFor="support-phone" className="text-sm font-bold text-white">
                Support Phone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="support-phone"
                  type="tel"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+1 555-000-0000"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-bold text-white">
              Business Address (Optional)
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Business Street, City, State ZIP"
                rows={2}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            System Preferences
          </CardTitle>
          <CardDescription>
            Configure default settings for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-bold text-white">
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  <SelectItem value="America/Phoenix">Arizona (MST)</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska (AKT)</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii (HST)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 font-medium">
                Used for business hours and reporting
              </p>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-bold text-white">
                UI Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 font-medium">
                Admin panel display language
              </p>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-bold text-white">
                Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                  <SelectItem value="MXN">MXN ($)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 font-medium">
                For billing and reporting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Business Profile
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-blue-900 mb-1">How This Information Is Used</p>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Business name appears in AI-generated messages</li>
                <li>Contact details are used in message templates</li>
                <li>Timezone affects business hours and workflow scheduling</li>
                <li>Industry helps customize AI responses for your sector</li>
                <li>Currency is used in billing invoices and reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
