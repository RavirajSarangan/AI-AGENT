import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Billing</p>
        <h2 className="text-3xl font-bold text-white">Plan & usage</h2>
      </header>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current plan</p>
            <p className="text-2xl font-semibold text-white">Pro</p>
            <p className="text-sm text-slate-400">Next billing: Jul 1, 2025</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" className="rounded-full px-5 py-2 text-sm">
              Upgrade
            </Button>
            <Button variant="ghost" className="rounded-full px-5 py-2 text-sm">
              Update payment
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Usage</p>
            <p className="text-sm text-slate-300">Messages this month: 42,780</p>
            <p className="text-sm text-slate-300">Workflow executions: 1,184</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Payment method</p>
            <p className="text-sm text-slate-300">Visa •••• 4242</p>
            <p className="text-sm text-slate-400">You can switch to ACH or corporate card.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
