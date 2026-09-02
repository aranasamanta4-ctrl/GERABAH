import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCurrentBusiness } from "@/lib/current-user";
import { AuthShell } from "@/components/auth-shell";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const business = await getCurrentBusiness();
  if (business) redirect("/dashboard");

  return (
    <AuthShell title="Daftarkan Usahamu" subtitle="Sedikit keterangan sebelum mulai mencatat.">
      <OnboardingForm />
    </AuthShell>
  );
}
