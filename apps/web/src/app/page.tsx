import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";

export const dynamic = "force-dynamic";

/**
 * Root route — the public marketing landing page.
 *
 * Authenticated users skip the landing and go straight to /today (their app).
 * Unauthenticated visitors see the cinematic Midnight landing page, designed
 * to draw them in and convert them to signups.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/today");
  }

  return <LandingPage />;
}
