"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

function safeNext(next: string | undefined): string {
  // Only allow same-origin paths to avoid open-redirect.
  // Default to /today since "/" is now the public marketing landing.
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/today";
  return next;
}

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/today"));

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password are required.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    logger.warn("sign-in failed", { email, code: error.code });
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // If the signup form didn't carry an explicit `next`, send freshly confirmed
  // users to /onboarding so they can pick a program template before they hit
  // the Today view.
  const rawNext = String(formData.get("next") ?? "").trim();
  const next = rawNext ? safeNext(rawNext) : "/onboarding";

  if (!email || !password) {
    redirect(`/signup?error=${encodeURIComponent("Email and password are required.")}`);
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent("Password must be at least 8 characters.")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    logger.warn("sign-up failed", { email, code: error.code });
    redirect(`/signup?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  revalidatePath("/", "layout");

  // If email confirmation is disabled in Supabase settings, signUp returns a
  // live session and the user is already signed in — send them straight into
  // onboarding instead of a dead-end "check your email" page. When
  // confirmation is enabled, `session` is null and they must click the email.
  if (data.session) {
    redirect(next);
  }
  redirect(`/auth/check-email?email=${encodeURIComponent(email)}`);
}

export async function signInWithMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNext(String(formData.get("next") ?? "/today"));

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Email is required.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    logger.warn("magic-link failed", { email, code: error.code });
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/auth/check-email?email=${encodeURIComponent(email)}`);
}

export async function sendPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { ok: false as const, error: "Email is required." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/reset-password`,
  });
  if (error) {
    logger.warn("password-reset send failed", { email, code: error.code });
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export async function setNewPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    logger.warn("password update failed", { code: error.code });
    return { ok: false as const, error: error.message };
  }
  // Force a clean sign-in with the new password — locks out any leftover session.
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?reset=1");
}

export async function updateEmailAction(formData: FormData) {
  const newEmail = String(formData.get("email") ?? "").trim();
  if (!newEmail) {
    return { ok: false as const, error: "Email is required." };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not authenticated." };
  }
  if (user.email === newEmail) {
    return { ok: false as const, error: "That's already your email." };
  }
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    logger.warn("email update failed", { code: error.code });
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const, message: `Confirmation sent to ${newEmail}` };
}

export async function updatePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get("current") ?? "");
  const newPassword = String(formData.get("password") ?? "");
  if (newPassword.length < 8) {
    return { ok: false as const, error: "New password must be at least 8 characters." };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false as const, error: "Not authenticated." };
  }
  // Verify the current password by attempting a sign-in.
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyErr) {
    return { ok: false as const, error: "Current password is incorrect." };
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    logger.warn("password update failed", { code: error.code });
    return { ok: false as const, error: error.message };
  }
  revalidatePath("/", "layout");
  return { ok: true as const, message: "Password updated." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
