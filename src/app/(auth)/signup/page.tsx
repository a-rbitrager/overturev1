import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentViewer } from "@/lib/music-service";

export default async function SignupPage() {
  const viewer = await getCurrentViewer();

  if (viewer.user && !viewer.isDemoMode) {
    redirect("/");
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="space-y-3">
          <Badge>Sign up</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Create your library
            </h1>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">
              Start with the free tier, keep the storage bucket public and
              simple, and build around legal audio you control.
            </p>
          </div>
        </div>

        <AuthForm mode="signup" />

        <p className="text-sm text-[color:var(--muted-foreground)]">
          Already have an account?{" "}
          <Link className="text-white underline underline-offset-4" href="/login">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
