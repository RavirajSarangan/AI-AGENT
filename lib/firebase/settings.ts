import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface BusinessSettings {
  business_name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  country?: string;
  support_email?: string;
  support_phone?: string;
  address?: string;
  timezone: string;
  language: string;
  currency: string;
}

export interface WhatsAppSettings {
  connected: boolean;
  phone_number?: string;
  phone_number_id?: string;
  waba_id?: string;
  access_token?: string;
  verify_token?: string;
  default_language: string;
  auto_download_media: boolean;
  auto_replies_enabled: boolean;
  workflows_only: boolean;
  rate_limit: string;
}

export interface InstagramSettings {
  connected: boolean;
  username?: string;
  ig_business_account_id?: string;
  page_id?: string;
  access_token?: string;
  verify_token?: string;
  quick_replies_enabled: boolean;
  auto_media_handling: boolean;
  story_replies_enabled: boolean;
  auto_replies_enabled: boolean;
  workflows_only: boolean;
  rate_limit: string;
}

export interface AISettings {
  system_prompt: string;
  tone: string;
  default_language: string;
  auto_detect_language: boolean;
  reply_in_user_language: boolean;
  use_conversation_history: boolean;
  use_workflow_variables: boolean;
  allow_long_replies: boolean;
  max_reply_length: number;
  enable_human_fallback: boolean;
  emojis_allowed: boolean;
  fallback_message: string;
  context_retention: string;
  ai_memory: boolean;
}

export interface BusinessHours {
  enabled: boolean;
  schedule: Array<{
    day: string;
    enabled: boolean;
    start: string;
    end: string;
  }>;
  out_of_hours_message: string;
  allow_ai_outside_hours: boolean;
}

export interface TenantSettings {
  tenant_id: string;
  business: BusinessSettings;
  whatsapp: WhatsAppSettings;
  instagram: InstagramSettings;
  ai: AISettings;
  business_hours: BusinessHours;
  updated_at: Date;
}

// Real-time listener for tenant settings
export const subscribeToSettings = (
  tenantId: string,
  callback: (settings: TenantSettings | null) => void
) => {
  const docRef = doc(db, "tenant_settings", tenantId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        ...data,
        updated_at: data.updated_at?.toDate(),
      } as TenantSettings);
    } else {
      callback(null);
    }
  });
};

// Get settings (one-time fetch)
export const getSettings = async (tenantId: string) => {
  const docRef = doc(db, "tenant_settings", tenantId);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      ...data,
      updated_at: data.updated_at?.toDate(),
    } as TenantSettings;
  }
  return null;
};

// Update business settings
export const updateBusinessSettings = async (
  tenantId: string,
  settings: Partial<BusinessSettings>
) => {
  const docRef = doc(db, "tenant_settings", tenantId);
  await updateDoc(docRef, {
    business: settings,
    updated_at: serverTimestamp(),
  });
};

// Update WhatsApp settings
export const updateWhatsAppSettings = async (
  tenantId: string,
  settings: Partial<WhatsAppSettings>
) => {
  const docRef = doc(db, "tenant_settings", tenantId);
  await updateDoc(docRef, {
    whatsapp: settings,
    updated_at: serverTimestamp(),
  });
};

// Update Instagram settings
export const updateInstagramSettings = async (
  tenantId: string,
  settings: Partial<InstagramSettings>
) => {
  const docRef = doc(db, "tenant_settings", tenantId);
  await updateDoc(docRef, {
    instagram: settings,
    updated_at: serverTimestamp(),
  });
};

// Update AI settings
export const updateAISettings = async (
  tenantId: string,
  settings: Partial<AISettings>
) => {
  const docRef = doc(db, "tenant_settings", tenantId);
  await updateDoc(docRef, {
    ai: settings,
    updated_at: serverTimestamp(),
  });
};

// Update business hours
export const updateBusinessHours = async (
  tenantId: string,
  hours: Partial<BusinessHours>
) => {
  const docRef = doc(db, "tenant_settings", tenantId);
  await updateDoc(docRef, {
    business_hours: hours,
    updated_at: serverTimestamp(),
  });
};

// Initialize default settings for new tenant
export const initializeTenantSettings = async (tenantId: string) => {
  const docRef = doc(db, "tenant_settings", tenantId);
  const defaultSettings: TenantSettings = {
    tenant_id: tenantId,
    business: {
      business_name: "My Business",
      timezone: "America/New_York",
      language: "en",
      currency: "USD",
    },
    whatsapp: {
      connected: false,
      default_language: "en",
      auto_download_media: true,
      auto_replies_enabled: true,
      workflows_only: false,
      rate_limit: "60",
    },
    instagram: {
      connected: false,
      quick_replies_enabled: true,
      auto_media_handling: true,
      story_replies_enabled: true,
      auto_replies_enabled: true,
      workflows_only: false,
      rate_limit: "40",
    },
    ai: {
      system_prompt:
        "You are a helpful assistant for {{business_name}}. Respond politely and concisely.",
      tone: "professional",
      default_language: "en",
      auto_detect_language: true,
      reply_in_user_language: true,
      use_conversation_history: true,
      use_workflow_variables: true,
      allow_long_replies: false,
      max_reply_length: 500,
      enable_human_fallback: true,
      emojis_allowed: true,
      fallback_message:
        "I'm not fully sure about that. Let me connect you with a human team member who can help.",
      context_retention: "24",
      ai_memory: true,
    },
    business_hours: {
      enabled: true,
      schedule: [
        { day: "Monday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Tuesday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Wednesday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Thursday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Friday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Saturday", enabled: false, start: "09:00", end: "17:00" },
        { day: "Sunday", enabled: false, start: "09:00", end: "17:00" },
      ],
      out_of_hours_message:
        "Thanks for your message! We're currently offline. Our business hours are Monday-Friday, 9am-5pm.",
      allow_ai_outside_hours: true,
    },
    updated_at: new Date(),
  };

  await setDoc(docRef, {
    ...defaultSettings,
    updated_at: serverTimestamp(),
  });
};
