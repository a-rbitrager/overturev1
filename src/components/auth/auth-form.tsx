"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import {
  signInWithEmail,
  signUpWithEmail,
  type AuthActionResult,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResult = (result: AuthActionResult) => {
    if (!result.ok) {
      setMessage(result.error ?? "Something went wrong.");
      toast.error(result.error ?? "Something went wrong.");
      return;
    }

    setMessage(result.message ?? null);

    if (mode === "signup") {
      toast.success(result.message ?? "Account created.");
      router.push("/login");
      return;
    }

    toast.success("Signed in.");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {mode === "signup" ? (
        <div className="space-y-2">
          <label className="text-sm text-white">Display name</label>
          <Input
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            value={name}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm text-white">Email</label>
        <Input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white">Password</label>
        <Input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          type="password"
          value={password}
        />
      </div>

      {message ? (
        <div className="rounded-[22px] border border-white/10 bg-white/4 px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </div>
      ) : null}

      <Button
        className="w-full"
        disabled={pending}
        onClick={() => {
          setPending(true);
          startTransition(async () => {
            try {
              const result =
                mode === "signup"
                  ? await signUpWithEmail(email, password, name)
                  : await signInWithEmail(email, password);
              handleResult(result);
            } finally {
              setPending(false);
            }
          });
        }}
      >
        {pending
          ? mode === "signup"
            ? "Creating account..."
            : "Signing in..."
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </Button>
    </div>
  );
}
