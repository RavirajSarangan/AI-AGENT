import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

export type UserRole = "owner" | "admin" | "agent";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  tenants: string[]; // Array of tenant_ids user has access to
  currentTenant: string; // Active workspace tenant_id
  photoURL?: string;
  phoneNumber?: string;
  jobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface TenantMember {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  lastLogin?: Date;
  status: "active" | "invited" | "suspended";
  invitedAt?: Date;
  invitedBy?: string;
}

// Create or update user profile
export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  tenantId: string,
  role: UserRole = "admin"
) => {
  const userRef = doc(db, "users", uid);
  const userData: Partial<UserProfile> = {
    uid,
    email,
    displayName,
    role,
    tenants: [tenantId],
    currentTenant: tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
  };

  await setDoc(userRef, userData, { merge: true });

  // Add user to tenant members
  const memberRef = doc(db, "tenant_members", `${tenantId}_${uid}`);
  await setDoc(memberRef, {
    tenant_id: tenantId,
    uid,
    email,
    displayName,
    role,
    status: "active",
    invitedAt: serverTimestamp(),
  });

  return userData;
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      lastLogin: data.lastLogin?.toDate(),
    } as UserProfile;
  }

  return null;
};

// Subscribe to user profile changes
export const subscribeToUserProfile = (
  uid: string,
  callback: (profile: UserProfile | null) => void
) => {
  const userRef = doc(db, "users", uid);

  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastLogin: data.lastLogin?.toDate(),
      } as UserProfile);
    } else {
      callback(null);
    }
  });
};

// Update user's current workspace
export const switchWorkspace = async (uid: string, tenantId: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    currentTenant: tenantId,
    updatedAt: serverTimestamp(),
  });
};

// Update last login
export const updateLastLogin = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  
  // Check if document exists first
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    console.warn(`User document ${uid} does not exist, skipping last login update`);
    return;
  }
  
  await updateDoc(userRef, {
    lastLogin: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Get tenant members
export const getTenantMembers = async (tenantId: string): Promise<TenantMember[]> => {
  const membersRef = collection(db, "tenant_members");
  const q = query(membersRef, where("tenant_id", "==", tenantId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      lastLogin: data.lastLogin?.toDate(),
      invitedAt: data.invitedAt?.toDate(),
    } as TenantMember;
  });
};

// Subscribe to tenant members
export const subscribeToTenantMembers = (
  tenantId: string,
  callback: (members: TenantMember[]) => void
) => {
  const membersRef = collection(db, "tenant_members");
  const q = query(membersRef, where("tenant_id", "==", tenantId));

  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        lastLogin: data.lastLogin?.toDate(),
        invitedAt: data.invitedAt?.toDate(),
      } as TenantMember;
    });
    callback(members);
  });
};

// Update member role
export const updateMemberRole = async (
  tenantId: string,
  uid: string,
  role: UserRole
) => {
  const memberRef = doc(db, "tenant_members", `${tenantId}_${uid}`);
  await updateDoc(memberRef, {
    role,
    updatedAt: serverTimestamp(),
  });
};

// Remove member from tenant
export const removeMemberFromTenant = async (tenantId: string, uid: string) => {
  const memberRef = doc(db, "tenant_members", `${tenantId}_${uid}`);
  await updateDoc(memberRef, {
    status: "suspended",
    updatedAt: serverTimestamp(),
  });
};

// Invite member to tenant
export const inviteMemberToTenant = async (
  tenantId: string,
  email: string,
  role: UserRole,
  invitedByUid: string
) => {
  // Create a temporary member record with invited status
  const inviteId = `${tenantId}_${Date.now()}`;
  const memberRef = doc(db, "tenant_members", inviteId);
  
  await setDoc(memberRef, {
    tenant_id: tenantId,
    email,
    role,
    status: "invited",
    invitedAt: serverTimestamp(),
    invitedBy: invitedByUid,
  });

  // TODO: Send email invitation
  return inviteId;
};

// Check user permission for action
export const checkPermission = async (
  uid: string,
  tenantId: string,
  requiredRole: UserRole[]
): Promise<boolean> => {
  const memberRef = doc(db, "tenant_members", `${tenantId}_${uid}`);
  const snapshot = await getDoc(memberRef);

  if (!snapshot.exists()) return false;

  const member = snapshot.data() as TenantMember;
  return requiredRole.includes(member.role) && member.status === "active";
};
