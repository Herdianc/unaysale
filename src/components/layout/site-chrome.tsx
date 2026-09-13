"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import PWAInstall from "@/components/pwa-install";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isDashboard = pathname.startsWith("/dashboard");

  // Admin panel: tanpa header/footer/nav HP (layar penuh)
  if (isAdmin) return <>{children}</>;

  // Dashboard di HP: tanpa header atas, tapi tetap ada nav bawah (Home/Cari/Favorit/Akun)
  if (isDashboard) {
    return (
      <>
        <div className="min-h-[60vh] pb-20 md:pb-0">{children}</div>
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[60vh]">{children}</div>
      <Footer />
      <MobileBottomNav />
      <PWAInstall />
    </>
  );
}
