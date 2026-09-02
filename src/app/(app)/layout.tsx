import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCurrentBusiness } from "@/lib/current-user";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileNav } from "@/components/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  return (
    <div className="flex flex-1">
      <SidebarNav businessName={business.name} />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-28 sm:px-8 sm:pb-12 sm:pt-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
