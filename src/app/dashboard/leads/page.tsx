"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  PhoneCall,
  CheckCircle2,
  Eye,
  Calendar,
  RefreshCw,
  MessageCircle,
} from "lucide-react"
import { formatPrice, formatDate, getWhatsAppUrl } from "@/lib/utils"

interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  status: string
  createdAt: string
  property?: {
    id: string
    title: string
    price: number
    slug: string
    code?: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: any; label: string }
> = {
  NEW: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: MessageSquare,
    label: "Baru",
  },
  CONTACTED: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: PhoneCall,
    label: "Dihubungi",
  },
  FOLLOW_UP: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    icon: Clock,
    label: "Follow Up",
  },
  CLOSED: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: CheckCircle2,
    label: "Selesai",
  },
}

function leadWaUrl(lead: Lead): string {
  const code = lead.property?.code ? `[${lead.property.code}] ` : ""
  const msg = `Halo ${lead.name}, saya dari UNAYSALE menindaklanjuti pesan Anda tentang properti ${code}"${lead.property?.title ?? ""}". Apakah masih tersedia?`
  return getWhatsAppUrl(lead.phone, msg)
}

export default function LeadsPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        status: statusFilter !== "ALL" ? statusFilter : "",
      })

      const res = await fetch(`/api/dashboard/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
          }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setProcessingAction(leadId)
    try {
      const res = await fetch(`/api/dashboard/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchLeads()
        if (selectedLead?.id === leadId) {
          setSelectedLead(null)
        }
      }
    } catch (error) {
      console.error("Failed to update lead status:", error)
    } finally {
      setProcessingAction(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    return (
      statusConfig[status] || {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: MessageSquare,
        label: status,
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola leads dan inquiry properti Anda
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon
          return (
            <button
              key={status}
              onClick={() =>
                setStatusFilter(statusFilter === status ? "ALL" : status)
              }
              className={`p-4 rounded-xl border transition-all ${
                statusFilter === status
                  ? `${config.bg} border-current ring-2 ring-offset-1`
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${config.text}`} />
                <span className={`text-sm font-medium ${config.text}`}>
                  {config.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari leads..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="NEW">Baru</option>
                <option value="CONTACTED">Dihubungi</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="CLOSED">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Telepon
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Properti
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                  Pesan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Tanggal
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1769AA] mx-auto" />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Tidak ada leads ditemukan</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const statusBadge = getStatusBadge(lead.status)
                  const StatusIcon = statusBadge.icon
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex items-center gap-1 text-sm text-[#1769AA] hover:text-[#0F4C75]"
                        >
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 text-sm text-[#1769AA] hover:text-[#0F4C75]"
                          >
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">
                              {lead.email}
                            </span>
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.property ? (
                          <div>
                            <p className="text-sm text-gray-900 line-clamp-1 max-w-[180px]">
                              {lead.property.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {lead.property.code ? `${lead.property.code} · ` : ""}
                              {formatPrice(lead.property.price)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-[200px]">
                          {lead.message || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(lead.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={leadWaUrl(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors"
                            title="Chat WhatsApp Customer"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1769AA] transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {lead.status !== "CONTACTED" && (
                            <button
                              onClick={() =>
                                handleStatusChange(lead.id, "CONTACTED")
                              }
                              disabled={processingAction === lead.id}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 disabled:opacity-50 transition-colors"
                              title="Tandai Dihubungi"
                            >
                              <PhoneCall className="h-4 w-4" />
                            </button>
                          )}
                          {lead.status !== "FOLLOW_UP" &&
                            lead.status !== "CLOSED" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(lead.id, "FOLLOW_UP")
                                }
                                disabled={processingAction === lead.id}
                                className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-600 disabled:opacity-50 transition-colors"
                                title="Follow Up"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                            )}
                          {lead.status !== "CLOSED" && (
                            <button
                              onClick={() =>
                                handleStatusChange(lead.id, "CLOSED")
                              }
                              disabled={processingAction === lead.id}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 disabled:opacity-50 transition-colors"
                              title="Selesai"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              dari {pagination.total} leads
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
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const startPage = Math.max(1, pagination.page - 2)
                  const pageNum = startPage + i
                  if (pageNum > pagination.totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? "bg-[#1769AA] text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
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
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Lead
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nama</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedLead.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Telepon</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLead.phone}
                    </p>
                    <a
                      href={leadWaUrl(selectedLead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Chat WA
                    </a>
                  </div>
                </div>
                {selectedLead.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLead.email}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedLead.createdAt).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>

              {selectedLead.property && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Properti</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedLead.property.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatPrice(selectedLead.property.price)}
                  </p>
                </div>
              )}

              {selectedLead.message && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pesan</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-2">Ubah Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          handleStatusChange(selectedLead.id, status)
                        }}
                        disabled={
                          selectedLead.status === status ||
                          processingAction === selectedLead.id
                        }
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedLead.status === status
                            ? `${config.bg} ${config.text} cursor-default`
                            : `${config.bg} ${config.text} hover:opacity-80`
                        } disabled:opacity-50`}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
