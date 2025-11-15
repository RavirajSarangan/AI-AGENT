"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/firebase/users";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  readonly children: React.ReactNode;
  readonly allowedRoles: UserRole[];
  readonly fallbackPath?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/dashboard" }: RoleGuardProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (userProfile && !allowedRoles.includes(userProfile.role)) {
        router.push(fallbackPath);
      }
    }
  }, [user, userProfile, loading, router, allowedRoles, fallbackPath]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
}
