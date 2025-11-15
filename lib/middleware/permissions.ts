import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export interface PermissionContext {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "agent";
}

export class PermissionError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * Get current user's permission context
 * Note: In a production app, you would verify the Firebase ID token server-side
 * using Firebase Admin SDK. This is a simplified version for client-side permissions.
 */
export async function getPermissionContext(
  userId: string,
  tenantId: string
): Promise<PermissionContext> {
  try {
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      throw new PermissionError("User profile not found", 404);
    }

    const userData = userDoc.data();
    const role = userData.role as "owner" | "admin" | "agent";

    if (!role) {
      throw new PermissionError("User role not configured", 403);
    }

    // Verify tenant access
    await checkTenantAccess(userId, tenantId);

    return {
      userId,
      tenantId,
      role,
    };
  } catch (error) {
    if (error instanceof PermissionError) {
      throw error;
    }
    throw new PermissionError("Failed to get permission context", 500);
  }
}

/**
 * Check if user has permission to perform an action
 */
export function checkPermission(
  context: PermissionContext,
  requiredRoles: Array<"owner" | "admin" | "agent">
): void {
  if (!requiredRoles.includes(context.role)) {
    throw new PermissionError(
      `Access denied. Required roles: ${requiredRoles.join(", ")}`,
      403
    );
  }
}

/**
 * Check if user owns or has access to a specific resource
 */
export async function checkResourceAccess(
  context: PermissionContext,
  resourceCollection: string,
  resourceId: string
): Promise<void> {
  try {
    const resourceDoc = await getDoc(doc(db, resourceCollection, resourceId));

    if (!resourceDoc.exists()) {
      throw new PermissionError("Resource not found", 404);
    }

    const resourceData = resourceDoc.data();

    // Check if resource belongs to user's tenant
    if (resourceData.tenant_id !== context.tenantId) {
      throw new PermissionError(
        "Access denied. Resource belongs to different tenant",
        403
      );
    }

    // Additional checks for agents (can only access assigned resources)
    if (context.role === "agent") {
      // For conversations, check if assigned to agent
      if (
        resourceCollection === "conversations" &&
        resourceData.assigned_to &&
        resourceData.assigned_to !== context.userId
      ) {
        throw new PermissionError(
          "Access denied. Resource not assigned to you",
          403
        );
      }
    }
  } catch (error) {
    if (error instanceof PermissionError) {
      throw error;
    }
    throw new PermissionError("Failed to verify resource access", 500);
  }
}

/**
 * Verify user has access to a specific tenant
 */
export async function checkTenantAccess(
  userId: string,
  tenantId: string
): Promise<void> {
  try {
    const memberDoc = await getDoc(
      doc(db, "tenant_members", `${tenantId}_${userId}`)
    );

    if (!memberDoc.exists()) {
      throw new PermissionError(
        "Access denied. You are not a member of this tenant",
        403
      );
    }

    const memberData = memberDoc.data();
    if (memberData.status !== "active") {
      throw new PermissionError(
        "Access denied. Your membership is not active",
        403
      );
    }
  } catch (error) {
    if (error instanceof PermissionError) {
      throw error;
    }
    throw new PermissionError("Failed to verify tenant access", 500);
  }
}

/**
 * Helper function for client-side permission checks in components
 */
export async function withClientPermissions(
  userId: string,
  tenantId: string,
  requiredRoles: Array<"owner" | "admin" | "agent">,
  action: () => Promise<void>
): Promise<void> {
  try {
    const context = await getPermissionContext(userId, tenantId);
    checkPermission(context, requiredRoles);
    await action();
  } catch (error) {
    if (error instanceof PermissionError) {
      throw error;
    }
    throw new Error("Permission check failed");
  }
}
