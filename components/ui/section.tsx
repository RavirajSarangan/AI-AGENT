import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  children: ReactNode;
  gridClassName?: string;
}

export function Section({
  title,
  description,
  children,
  className,
  gridClassName,
  ...props
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">{title}</p>
        {description && <p className="text-2xl font-semibold text-white/90">{description}</p>}
      </div>
      <div className={cn(gridClassName ?? "grid gap-4 md:grid-cols-2")}>{children}</div>
    </section>
  );
}
