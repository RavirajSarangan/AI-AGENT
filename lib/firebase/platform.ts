import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  owner_email: string;
  status: "active" | "suspended" | "deleted";
  plan: "free" | "starter" | "pro" | "agency" | "enterprise";
  created_at: Date;
  updated_at: Date;
  settings: {
    logo?: string;
    website?: string;
    industry?: string;
    timezone?: string;
  };
  usage: {
    whatsapp_messages: number;
    instagram_messages: number;
    workflow_executions: number;
    contacts: number;
    team_members: number;
  };
  limits: {
    whatsapp_messages: number;
    instagram_messages: number;
    workflow_executions: number;
    contacts: number;
    team_members: number;
  };
  channels: {
    whatsapp_connected: boolean;
    instagram_connected: boolean;
  };
}

export interface PlatformStats {
  total_workspaces: number;
  active_workspaces: number;
  total_users: number;
  total_messages_today: number;
  total_workflow_runs_today: number;
  total_contacts: number;
  uptime_percentage: number;
  error_rate: number;
}

export interface SystemIncident {
  id: string;
  tenant_id: string;
  type: "webhook_failure" | "workflow_error" | "api_error" | "channel_disconnected";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  stack_trace?: string;
  details: any;
  resolved: boolean;
  created_at: Date;
  resolved_at?: Date;
}

// Subscribe to all workspaces (Owner only)
export const subscribeToAllWorkspaces = (
  callback: (workspaces: Workspace[]) => void
) => {
  const workspacesRef = collection(db, "workspaces");
  const q = query(workspacesRef, orderBy("created_at", "desc"));

  return onSnapshot(q, (snapshot) => {
    const workspaces = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
      } as Workspace;
    });
    callback(workspaces);
  });
};

// Get platform-wide statistics
export const getPlatformStats = async (): Promise<PlatformStats> => {
  const workspacesRef = collection(db, "workspaces");
  const workspacesSnapshot = await getDocs(workspacesRef);

  const usersRef = collection(db, "users");
  const usersSnapshot = await getDocs(usersRef);

  let totalMessagesToday = 0;
  let totalWorkflowRunsToday = 0;
  let totalContacts = 0;
  let activeWorkspaces = 0;

  for (const doc of workspacesSnapshot.docs) {
    const data = doc.data();
    if (data.status === "active") activeWorkspaces++;
    totalMessagesToday += (data.usage?.whatsapp_messages || 0) + (data.usage?.instagram_messages || 0);
    totalWorkflowRunsToday += data.usage?.workflow_executions || 0;
    totalContacts += data.usage?.contacts || 0;
  }

  return {
    total_workspaces: workspacesSnapshot.size,
    active_workspaces: activeWorkspaces,
    total_users: usersSnapshot.size,
    total_messages_today: totalMessagesToday,
    total_workflow_runs_today: totalWorkflowRunsToday,
    total_contacts: totalContacts,
    uptime_percentage: 99.9,
    error_rate: 0.5,
  };
};

// Subscribe to platform stats (real-time)
export const subscribeToPlatformStats = (
  callback: (stats: PlatformStats) => void
) => {
  const workspacesRef = collection(db, "workspaces");
  
  return onSnapshot(workspacesRef, async () => {
    const stats = await getPlatformStats();
    callback(stats);
  });
};

// Create workspace (Owner only)
export const createWorkspace = async (
  name: string,
  ownerId: string,
  ownerEmail: string,
  plan: Workspace["plan"] = "free"
) => {
  const workspacesRef = collection(db, "workspaces");
  const newWorkspaceRef = doc(workspacesRef);

  const planLimits = {
    free: { whatsapp_messages: 100, instagram_messages: 100, workflow_executions: 100, contacts: 50, team_members: 1 },
    starter: { whatsapp_messages: 1000, instagram_messages: 500, workflow_executions: 1000, contacts: 500, team_members: 3 },
    pro: { whatsapp_messages: 5000, instagram_messages: 3000, workflow_executions: 10000, contacts: 5000, team_members: 10 },
    agency: { whatsapp_messages: 20000, instagram_messages: 10000, workflow_executions: 50000, contacts: 20000, team_members: 25 },
    enterprise: { whatsapp_messages: -1, instagram_messages: -1, workflow_executions: -1, contacts: -1, team_members: -1 },
  };

  await setDoc(newWorkspaceRef, {
    name,
    owner_id: ownerId,
    owner_email: ownerEmail,
    status: "active",
    plan,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    settings: {},
    usage: {
      whatsapp_messages: 0,
      instagram_messages: 0,
      workflow_executions: 0,
      contacts: 0,
      team_members: 1,
    },
    limits: planLimits[plan],
    channels: {
      whatsapp_connected: false,
      instagram_connected: false,
    },
  });

  return newWorkspaceRef.id;
};

