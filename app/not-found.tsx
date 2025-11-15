import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center space-y-6 px-6 py-12 text-center">
      <PublicHeader />
      <Card className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-indigo-300">Page not found</p>
        <h1 className="text-4xl font-semibold text-white">404</h1>
        <p className="text-sm text-slate-400">
          The page you’re looking for is missing. Head back to the landing page or jump into the admin experience.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white">
            Back to landing
          </Link>
          <Link href="/app/dashboard" className="rounded-full bg-indigo-600/80 px-5 py-3 text-sm text-white">
            Go to dashboard
          </Link>
        </div>
      </Card>
      <PublicFooter />
    </main>
  );
}
