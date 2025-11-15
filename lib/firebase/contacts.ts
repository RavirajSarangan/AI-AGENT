import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Contact {
  id: string;
  tenant_id: string;
  name: string;
  phone?: string;
  email?: string;
  instagram_username?: string;
  channel: "whatsapp" | "instagram" | "both";
  tags: string[];
  custom_fields: Record<string, any>;
  last_contacted: Date | Timestamp;
  conversation_count: number;
  notes?: string;
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
}

// Real-time listener for all contacts
export const subscribeToContacts = (
  tenantId: string,
  callback: (contacts: Contact[]) => void
) => {
  const q = query(
    collection(db, "contacts"),
    where("tenant_id", "==", tenantId),
    orderBy("last_contacted", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const contacts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      last_contacted: doc.data().last_contacted?.toDate(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
    })) as Contact[];
    callback(contacts);
  });
};

// Real-time listener for single contact
export const subscribeToContact = (
  contactId: string,
  callback: (contact: Contact | null) => void
) => {
  const docRef = doc(db, "contacts", contactId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        id: snapshot.id,
        ...data,
        last_contacted: data.last_contacted?.toDate(),
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Contact);
    } else {
      callback(null);
    }
  });
};

// Create contact
export const createContact = async (
  contact: Omit<Contact, "id" | "created_at" | "updated_at">
) => {
  const docRef = await addDoc(collection(db, "contacts"), {
    ...contact,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return docRef.id;
};

// Update contact
export const updateContact = async (
  contactId: string,
  updates: Partial<Contact>
) => {
  const docRef = doc(db, "contacts", contactId);
  await updateDoc(docRef, {
    ...updates,
    updated_at: serverTimestamp(),
  });
};

// Delete contact
export const deleteContact = async (contactId: string) => {
  const docRef = doc(db, "contacts", contactId);
  await deleteDoc(docRef);
};

// Add tags to contact
export const addContactTags = async (contactId: string, tags: string[]) => {
  const contact = await getDoc(doc(db, "contacts", contactId));
  if (contact.exists()) {
    const existingTags = contact.data().tags || [];
    const newTags = Array.from(new Set([...existingTags, ...tags]));
    await updateDoc(doc(db, "contacts", contactId), {
      tags: newTags,
      updated_at: serverTimestamp(),
    });
  }
};

// Remove tags from contact
export const removeContactTags = async (contactId: string, tags: string[]) => {
  const contact = await getDoc(doc(db, "contacts", contactId));
  if (contact.exists()) {
    const existingTags = contact.data().tags || [];
    const newTags = existingTags.filter((tag: string) => !tags.includes(tag));
    await updateDoc(doc(db, "contacts", contactId), {
      tags: newTags,
      updated_at: serverTimestamp(),
    });
  }
};

// Increment conversation count
export const incrementConversationCount = async (contactId: string) => {
  const contact = await getDoc(doc(db, "contacts", contactId));
  if (contact.exists()) {
    await updateDoc(doc(db, "contacts", contactId), {
      conversation_count: (contact.data().conversation_count || 0) + 1,
      last_contacted: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }
};
