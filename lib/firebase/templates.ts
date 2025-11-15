import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export interface MessageTemplate {
  id: string;
  tenant_id: string;
  name: string;
  category: "greeting" | "sales" | "support" | "marketing" | "custom";
  content: string;
  variables: string[]; // e.g., ["name", "order_id"]
  channels: ("whatsapp" | "instagram")[];
  language: string;
  status: "active" | "draft";
  usage_count: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Subscribe to templates for real-time updates
export const subscribeToTemplates = (
  tenantId: string,
  callback: (templates: MessageTemplate[]) => void
) => {
  const templatesRef = collection(db, "message_templates");
  const q = query(
    templatesRef,
    where("tenant_id", "==", tenantId),
    orderBy("updated_at", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const templates = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as MessageTemplate;
    });
    callback(templates);
  });
};

// Create new template
export const createTemplate = async (
  tenantId: string,
  template: Omit<MessageTemplate, "id" | "created_at" | "updated_at" | "usage_count">
) => {
  const templatesRef = collection(db, "message_templates");
  const newTemplateRef = doc(templatesRef);

  await setDoc(newTemplateRef, {
    ...template,
    tenant_id: tenantId,
    usage_count: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return newTemplateRef.id;
};

// Update template
export const updateTemplate = async (
  templateId: string,
  updates: Partial<MessageTemplate>
) => {
  const templateRef = doc(db, "message_templates", templateId);
  await updateDoc(templateRef, {
    ...updates,
    updated_at: serverTimestamp(),
  });
};

// Delete template
export const deleteTemplate = async (templateId: string) => {
  const templateRef = doc(db, "message_templates", templateId);
  await deleteDoc(templateRef);
};

// Increment template usage
export const incrementTemplateUsage = async (templateId: string) => {
  const templateRef = doc(db, "message_templates", templateId);
  const templateDoc = await getDoc(templateRef);
  
  if (templateDoc.exists()) {
    const currentUsage = templateDoc.data().usage_count || 0;
    await updateDoc(templateRef, {
      usage_count: currentUsage + 1,
      updated_at: serverTimestamp(),
    });
  }
};
