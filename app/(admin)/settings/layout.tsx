"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const settingsNav = [
  { name: "Business Profile", href: "/app/settings/profile" },
  { name: "WhatsApp Integration", href: "/app/settings/whatsapp" },
  { name: "AI Configuration", href: "/app/settings/ai" },
  { name: "Business Hours", href: "/app/settings/hours" },
  { name: "Team Members", href: "/app/settings/team" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and workspace settings
        </p>
      </div>

      <div className="flex gap-6">
        {/* Settings Navigation */}
        <Card className="h-fit w-64 p-2">
          <nav className="space-y-1">
            {settingsNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </Card>

        {/* Settings Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
