import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Home,
  Camera,
  Users,
  Shield,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Pasang Properti - UNAYSALE",
  description:
    "Pasang iklan properti Anda di UNAYSALE dan jangkau ribuan pembeli potensial.",
}

export default async function PasangPropertiPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard/properti/tambah")
  }

  const benefits = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Jangkauan Luas",
      description:
        "Ribuan pembeli aktif mencari properti setiap harinya di UNAYSALE.",
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Foto Profesional",
      description:
        "Unggah hingga 10 foto properti dengan galeri yang menarik dan responsif.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Aman & Terpercaya",
      description:
        "Sistem verifikasi agen dan properti untuk keamanan transaksi Anda.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Statistik Lengkap",
      description:
        "Pantau jumlah dilihat, favorit, dan respons dari iklan properti Anda.",
    },
  ]

  const steps = [
    {
      step: 1,
      title: "Daftar Akun",
      description: "Buat akun gratis dalam hitungan detik.",
    },
    {
      step: 2,
      title: "Lengkapi Profil",
      description: "Isi data diri Anda sebagai agen atau pemilik properti.",
    },
    {
      step: 3,
      title: "Pasang Iklan",
      description: "Unggah foto, isi detail properti, dan terbitkan.",
    },
    {
      step: 4,
      title: "Terima Penawaran",
      description: "Dapatkan respons langsung dari pembeli potensial.",
    },
  ]

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="bg-gradient-to-r from-[#0F4C75] to-[#1769AA] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-sm px-4 py-1.5 rounded-full mb-6">
            <Home className="h-4 w-4" />
            <span>UNAYSALE Marketplace Properti</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Pasang Properti Anda di UNAYSALE
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            Jangkau ribuan pembeli dan penyewa aktif. Pasang iklan properti
            Anda sekarang dan dapatkan penawaran terbaik.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-white text-[#0F4C75] hover:bg-blue-50">
                Masuk untuk Pasang Properti
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-3">
            Kenapa Pasang di UNAYSALE?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Platform properti terpercaya yang membantu Anda menjual atau menyewa
            properti dengan cepat dan mudah.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1769AA]/10 flex items-center justify-center mx-auto mb-4 text-[#1769AA]">
                {benefit.icon}
              </div>
              <h3 className="text-base font-semibold text-[#222222] mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-3">
            Cara Memulai
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Hanya 4 langkah mudah untuk memasang properti Anda di UNAYSALE.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#1769AA] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-base font-semibold text-[#222222] mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-4">
            Siap Memulai?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            Daftar sekarang dan pasang properti pertama Anda secara gratis.
            Tidak ada biaya tersembunyi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Gratis selamanya</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Batas 10 foto per iklan</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Aktif 30 hari</span>
            </div>
          </div>
          <Link href="/register">
            <Button size="lg">
              Daftar & Pasang Properti Sekarang
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
