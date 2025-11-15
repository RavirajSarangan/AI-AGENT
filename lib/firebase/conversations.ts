import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Message {
  id: string;
  conversation_id: string;
  sender: "user" | "agent" | "ai";
  sender_name?: string;
  content: string;
  timestamp: Date | Timestamp;
  status: "sent" | "delivered" | "read" | "failed";
  metadata?: {
    channel?: "whatsapp" | "instagram";
    media_url?: string;
    media_type?: string;
  };
}

export interface Conversation {
  id: string;
  tenant_id: string;
  contact_id: string;
  contact_name: string;
  contact_phone?: string;
  channel: "whatsapp" | "instagram";
  status: "active" | "resolved" | "snoozed";
  assigned_to?: string;
  last_message: string;
  last_message_time: Date | Timestamp;
  unread_count: number;
  tags: string[];
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
}

// Real-time listener for all conversations
export const subscribeToConversations = (
  tenantId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const q = query(
    collection(db, "conversations"),
    where("tenant_id", "==", tenantId),
    orderBy("last_message_time", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      last_message_time: doc.data().last_message_time?.toDate(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
    })) as Conversation[];
    callback(conversations);
  });
};

// Real-time listener for single conversation
export const subscribeToConversation = (
  conversationId: string,
  callback: (conversation: Conversation | null) => void
) => {
  const docRef = doc(db, "conversations", conversationId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        id: snapshot.id,
        ...data,
        last_message_time: data.last_message_time?.toDate(),
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Conversation);
    } else {
      callback(null);
    }
  });
};

// Real-time listener for messages in a conversation
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, "messages"),
    where("conversation_id", "==", conversationId),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    })) as Message[];
    callback(messages);
  });
};

// Create conversation
export const createConversation = async (
  conversation: Omit<Conversation, "id" | "created_at" | "updated_at">
) => {
  const docRef = await addDoc(collection(db, "conversations"), {
    ...conversation,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return docRef.id;
};

// Send message
export const sendMessage = async (
  message: Omit<Message, "id" | "timestamp">
) => {
  const docRef = await addDoc(collection(db, "messages"), {
    ...message,
    timestamp: serverTimestamp(),
  });

  // Update conversation
  await updateDoc(doc(db, "conversations", message.conversation_id), {
    last_message: message.content,
    last_message_time: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return docRef.id;
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId: string) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    unread_count: 0,
    updated_at: serverTimestamp(),
  });
};

// Update conversation status
export const updateConversationStatus = async (
  conversationId: string,
  status: Conversation["status"]
) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    status,
    updated_at: serverTimestamp(),
  });
};

// Assign conversation to agent
export const assignConversation = async (
  conversationId: string,
  agentId: string
) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    assigned_to: agentId,
    updated_at: serverTimestamp(),
  });
};

// Add tags to conversation
export const addConversationTags = async (
  conversationId: string,
  tags: string[]
) => {
  const conversation = await getDoc(doc(db, "conversations", conversationId));
  if (conversation.exists()) {
    const existingTags = conversation.data().tags || [];
    const newTags = Array.from(new Set([...existingTags, ...tags]));
    await updateDoc(doc(db, "conversations", conversationId), {
      tags: newTags,
      updated_at: serverTimestamp(),
    });
  }
};
