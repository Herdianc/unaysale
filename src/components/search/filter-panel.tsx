"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface FilterPanelProps {
  initialFilters?: Record<string, any>
  baseUrl?: string
}

const propertyTypes = [
  { value: "rumah", label: "Rumah" },
  { value: "apartemen", label: "Apartemen" },
  { value: "tanah", label: "Tanah" },
  { value: "ruko", label: "Ruko" },
  { value: "villa", label: "Villa" },
  { value: "gudang", label: "Gudang" }
]

const certificateTypes = ["SHM", "HGB", "AJB", "Girik", "PPJB"]

export function FilterPanel({ initialFilters = {}, baseUrl = "/properti" }: FilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    lokasi: true,
    harga: true,
    tipe: true,
    kamarTidur: true,
    kamarMandi: true,
    luasTanah: true,
    luasBangunan: true,
    sertifikat: true
  })

  const [filters, setFilters] = useState({
    lokasi: (initialFilters.lokasi as string) || searchParams.get("lokasi") || "",
    hargaMin: (initialFilters.hargaMin as string) || searchParams.get("hargaMin") || "",
    hargaMax: (initialFilters.hargaMax as string) || searchParams.get("hargaMax") || "",
    tipe: ((initialFilters.tipe as string) || searchParams.get("tipe") || "").split(",").filter(Boolean),
    kamarTidur: (initialFilters.kamarTidur as string) || searchParams.get("kamarTidur") || "",
    kamarMandi: (initialFilters.kamarMandi as string) || searchParams.get("kamarMandi") || "",
    luasTanahMin: (initialFilters.luasTanahMin as string) || searchParams.get("luasTanahMin") || "",
    luasTanahMax: (initialFilters.luasTanahMax as string) || searchParams.get("luasTanahMax") || "",
    luasBangunanMin: (initialFilters.luasBangunanMin as string) || searchParams.get("luasBangunanMin") || "",
    luasBangunanMax: (initialFilters.luasBangunanMax as string) || searchParams.get("luasBangunanMax") || "",
    sertifikat: (initialFilters.sertifikat as string) || searchParams.get("sertifikat") || ""
  })

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }))
  }

  const toggleTipe = (value: string) => {
    setFilters(prev => ({
      ...prev,
      tipe: prev.tipe.includes(value)
        ? prev.tipe.filter(t => t !== value)
        : [...prev.tipe, value]
    }))
  }

  const buildParams = () => {
    const params = new URLSearchParams()
    if (filters.lokasi) params.set("lokasi", filters.lokasi)
    if (filters.hargaMin) params.set("hargaMin", filters.hargaMin)
    if (filters.hargaMax) params.set("hargaMax", filters.hargaMax)
    if (filters.tipe.length > 0) params.set("tipe", filters.tipe.join(","))
    if (filters.kamarTidur) params.set("kamarTidur", filters.kamarTidur)
    if (filters.kamarMandi) params.set("kamarMandi", filters.kamarMandi)
    if (filters.luasTanahMin) params.set("luasTanahMin", filters.luasTanahMin)
    if (filters.luasTanahMax) params.set("luasTanahMax", filters.luasTanahMax)
    if (filters.luasBangunanMin) params.set("luasBangunanMin", filters.luasBangunanMin)
    if (filters.luasBangunanMax) params.set("luasBangunanMax", filters.luasBangunanMax)
    if (filters.sertifikat) params.set("sertifikat", filters.sertifikat)
    return params
  }

  const applyFilter = () => {
    const params = buildParams()
    router.push(`${baseUrl}?${params.toString()}`)
    setMobileOpen(false)
  }

  const resetFilter = () => {
    setFilters({
      lokasi: "",
      hargaMin: "",
      hargaMax: "",
      tipe: [],
      kamarTidur: "",
      kamarMandi: "",
      luasTanahMin: "",
      luasTanahMax: "",
      luasBangunanMin: "",
      luasBangunanMax: "",
      sertifikat: ""
    })
    router.push(baseUrl)
    setMobileOpen(false)
  }

  const bedroomOptions = ["1", "2", "3", "4", "5+"]
  const bathroomOptions = ["1", "2", "3", "4+"]

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Lokasi */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleGroup("lokasi")}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700"
        >
          Lokasi
          {expandedGroups.lokasi ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedGroups.lokasi && (
          <div className="px-3 pb-3">
            <Input
              placeholder="Cari lokasi..."
              value={filters.lokasi}
              onChange={(e) => setFilters(prev => ({ ...prev, lokasi: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Harga */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleGroup("harga")}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700"
        >
          Harga
          {expandedGroups.harga ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedGroups.harga && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Harga minimum"
              value={filters.hargaMin}
              onChange={(e) => setFilters(prev => ({ ...prev, hargaMin: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Harga maksimum"
              value={filters.hargaMax}
              onChange={(e) => setFilters(prev => ({ ...prev, hargaMax: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Tipe Properti */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleGroup("tipe")}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700"
        >
          Tipe Properti
          {expandedGroups.tipe ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedGroups.tipe && (
          <div className="px-3 pb-3 space-y-2">
            {propertyTypes.map((type) => (
              <label key={type.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.tipe.includes(type.value)}
                  onChange={() => toggleTipe(type.value)}
                  className="h-4 w-4 rounded border-gray-300 text-[#1769AA] focus:ring-[#1769AA]"
                />
                {type.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Kamar Tidur */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleGroup("kamarTidur")}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700"
        >
          Kamar Tidur
          {expandedGroups.kamarTidur ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedGroups.kamarTidur && (
          <div className="px-3 pb-3 flex flex-wrap gap-2">
            {bedroomOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  kamarTidur: prev.kamarTidur === opt ? "" : opt
                }))}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filters.kamarTidur === opt
                    ? "bg-[#1769AA] text-white border-[#1769AA]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#1769AA]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Kamar Mandi */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleGroup("kamarMandi")}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700"
        >
          Kamar Mandi
          {expandedGroups.kamarMandi ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedGroups.kamarMandi && (
          <div className="px-3 pb-3 flex flex-wrap gap-2">
            {bathroomOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  kamarMandi: prev.kamarMandi === opt ? "" : opt
                }))}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filters.kamarMandi === opt
                    ? "bg-[#1769AA] text-white border-[#1769AA]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#1769AA]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Luas Tanah */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleGroup("luasTanah")}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700"
        >
          Luas Tanah (m²)
          {expandedGroups.luasTanah ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedGroups.luasTanah && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Minimum"
              value={filters.luasTanahMin}
              onChange={(e) => setFilters(prev => ({ ...prev, luasTanahMin: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Maksimum"
              value={filters.luasTanahMax}
              onChange={(e) => setFilters(prev => ({ ...prev, luasTanahMax: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Luas Bangunan */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleGroup("luasBangunan")}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700"
        >
          Luas Bangunan (m²)
          {expandedGroups.luasBangunan ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedGroups.luasBangunan && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Minimum"
              value={filters.luasBangunanMin}
              onChange={(e) => setFilters(prev => ({ ...prev, luasBangunanMin: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Maksimum"
              value={filters.luasBangunanMax}
              onChange={(e) => setFilters(prev => ({ ...prev, luasBangunanMax: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Sertifikat */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleGroup("sertifikat")}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700"
        >
          Sertifikat
          {expandedGroups.sertifikat ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedGroups.sertifikat && (
          <div className="px-3 pb-3 flex flex-wrap gap-2">
            {certificateTypes.map((cert) => (
              <button
                key={cert}
                type="button"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  sertifikat: prev.sertifikat === cert ? "" : cert
                }))}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filters.sertifikat === cert
                    ? "bg-[#1769AA] text-white border-[#1769AA]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#1769AA]"
                }`}
              >
                {cert}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button onClick={applyFilter} className="flex-1">
          Terapkan Filter
        </Button>
        <Button onClick={resetFilter} variant="outline" className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile trigger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#1769AA] text-white p-4 rounded-full shadow-lg hover:bg-[#0F4C75] transition-colors"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>

      {/* Mobile slide-out panel */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filter</h2>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>
    </>
  )
}
