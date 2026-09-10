"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalProperti: number;
  propertiAktif: number;
  propertiPending: number;
  propertiTerjual: number;
  totalUser: number;
  totalAgen: number;
  totalLeads: number;
  newLeadsToday: number;
  propertiDitambahBulanIni: number;
}

interface RecentProperty {
  id: string;
  judul: string;
  harga: number;
  status: string;
  kategori: string;
  createdAt: string;
  agent?: {
    name: string;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>(
    []
  );
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, propertiesRes, activityRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/properties?limit=5&sort=createdAt&order=desc"),
          fetch("/api/admin/activity?limit=10"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json();
          setRecentProperties(propertiesData.properties || propertiesData);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setRecentActivity(activityData.activities || activityData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-green-800",
      SOLD: "bg-blue-100 text-blue-800",
      RENTED: "bg-purple-100 text-purple-800",
      INACTIVE: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Properti",
      value: stats?.totalProperti || 0,
      icon: Building2,
      color: "bg-blue-500",
      change: stats?.propertiDitambahBulanIni || 0,
      changeLabel: "bulan ini",
    },
    {
      title: "Properti Aktif",
      value: stats?.propertiAktif || 0,
      icon: CheckCircle,
      color: "bg-green-500",
      change: 0,
      changeLabel: "",
    },
    {
      title: "Pending",
      value: stats?.propertiPending || 0,
      icon: Clock,
      color: "bg-yellow-500",
      change: 0,
      changeLabel: "",
    },
    {
      title: "Terjual",
      value: stats?.propertiTerjual || 0,
      icon: TrendingUp,
      color: "bg-purple-500",
      change: 0,
      changeLabel: "",
    },
    {
      title: "Total User",
      value: stats?.totalUser || 0,
      icon: Users,
      color: "bg-indigo-500",
      change: 0,
      changeLabel: "",
    },
    {
      title: "Total Agen",
      value: stats?.totalAgen || 0,
      icon: UserCheck,
      color: "bg-pink-500",
      change: 0,
      changeLabel: "",
    },
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: MessageSquare,
      color: "bg-orange-500",
      change: stats?.newLeadsToday || 0,
      changeLabel: "hari ini",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Selamat datang di panel admin UNAYSALE
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value.toLocaleString("id-ID")}
                </p>
                {card.change > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      +{card.change} {card.changeLabel}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`${card.color} p-3 rounded-lg`}
              >
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.slice(4).map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value.toLocaleString("id-ID")}
                </p>
                {card.change > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      +{card.change} {card.changeLabel}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`${card.color} p-3 rounded-lg`}
              >
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Properti Terbaru
              </h2>
              <Link
                href="/admin/properti"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat Semua
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProperties.length > 0 ? (
              recentProperties.map((property) => (
                <div
                  key={property.id}
                  className="px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.judul}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            property.status
                          )}`}
                        >
                          {property.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {property.kategori}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(property.harga)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(property.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-gray-500">
                Belum ada properti
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Aktivitas Terbaru
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "NEW"
                          ? "bg-blue-100"
                          : activity.type === "SOLD"
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {activity.type === "NEW" ? (
                        <Building2 className="h-4 w-4 text-blue-600" />
                      ) : activity.type === "SOLD" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-gray-500">
                Belum ada aktivitas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
