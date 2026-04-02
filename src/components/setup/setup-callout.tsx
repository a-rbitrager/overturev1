import { ExternalLink, FolderOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ViewerState } from "@/lib/types";

export function SetupCallout({ viewer }: { viewer: ViewerState }) {
  if (viewer.hasSupabase && viewer.hasDatabase && !viewer.isDemoMode) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-[rgba(255,142,61,0.26)] bg-[linear-gradient(135deg,rgba(255,142,61,0.12),rgba(11,20,33,0.88))]">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-3">
          <Badge>Setup required</Badge>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Finish the free-tier Supabase wiring
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
              The demo catalog is running locally, but real auth, database
              persistence, and uploaded audio depend on your Supabase project.
              Only upload public-domain, Creative Commons, or otherwise
              rights-cleared audio you are allowed to distribute.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/16 p-4">
            <p className="text-sm font-semibold text-white">1. Environment</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              Copy values into <code>.env.local</code> from{" "}
              <code>.env.example</code>: <code>DATABASE_URL</code>,{" "}
              <code>DIRECT_URL</code>,{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code>, and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/16 p-4">
            <p className="text-sm font-semibold text-white">2. Storage bucket</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              In Supabase Dashboard, create a public bucket named{" "}
              <code>audio-files</code>. Upload files like{" "}
              <code>nightglass.mp3</code> so <code>audioUrl</code> values can use{" "}
              <code>
                https://[PROJECT_ID].supabase.co/storage/v1/object/public/audio-files/[FILENAME].mp3
              </code>
              .
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/16 p-4">
            <p className="text-sm font-semibold text-white">3. Database</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              Run <code>npm run db:generate</code>, <code>npm run db:push</code>,
              and <code>npm run db:seed</code> after your Supabase project is
              ready.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
          <span className="inline-flex items-center gap-2">
            <FolderOpen className="h-3.5 w-3.5" />
            Zero-card, free-tier architecture
          </span>
          <span className="inline-flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            Public bucket: audio-files
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
