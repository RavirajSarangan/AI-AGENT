"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus } from "lucide-react";
import { useState } from "react";
import { switchWorkspace } from "@/lib/firebase/users";
import { useRouter } from "next/navigation";

export function WorkspaceSwitcher() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const getRoleBadgeVariant = (role: string) => {
    if (role === "owner") return "default";
    if (role === "admin") return "secondary";
    return "outline";
  };

  const handleWorkspaceChange = async (tenantId: string) => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      await switchWorkspace(userProfile.uid, tenantId);
      // Refresh the page to reload all data with new tenant
      router.refresh();
    } catch (error) {
      console.error("Error switching workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-purple-500" />
              <div>
                <CardTitle className="text-lg">Current Workspace</CardTitle>
                <CardDescription>
                  {userProfile.tenants.length} workspace{userProfile.tenants.length === 1 ? '' : 's'} available
                </CardDescription>
              </div>
            </div>
            <Badge variant={getRoleBadgeVariant(userProfile.role)}>
              {userProfile.role.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select
              value={userProfile.currentTenant}
              onValueChange={handleWorkspaceChange}
              disabled={loading}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userProfile.tenants.map((tenantId) => (
                  <SelectItem key={tenantId} value={tenantId}>
                    {tenantId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" title="Create new workspace">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
