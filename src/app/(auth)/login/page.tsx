import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentViewer } from "@/lib/music-service";

export default async function LoginPage() {
  const viewer = await getCurrentViewer();

  if (viewer.user && !viewer.isDemoMode) {
    redirect("/");
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="space-y-3">
          <Badge>Log in</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">
              Sign in with Supabase email auth to save playlists, sync your
              library, and move from the demo catalog into real storage-backed
              playback.
            </p>
          </div>
        </div>

        <AuthForm mode="login" />

        <p className="text-sm text-[color:var(--muted-foreground)]">
          Need an account?{" "}
          <Link className="text-white underline underline-offset-4" href="/signup">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
