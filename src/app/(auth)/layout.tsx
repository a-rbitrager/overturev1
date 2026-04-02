import Link from "next/link";
import type * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-[rgba(9,16,27,0.9)] shadow-[0_18px_54px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <div className="grid min-h-[680px] gap-0 lg:grid-cols-[1.1fr_minmax(0,1fr)]">
          <div className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,142,61,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.12),transparent_28%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <Link
                className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]"
                href="/"
              >
                Overture
              </Link>
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                  Free-tier architecture
                </p>
                <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white">
                  A gentle, playlist-first music app with a real streaming shell.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-[color:var(--muted-foreground)]">
                  Built on Next.js, Supabase, Prisma, and direct public storage
                  streaming. Use it for rights-cleared audio, curated libraries,
                  and low-latency playback.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
