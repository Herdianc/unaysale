"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  Check,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MoreVertical,
  ShieldCheck,
  ShieldOff,
  Star,
  Building2,
  Pencil,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  bio?: string;
  license?: string;
  whatsapp?: string;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  propertiesCount?: number;
  leadsCount?: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    license: "",
    whatsapp: "",
    bio: "",
    isVerified: false,
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingAgent(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      companyName: "",
      license: "",
      whatsapp: "",
      bio: "",
      isVerified: false,
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setForm({
      name: agent.name || "",
      email: agent.email || "",
      phone: agent.phone || "",
      password: "",
      companyName: agent.company || "",
      license: agent.license || "",
      whatsapp: agent.whatsapp || "",
      bio: agent.bio || "",
      isVerified: agent.isVerified,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async () => {
    setFormError("");
    if (form.name.trim().length < 2) {
      setFormError("Nama minimal 2 karakter");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError("Email tidak valid");
      return;
    }
    if (form.password && form.password.length > 0 && form.password.length < 8) {
      setFormError("Password minimal 8 karakter");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        companyName: form.companyName,
        license: form.license,
        whatsapp: form.whatsapp,
        bio: form.bio,
        isVerified: form.isVerified,
      };
      if (form.password && form.password.trim().length > 0) payload.password = form.password;

      const res = await fetch(
        editingAgent ? `/api/admin/agents/${editingAgent.id}` : "/api/admin/agents",
        {
          method: editingAgent ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setModalOpen(false);
        fetchAgents();
      } else {
        const data = await res.json().catch(() => null);
        setFormError(data?.error || "Gagal menyimpan agen");
      }
    } catch (error) {
      console.error("Failed to save agent:", error);
      setFormError("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        verified: verificationFilter !== "ALL" ? verificationFilter : "",
      });

      const res = await fetch(`/api/admin/agents?${params}`);
      if (res.ok) {
        const data = await res.json();
        const mapped: Agent[] = ((data.agents || []) as any[]).map((a) => ({
          id: a.id,
          name: a.user?.name ?? "-",
          email: a.user?.email ?? "",
          phone: a.user?.phone ?? "",
          company: a.companyName ?? "",
          bio: a.bio ?? "",
          license: a.license ?? "",
          whatsapp: a.whatsapp ?? "",
          isVerified: Boolean(a.isVerified),
          rating: a.rating ?? 0,
          totalSales: a.totalSales ?? 0,
          propertiesCount: a._count?.properties ?? 0,
          leadsCount: a._count?.leads ?? 0,
          createdAt: a.createdAt,
        }));
        setAgents(mapped);
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, verificationFilter]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleToggleVerification = async (agentId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unverify" : "verify";
    if (!confirm(`Apakah Anda yakin ingin ${action === "verify" ? "memverifikasi" : "membatalkan verifikasi"} agen ini?`)) return;

    setProcessingAction(agentId);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchAgents();
      }
    } catch (error) {
      console.error("Failed to toggle verification:", error);
    } finally {
      setProcessingAction(null);
      setActionMenuOpen(null);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus agen ini?")) return;

    setProcessingAction(agentId);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchAgents();
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
    } finally {
      setProcessingAction(null);
      setActionMenuOpen(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Agen</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola semua agen properti
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Tambah Agen
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari agen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="ALL">Semua Verifikasi</option>
                <option value="true">Terverifikasi</option>
                <option value="false">Belum Diverifikasi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">
                  Nama
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                  Perusahaan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Verifikasi
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rating
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Listing
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px] w-[100px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    Tidak ada agen ditemukan
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {agent.name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {agent.company || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {agent.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ShieldCheck className="h-3 w-3" />
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <ShieldOff className="h-3 w-3" />
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {agent.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({agent.totalSales || 0} terjual)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {agent.propertiesCount || 0} properti
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setActionMenuOpen(
                              actionMenuOpen === agent.id ? null : agent.id
                            )
                          }
                          className="p-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200"
                          title="Aksi"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        {actionMenuOpen === agent.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActionMenuOpen(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                              <Link
                                href={`/agen/${agent.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4" />
                                Lihat Profil
                              </Link>
                              <button
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  openEditModal(agent);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleVerification(
                                    agent.id,
                                    agent.isVerified
                                  )
                                }
                                disabled={processingAction === agent.id}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              >
                                {agent.isVerified ? (
                                  <>
                                    <ShieldOff className="h-4 w-4" />
                                    Batalkan Verifikasi
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-4 w-4" />
                                    Verifikasi
                                  </>
                                )}
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => handleDelete(agent.id)}
                                disabled={processingAction === agent.id}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
              {pagination.total} agen
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const startPage = Math.max(1, pagination.page - 2);
                  const pageNum = startPage + i;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        pagination.page === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingAgent ? "Edit Agen" : "Tambah Agen Baru"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {formError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Nama agen"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="agen@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingAgent ? "Password Baru (reset)" : "Password"}
                </label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder={
                    editingAgent
                      ? "Kosongkan jika tidak ganti, isi untuk reset"
                      : "Kosongkan untuk default: Password123"
                  }
                />
                {editingAgent && (
                  <p className="text-xs text-gray-500 mt-1">
                    Isi untuk reset password agen yang lupa
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) =>
                      setForm({ ...form, companyName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="CV / PT properti"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Lisensi
                  </label>
                  <input
                    type="text"
                    value={form.license}
                    onChange={(e) =>
                      setForm({ ...form, license: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="No. lisensi (opsional)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="08xxxxxxxxxx (untuk tombol chat WA)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Deskripsi singkat agen"
                />
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) =>
                    setForm({ ...form, isVerified: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Langsung terverifikasi</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editingAgent ? "Simpan Perubahan" : "Tambah Agen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
