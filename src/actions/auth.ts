"use server";

import { revalidatePath } from "next/cache";

import { hasSupabaseEnv } from "@/lib/env";
import { ensureViewerRecord } from "@/lib/music-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authSchema } from "@/lib/validators";

export type AuthActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string,
): Promise<AuthActionResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      error: "Add your Supabase URL and anon key before using email auth.",
    };
  }

  const parsed = authSchema.safeParse({ email, password, name });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Could not sign you up.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name ?? "",
      },
    },
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  if (data.user) {
    await ensureViewerRecord(data.user);
  }

  revalidatePath("/");

  return {
    ok: true,
    message:
      "Account created. If email confirmation is enabled in Supabase, check your inbox before signing in.",
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      error: "Add your Supabase URL and anon key before using email auth.",
    };
  }

  const parsed = authSchema.pick({ email: true, password: true }).safeParse({
    email,
    password,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Could not sign you in.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  if (data.user) {
    await ensureViewerRecord(data.user);
  }

  revalidatePath("/");

  return {
    ok: true,
  };
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseEnv()) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}