// Update workspace status (Owner only)
export const updateWorkspaceStatus = async (
  workspaceId: string,
  status: "active" | "suspended" | "deleted"
) => {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  await updateDoc(workspaceRef, {
    status,
    updated_at: serverTimestamp(),
  });
};

// Update workspace plan (Owner only)
export const updateWorkspacePlan = async (
  workspaceId: string,
  plan: Workspace["plan"]
) => {
  const planLimits = {
    free: { whatsapp_messages: 100, instagram_messages: 100, workflow_executions: 100, contacts: 50, team_members: 1 },
    starter: { whatsapp_messages: 1000, instagram_messages: 500, workflow_executions: 1000, contacts: 500, team_members: 3 },
    pro: { whatsapp_messages: 5000, instagram_messages: 3000, workflow_executions: 10000, contacts: 5000, team_members: 10 },
    agency: { whatsapp_messages: 20000, instagram_messages: 10000, workflow_executions: 50000, contacts: 20000, team_members: 25 },
    enterprise: { whatsapp_messages: -1, instagram_messages: -1, workflow_executions: -1, contacts: -1, team_members: -1 },
  };

  const workspaceRef = doc(db, "workspaces", workspaceId);
  await updateDoc(workspaceRef, {
    plan,
    limits: planLimits[plan],
    updated_at: serverTimestamp(),
  });
};

// Subscribe to system incidents (Owner only)
export const subscribeToSystemIncidents = (
  callback: (incidents: SystemIncident[]) => void
) => {
  const incidentsRef = collection(db, "system_incidents");
  const q = query(
    incidentsRef,
    where("resolved", "==", false),
    orderBy("created_at", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const incidents = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        resolved_at: data.resolved_at?.toDate(),
      } as SystemIncident;
    });
    callback(incidents);
  });
};

// Log system incident
export const logSystemIncident = async (
  tenantId: string,
  type: SystemIncident["type"],
  severity: SystemIncident["severity"],
  message: string,
  details: any
) => {
  const incidentsRef = collection(db, "system_incidents");
  const newIncidentRef = doc(incidentsRef);

  await setDoc(newIncidentRef, {
    tenant_id: tenantId,
    type,
    severity,
    message,
    details,
    resolved: false,
    created_at: serverTimestamp(),
  });

  return newIncidentRef.id;
};

// Resolve incident
export const resolveIncident = async (incidentId: string) => {
  const incidentRef = doc(db, "system_incidents", incidentId);
  await updateDoc(incidentRef, {
    resolved: true,
    resolved_at: serverTimestamp(),
  });
};

// Delete workspace (hard delete - Owner only)
export const deleteWorkspace = async (workspaceId: string) => {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  
  try {
    // Cascade delete all related data
    const collections = [
      "conversations",
      "messages",
      "contacts",
      "workflows",
      "templates",
      "tenant_members",
      "execution_logs",
    ];

    // Delete all documents in each collection where tenant_id matches
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where("tenant_id", "==", workspaceId));
      const snapshot = await getDocs(q);

      // Delete in batches of 500 (Firestore limit)
      const batches: any[] = [];
      let batch = writeBatch(db);
      let operationCount = 0;

      for (const document of snapshot.docs) {
        batch.delete(document.ref);
        operationCount++;

        if (operationCount === 500) {
          batches.push(batch);
          batch = writeBatch(db);
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        batches.push(batch);
      }

      // Commit all batches
      await Promise.all(batches.map((b) => b.commit()));
    }

    // Finally delete the workspace itself
    await deleteDoc(workspaceRef);

    console.log(`Successfully deleted workspace ${workspaceId} and all related data`);
  } catch (error) {
    console.error("Error deleting workspace:", error);
    throw new Error("Failed to delete workspace and related data");
  }
};
