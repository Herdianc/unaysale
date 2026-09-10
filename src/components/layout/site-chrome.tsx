"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppShell =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isAppShell) return <>{children}</>;

  return (
    <>
      <Header />
      <div className="min-h-[60vh]">{children}</div>
      <Footer />
    </>
  );
}
