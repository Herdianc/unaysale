"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  User,
  Phone,
  Mail,
  Lock,
  Save,
  Loader2,
  Building,
  FileText,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"

interface AgentProfile {
  id: string
  companyName: string
  bio: string
  license: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  agent: AgentProfile | null
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingAgent, setSavingAgent] = useState(false)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [companyName, setCompanyName] = useState("")
  const [bio, setBio] = useState("")
  const [license, setLicense] = useState("")

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/dashboard/profile")
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
          setName(data.name || "")
          setPhone(data.phone || "")
          if (data.agent) {
            setCompanyName(data.agent.companyName || "")
            setBio(data.agent.bio || "")
            setLicense(data.agent.license || "")
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })

      if (res.ok) {
        toast.success("Profil berhasil diperbarui")
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal memperbarui profil")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field password wajib diisi")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password baru tidak cocok")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter")
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch("/api/dashboard/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (res.ok) {
        toast.success("Password berhasil diubah")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal mengubah password")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleSaveAgent = async () => {
    setSavingAgent(true)
    try {
      const res = await fetch("/api/dashboard/profile/agent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, bio, license }),
      })

      if (res.ok) {
        toast.success("Profil agen berhasil diperbarui")
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal memperbarui profil agen")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setSavingAgent(false)
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
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-500 mt-1">Kelola informasi profil Anda</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-4 w-4" />
            Informasi Dasar
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#222222]">
                Email
              </label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {profile?.email}
              </div>
            </div>

            <Input
              label="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="h-4 w-4" />}
            />

            <Input
              label="Nomor Telepon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="h-4 w-4" />}
              placeholder="08xxxxxxxxxx"
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#222222]">
                Peran
              </label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
                <BadgeCheck className="h-4 w-4 text-gray-400" />
                {profile?.role === "AGENT"
                  ? "Agen"
                  : profile?.role === "ADMIN"
                  ? "Admin"
                  : "Pengguna"}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveProfile}
              loading={savingProfile}
              disabled={savingProfile}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Simpan Profil
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Ubah Password
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <Input
            label="Password Saat Ini"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password Baru"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              placeholder="Minimal 8 karakter"
            />

            <Input
              label="Konfirmasi Password Baru"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleChangePassword}
              loading={savingPassword}
              disabled={savingPassword}
              variant="secondary"
            >
              <Lock className="h-4 w-4 mr-1.5" />
              Ubah Password
            </Button>
          </div>
        </div>
      </div>

      {profile?.role === "AGENT" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Profil Agen
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <Input
              label="Nama Perusahaan"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              icon={<Building className="h-4 w-4" />}
              placeholder="Nama perusahaan atau agensi"
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#222222]">
                Bio / Tentang Saya
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Ceritakan tentang pengalaman Anda sebagai agen properti..."
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#222222] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Input
              label="Nomor Lisensi"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              icon={<FileText className="h-4 w-4" />}
              placeholder="Nomor lisensi agen properti"
            />

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveAgent}
                loading={savingAgent}
                disabled={savingAgent}
              >
                <Save className="h-4 w-4 mr-1.5" />
                Simpan Profil Agen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
