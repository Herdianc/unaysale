"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Home, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

const priceOptions = [
  100000000, 200000000, 300000000, 500000000, 750000000,
  1000000000, 2000000000, 3000000000, 5000000000, 10000000000
]

const categories = [
  { value: "", label: "Semua" },
  { value: "rumah", label: "Rumah" },
  { value: "apartemen", label: "Apartemen" },
  { value: "tanah", label: "Tanah" },
  { value: "ruko", label: "Ruko" },
  { value: "villa", label: "Villa" },
  { value: "gudang", label: "Gudang" }
]

const transactionTypes = [
  { value: "", label: "Semua" },
  { value: "DIJUAL", label: "Dijual" },
  { value: "DISEWA", label: "Disewa" }
]

export function HeroSearch() {
  const router = useRouter()
  const [transactionType, setTransactionType] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (transactionType) params.set("tipe", transactionType)
    if (location) params.set("lokasi", location)
    if (category) params.set("kategori", category)
    if (minPrice) params.set("hargaMin", minPrice)
    if (maxPrice) params.set("hargaMax", maxPrice)
    router.push(`/properti?${params.toString()}`)
  }

  const handleQuickSearch = (cat: string) => {
    router.push(`/properti?kategori=${cat}`)
  }

  return (
    <section className="relative bg-[#1769AA] min-h-[500px] flex items-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Temukan Properti Impian Anda
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Cari rumah, tanah, apartemen, ruko, dan properti lainnya di seluruh Indonesia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Tipe Transaksi</label>
              <div className="relative">
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full h-11 pl-3 pr-10 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                >
                  {transactionTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="relative lg:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Lokasi</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Masukkan lokasi properti..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623] placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Kategori</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Rentang Harga</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full h-11 pl-2 pr-6 border border-gray-300 rounded-lg text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                  >
                    <option value="">Min</option>
                    {priceOptions.map((p) => (
                      <option key={p} value={p}>{formatPrice(p)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-11 pl-2 pr-6 border border-gray-300 rounded-lg text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                  >
                    <option value="">Max</option>
                    {priceOptions.map((p) => (
                      <option key={p} value={p}>{formatPrice(p)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="bg-[#F5A623] hover:bg-[#E6951A] text-white font-semibold"
            >
              <Search className="h-5 w-5" />
              Cari Properti
            </Button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.filter(c => c.value).map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleQuickSearch(cat.value)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-colors"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
