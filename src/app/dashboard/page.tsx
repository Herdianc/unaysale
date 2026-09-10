"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Building2, CheckCircle, Clock, XCircle, Home, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stats {
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalFavorites?: number;
}

interface RecentProperty {
  id: string;
  title: string;
  code?: string;
  price: number;
  status: string;
  createdAt: string;
  category: { name: string };
  images: { url: string }[];
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  PENDING: "Pending",
  SOLD: "Terjual",
  RENTED: "Disewa",
  DRAFT: "Draf",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  SOLD: "bg-blue-100 text-blue-700",
  RENTED: "bg-purple-100 text-purple-700",
  DRAFT: "bg-gray-100 text-gray-700",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, propertiesRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/properties"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json();
          setRecentProperties(propertiesData.properties || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {session?.user?.name || "User"}</h1>
          <p className="text-gray-500 mt-1">Berikut ringkasan properti Anda</p>
        </div>
        <Link href="/dashboard/properti/tambah">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Tambah Properti
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Properti", value: stats?.totalProperties || 0, icon: Building2, color: "text-gray-600" },
          { label: "Aktif", value: stats?.activeProperties || 0, icon: CheckCircle, color: "text-green-600" },
          { label: "Pending", value: stats?.pendingProperties || 0, icon: Clock, color: "text-yellow-600" },
          { label: "Terjual", value: stats?.soldProperties || 0, icon: Home, color: "text-blue-600" },
          { label: "Disewa", value: stats?.rentedProperties || 0, icon: XCircle, color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Properti Terbaru</h2>
        </div>
        {recentProperties.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Belum ada properti</p>
            <Link href="/dashboard/properti/tambah">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Tambah Properti
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Properti</th>
                  <th className="px-6 py-3 font-medium">Kategori</th>
                  <th className="px-6 py-3 font-medium">Harga</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {property.images[0] ? (
                            <img
                              src={property.images[0].url}
                              alt={property.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {property.title}
                        </span>
                        {property.code && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#1769AA]/10 text-[#1769AA] font-semibold shrink-0">
                            {property.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{property.category.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[property.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[property.status] || property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(property.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
