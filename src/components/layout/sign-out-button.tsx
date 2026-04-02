"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      className="w-full justify-start"
      disabled={pending}
      onClick={() => {
        setPending(true);
        startTransition(async () => {
          await signOut();
          toast.success("Signed out.");
          router.push("/login");
          router.refresh();
          setPending(false);
        });
      }}
      variant="ghost"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
