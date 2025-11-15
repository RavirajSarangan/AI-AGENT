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
  limit,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ExecutionLog {
  id: string;
  tenant_id: string;
  workflow_id: string;
  workflow_name: string;
  status: "success" | "error" | "running";
  started_at: Date | Timestamp;
  completed_at?: Date | Timestamp;
  duration_ms?: number;
  duration?: number; // Alias for duration_ms
  steps_completed: number;
  total_steps: number;
  steps?: number; // Alias for steps_completed
  trigger_data?: any;
  error_message?: string;
  error?: string; // Alias for error_message
  logs: Array<{
    timestamp: Date | Timestamp;
    step_name: string;
    status: "success" | "error" | "running";
    message: string;
    data?: any;
  }>;
}

// Real-time listener for workflow execution logs
export const subscribeToExecutionLogs = (
  workflowId: string,
  callback: (logs: ExecutionLog[]) => void,
  maxResults: number = 50
) => {
  const q = query(
    collection(db, "execution_logs"),
    where("workflow_id", "==", workflowId),
    orderBy("started_at", "desc"),
    limit(maxResults)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      started_at: doc.data().started_at?.toDate(),
      completed_at: doc.data().completed_at?.toDate(),
      logs: doc.data().logs?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate(),
      })),
    })) as ExecutionLog[];
    callback(logs);
  });
};

// Real-time listener for single execution log
export const subscribeToExecutionLog = (
  executionId: string,
  callback: (log: ExecutionLog | null) => void
) => {
  const docRef = doc(db, "execution_logs", executionId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        id: snapshot.id,
        ...data,
        started_at: data.started_at?.toDate(),
        completed_at: data.completed_at?.toDate(),
        logs: data.logs?.map((log: any) => ({
          ...log,
          timestamp: log.timestamp?.toDate(),
        })),
      } as ExecutionLog);
    } else {
      callback(null);
    }
  });
};

// Real-time listener for all recent executions (dashboard)
export const subscribeToRecentExecutions = (
  tenantId: string,
  callback: (logs: ExecutionLog[]) => void,
  maxResults: number = 20
) => {
  const q = query(
    collection(db, "execution_logs"),
    where("tenant_id", "==", tenantId),
    orderBy("started_at", "desc"),
    limit(maxResults)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      started_at: doc.data().started_at?.toDate(),
      completed_at: doc.data().completed_at?.toDate(),
      logs: doc.data().logs?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate(),
      })),
    })) as ExecutionLog[];
    callback(logs);
  });
};

// Create execution log
export const createExecutionLog = async (
  log: Omit<ExecutionLog, "id" | "started_at">
) => {
  const docRef = await addDoc(collection(db, "execution_logs"), {
    ...log,
    started_at: serverTimestamp(),
  });
  return docRef.id;
};

// Update execution log with completion
export const completeExecutionLog = async (
  executionId: string,
  status: "success" | "error",
  errorMessage?: string
) => {
  const docRef = doc(db, "execution_logs", executionId);
  const completedAt = new Date();
  const startedDoc = await getDoc(docRef);
  const startedAt = startedDoc.data()?.started_at?.toDate();
  const durationMs = startedAt
    ? completedAt.getTime() - startedAt.getTime()
    : 0;

  await updateDoc(docRef, {
    status,
    completed_at: serverTimestamp(),
    duration_ms: durationMs,
    error_message: errorMessage || null,
  });
};

// Add step log to execution
export const addStepLog = async (
  executionId: string,
  stepLog: {
    step_name: string;
    status: "success" | "error" | "running";
    message: string;
    data?: any;
  }
) => {
  const docRef = doc(db, "execution_logs", executionId);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const existingLogs = snapshot.data().logs || [];
    await updateDoc(docRef, {
      logs: [
        ...existingLogs,
        {
          ...stepLog,
          timestamp: serverTimestamp(),
        },
      ],
      steps_completed: existingLogs.length + 1,
    });
  }
};
