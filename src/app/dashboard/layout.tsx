"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Users,
  UserCog,
  Menu,
  X,
  LogOut,
  Shield,
  ShieldCheck,
} from "lucide-react";

const baseMenuItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profil", href: "/dashboard/profil", icon: UserCog },
];

const agentMenuItems = [
  { label: "Properti Saya", href: "/dashboard/properti", icon: Building2 },
  { label: "Tambah Properti", href: "/dashboard/properti/tambah", icon: PlusCircle },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
];

const adminMenuItems = [
  { label: "Kelola Agen", href: "/admin/agen", icon: ShieldCheck },
  { label: "Admin Panel", href: "/admin", icon: Shield },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteName, setSiteName] = useState("UNAYSALE");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.siteName) setSiteName(d.siteName);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) return null;

  const role = session.user?.role as string
  const isAdminRole = role === "ADMIN" || role === "SUPER_ADMIN"
  const isAgentRole = role === "AGENT" || isAdminRole

  // USER: hanya Overview + Profil + info upgrade
  // AGENT/ADMIN: full menu properti & leads
  let items = [...baseMenuItems]
  if (isAgentRole) {
    // Sisipkan agent menu di antara Overview dan Profil
    items = [baseMenuItems[0], ...agentMenuItems, baseMenuItems[1]]
  }
  if (isAdminRole) {
    items = [...items, ...adminMenuItems]
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            {siteName}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          {role === "USER" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900">Mode Pengunjung</p>
              <p className="text-xs text-blue-700 mt-1">
                Akun USER hanya bisa lihat properti. Hubungi admin untuk upgrade menjadi Agen agar bisa pasang iklan.
              </p>
            </div>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {items.find((item) => item.href === pathname)?.label || "Dashboard"}
          </h2>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
