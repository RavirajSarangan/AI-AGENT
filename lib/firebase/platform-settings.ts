import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

export interface PlatformSettings {
  id: string;
  // Email settings
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_from?: string;
  // WhatsApp settings
  whatsapp_api_url?: string;
  whatsapp_api_key?: string;
  whatsapp_phone_number?: string;
  // Instagram settings
  instagram_api_url?: string;
  instagram_api_key?: string;
  instagram_username?: string;
  // AI settings
  openai_api_key?: string;
  openai_model?: string;
  openai_temperature?: number;
  max_tokens?: number;
  // System settings
  max_workspaces?: number;
  max_agents_per_workspace?: number;
  max_conversations_per_month?: number;
  enable_analytics?: boolean;
  enable_logging?: boolean;
  log_retention_days?: number;
  // Billing settings
  stripe_public_key?: string;
  stripe_secret_key?: string;
  default_currency?: string;
  // Feature flags
  enable_workflows?: boolean;
  enable_ai_replies?: boolean;
  enable_templates?: boolean;
  enable_webhooks?: boolean;
  // Monitoring
  sentry_dsn?: string;
  enable_error_tracking?: boolean;
  // Updated timestamp
  updated_at?: Date;
  updated_by?: string;
}

const SETTINGS_DOC_ID = "platform_settings";

// Get platform settings
export const getPlatformSettings = async (): Promise<PlatformSettings | null> => {
  const settingsRef = doc(db, "platform_settings", SETTINGS_DOC_ID);
  const settingsDoc = await getDoc(settingsRef);

  if (!settingsDoc.exists()) {
    // Initialize with defaults
    const defaultSettings: PlatformSettings = {
      id: SETTINGS_DOC_ID,
      openai_model: "gpt-4",
      openai_temperature: 0.7,
      max_tokens: 500,
      max_workspaces: 100,
      max_agents_per_workspace: 10,
      max_conversations_per_month: 10000,
      enable_analytics: true,
      enable_logging: true,
      log_retention_days: 30,
      default_currency: "USD",
      enable_workflows: true,
      enable_ai_replies: true,
      enable_templates: true,
      enable_webhooks: true,
      enable_error_tracking: false,
    };

    await setDoc(settingsRef, defaultSettings);
    return defaultSettings;
  }

  const data = settingsDoc.data();
  return {
    id: settingsDoc.id,
    ...data,
    updated_at: data.updated_at?.toDate(),
  } as PlatformSettings;
};

// Subscribe to platform settings changes (real-time)
export const subscribeToPlatformSettings = (
  callback: (settings: PlatformSettings | null) => void
) => {
  const settingsRef = doc(db, "platform_settings", SETTINGS_DOC_ID);

  return onSnapshot(settingsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.data();
    callback({
      id: snapshot.id,
      ...data,
      updated_at: data.updated_at?.toDate(),
    } as PlatformSettings);
  });
};

// Update platform settings
export const updatePlatformSettings = async (
  userId: string,
  updates: Partial<PlatformSettings>
) => {
  const settingsRef = doc(db, "platform_settings", SETTINGS_DOC_ID);

  // Check if document exists
  const settingsDoc = await getDoc(settingsRef);

  const updateData = {
    ...updates,
    updated_at: new Date(),
    updated_by: userId,
  };

  if (settingsDoc.exists()) {
    // Update existing document
    await updateDoc(settingsRef, updateData);
  } else {
    // Create new document with defaults merged with updates
    await setDoc(settingsRef, {
      id: SETTINGS_DOC_ID,
      ...updateData,
    });
  }
};

// Reset platform settings to defaults
export const resetPlatformSettings = async (userId: string) => {
  const settingsRef = doc(db, "platform_settings", SETTINGS_DOC_ID);

  const defaultSettings: PlatformSettings = {
    id: SETTINGS_DOC_ID,
    openai_model: "gpt-4",
    openai_temperature: 0.7,
    max_tokens: 500,
    max_workspaces: 100,
    max_agents_per_workspace: 10,
    max_conversations_per_month: 10000,
    enable_analytics: true,
    enable_logging: true,
    log_retention_days: 30,
    default_currency: "USD",
    enable_workflows: true,
    enable_ai_replies: true,
    enable_templates: true,
    enable_webhooks: true,
    enable_error_tracking: false,
    updated_at: new Date(),
    updated_by: userId,
  };

  await setDoc(settingsRef, defaultSettings);
};
