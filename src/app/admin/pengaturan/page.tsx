"use client"
import Link from "next/link"
import { Settings2 } from "lucide-react"

export default function AdminPengaturanPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Admin</h1>
        <p className="text-gray-500 mt-1">Kelola pengaturan aplikasi</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <Settings2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">Pengaturan</h3>
        <p className="text-sm text-gray-500 mt-2">Halaman pengaturan admin sedang dalam pengembangan.</p>
        <p className="text-sm text-gray-500">Gunakan menu Kategori, Lokasi, Fasilitas untuk konfigurasi.</p>
        <Link href="/admin" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
