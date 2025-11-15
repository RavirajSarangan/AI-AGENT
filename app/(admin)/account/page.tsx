import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Account</p>
        <h2 className="text-3xl font-bold text-white">My profile</h2>
        <p className="text-sm text-slate-400">Manage personal info, password, and notifications.</p>
      </header>
      <Card className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Name</label>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white" defaultValue="Emma Walker" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Email</label>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white" defaultValue="emma@acme.co" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Change password</label>
          <input type="password" placeholder="New password" className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white" />
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <label className="inline-flex items-center gap-3">
            <input type="checkbox" defaultChecked />
            Email notifications
          </label>
          <label className="inline-flex items-center gap-3">
            <input type="checkbox" />
            Slack alerts
          </label>
        </div>
        <Button variant="primary" className="rounded-2xl px-6 py-3 text-sm">
          Update profile
        </Button>
      </Card>
    </div>
  );
}
