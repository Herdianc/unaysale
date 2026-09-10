"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Settings,
  Bell,
  Mail,
  Phone,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Shield,
  MessageSquare,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface NotificationSettings {
  emailLeads: boolean
  emailPropertyUpdates: boolean
  emailMarketing: boolean
  pushLeads: boolean
  pushPropertyUpdates: boolean
  whatsappLeads: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailLeads: true,
    emailPropertyUpdates: true,
    emailMarketing: false,
    pushLeads: true,
    pushPropertyUpdates: true,
    whatsappLeads: false,
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/dashboard/settings")
        if (res.ok) {
          const data = await res.json()
          if (data.notifications) {
            setNotifications(data.notifications)
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      })

      if (res.ok) {
        toast.success("Pengaturan notifikasi berhasil disimpan")
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menyimpan pengaturan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "HAPUS") {
      toast.error("Ketik HAPUS untuk mengonfirmasi")
      return
    }

    setDeleting(true)
    try {
      const res = await fetch("/api/dashboard/settings/delete", {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Akun berhasil dihapus")
        signOut({ callbackUrl: "/" })
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menghapus akun")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1769AA]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 mt-1">
          Kelola pengaturan akun dan preferensi Anda
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Akun
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                Tidak dapat diubah
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Peran</p>
                <p className="text-sm text-gray-500">
                  {(session?.user as any)?.role === "AGENT"
                    ? "Agen Properti"
                    : (session?.user as any)?.role === "ADMIN"
                    ? "Administrator"
                    : "Pengguna"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ubah Profil
                </p>
                <p className="text-sm text-gray-500">
                  Edit nama, nomor telepon, dan informasi lainnya
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/profil")}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Preferensi Notifikasi
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              Notifikasi Email
            </h3>
            <div className="space-y-3 pl-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-gray-700">Lead baru masuk</p>
                  <p className="text-xs text-gray-400">
                    Dapatkan email saat ada lead baru di properti Anda
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailLeads}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailLeads: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#1769AA] focus:ring-[#1769AA]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-gray-700">
                    Update status properti
                  </p>
                  <p className="text-xs text-gray-400">
                    Notifikasi saat properti disetujui atau ditolak
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailPropertyUpdates}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailPropertyUpdates: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#1769AA] focus:ring-[#1769AA]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-gray-700">Email promosi</p>
                  <p className="text-xs text-gray-400">
                    Info dan promosi dari UNAYSALE
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailMarketing}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailMarketing: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#1769AA] focus:ring-[#1769AA]"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              Notifikasi Push
            </h3>
            <div className="space-y-3 pl-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-gray-700">Lead baru masuk</p>
                  <p className="text-xs text-gray-400">
                    Push notifikasi saat ada lead baru
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.pushLeads}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      pushLeads: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#1769AA] focus:ring-[#1769AA]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-gray-700">
                    Update status properti
                  </p>
                  <p className="text-xs text-gray-400">
                    Push notifikasi perubahan status properti
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.pushPropertyUpdates}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      pushPropertyUpdates: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#1769AA] focus:ring-[#1769AA]"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              WhatsApp
            </h3>
            <div className="space-y-3 pl-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-gray-700">Lead via WhatsApp</p>
                  <p className="text-xs text-gray-400">
                    Notifikasi lead melalui WhatsApp
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.whatsappLeads}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      whatsappLeads: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#1769AA] focus:ring-[#1769AA]"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveNotifications}
              loading={savingNotifications}
              disabled={savingNotifications}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Simpan Preferensi
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-red-200">
        <div className="px-6 py-4 border-b border-red-100">
          <h2 className="text-base font-semibold text-red-700 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Hapus Akun
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Peringatan: Tindakan ini tidak dapat dibatalkan
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Menghapus akun akan menghapus semua data Anda termasuk properti,
                  leads, dan favorit. Data yang sudah dihapus tidak dapat
                  dikembalikan.
                </p>
              </div>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Hapus Akun Saya
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-red-700">
                  Ketik <span className="font-bold">HAPUS</span> untuk
                  mengonfirmasi
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="HAPUS"
                  className="flex w-full max-w-xs rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-[#222222] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  loading={deleting}
                  disabled={
                    deleting || deleteConfirmation !== "HAPUS"
                  }
                >
                  Ya, Hapus Akun Saya
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmation("")
                  }}
                  disabled={deleting}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
