"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    // Role-based redirection after user profile is loaded
    if (!loading && user && userProfile) {
      const role = userProfile.role;
      
      // Owner-specific routes
      const ownerRoutes = ['/owner-dashboard', '/owner/workspaces', '/owner/analytics', '/owner/settings', '/owner/logs'];
      const isOwnerRoute = ownerRoutes.some(route => pathname.startsWith(route));
      
      // Admin/Agent routes (regular dashboard)
      const adminRoutes = ['/dashboard', '/conversations', '/contacts', '/workflows', '/simulator', '/settings', '/analytics'];
      const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

      // Redirect based on role and current path
      if (role === 'owner') {
        // Owner accessing regular routes - redirect to owner dashboard
        if (isAdminRoute && pathname === '/dashboard') {
          router.push('/owner-dashboard');
        }
      } else if (isOwnerRoute) {
        // Admin/Agent accessing owner routes - redirect to regular dashboard
        router.push('/dashboard');
      }
    }
  }, [user, userProfile, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
