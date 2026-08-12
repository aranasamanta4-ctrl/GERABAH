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
      <main className="flex-1 overflow-x-hidden pb-20 sm:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
