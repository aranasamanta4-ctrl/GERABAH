import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCurrentBusiness } from "@/lib/current-user";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const business = await getCurrentBusiness();
  if (business) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-md">
        <p className="mb-8 text-center font-serif text-xl font-semibold">GERABAH</p>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-1 text-lg font-semibold text-charcoal">Buat Bisnismu</h1>
          <p className="mb-6 text-sm text-charcoal/60">
            Sedikit info tentang bisnis gerabahmu sebelum mulai.
          </p>
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
