import type * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}
