import { Card } from "@/components/ui/card";

export default function WorkflowExecutionDetailPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-indigo-300">Execution detail</p>
        <h2 className="text-3xl font-bold text-white">Flow run #123</h2>
        <p className="text-sm text-slate-400">Success · 09:12 UTC · Trigger: Incoming message</p>
      </div>
      <Card className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Step outputs</p>
        <div className="space-y-3 text-sm text-slate-200">
          <div>
            <p className="font-semibold text-white">Condition</p>
            <p>Message “price” matched, 1 branch taken.</p>
          </div>
          <div>
            <p className="font-semibold text-white">AI Generate</p>
            <p>Prompt: “You are a friendly sales assistant…”</p>
          </div>
          <div>
            <p className="font-semibold text-white">Send WhatsApp</p>
            <p>“Our pricing tiers start at $199/mo…”.</p>
          </div>
        </div>
      </Card>
      <Card className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Raw payload</p>
        <pre className="rounded-2xl bg-slate-950/80 p-4 text-xs text-slate-300">{`{
  "message": "Hi, what are your prices?",
  "from": "+1 555 100 1234"
}`}</pre>
      </Card>
    </div>
  );
}
