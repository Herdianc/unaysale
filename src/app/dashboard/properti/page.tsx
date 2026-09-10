"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Eye,
  Pencil,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Property {
  id: string;
  title: string;
  code?: string;
  price: number;
  status: string;
  transactionType: string;
  category: { name: string };
  district: { name: string };
  images: { url: string }[];
  createdAt: string;
}

const statusFilters = [
  { key: "ALL", label: "Semua" },
  { key: "ACTIVE", label: "Aktif" },
  { key: "PENDING", label: "Pending" },
  { key: "DRAFT", label: "Draf" },
  { key: "SOLD", label: "Terjual" },
];

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

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties/mine");
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties =
    activeFilter === "ALL"
      ? properties
      : properties.filter((p) => p.status === activeFilter);

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    setActionLoading(propertyId);
    try {
      const res = await fetch(`/api/properties/${propertyId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Yakin ingin menghapus properti ini?")) return;
    setActionLoading(propertyId);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } catch (error) {
      console.error("Failed to delete property:", error);
    } finally {
      setActionLoading(null);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Properti Saya</h1>
        <Link href="/dashboard/properti/tambah">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Tambah Properti
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter.key
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {filter.label}
            {filter.key !== "ALL" && (
              <span className="ml-1.5 text-xs opacity-75">
                ({properties.filter((p) => p.status === filter.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Tidak ada properti ditemukan</p>
          <Link href="/dashboard/properti/tambah">
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Properti
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Properti</th>
                  <th className="px-6 py-3 font-medium">Kategori</th>
                  <th className="px-6 py-3 font-medium">Lokasi</th>
                  <th className="px-6 py-3 font-medium">Harga</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {property.images[0] ? (
                            <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {property.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {property.code ? `${property.code} · ` : ""}
                            {property.transactionType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{property.category?.name || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{property.district?.name || "-"}</td>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/properti/${property.id}`}>
                          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Preview">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/properti/edit/${property.id}`}>
                          <button className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                        {property.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleStatusChange(property.id, "DRAFT")}
                            disabled={actionLoading === property.id}
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Nonaktifkan"
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        ) : property.status !== "SOLD" && property.status !== "RENTED" ? (
                          <button
                            onClick={() => handleStatusChange(property.id, "ACTIVE")}
                            disabled={actionLoading === property.id}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Aktifkan"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : null}
                        {property.status === "ACTIVE" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(property.id, "SOLD")}
                              disabled={actionLoading === property.id}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Tandai Terjual"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(property.id, "RENTED")}
                              disabled={actionLoading === property.id}
                              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Tandai Disewa"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={actionLoading === property.id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex gap-3">
                  <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {property.images[0] ? (
                      <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{property.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {property.code ? `${property.code} · ` : ""}
                      {property.category?.name || "-"} &middot; {property.district?.name || "-"}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">{formatPrice(property.price)}</p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        statusColors[property.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[property.status] || property.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Link href={`/properti/${property.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                  </Link>
                  <Link href={`/dashboard/properti/edit/${property.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    onClick={() => handleDelete(property.id)}
                    disabled={actionLoading === property.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
