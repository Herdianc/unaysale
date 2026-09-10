"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SlidersHorizontal } from "lucide-react"

interface SearchBarProps {
  defaultValue?: string
  resultsCount?: number
}

const sortOptions = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
  { value: "popular", label: "Paling Relevan" }
]

export function SearchBar({ defaultValue = "", resultsCount }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(defaultValue || searchParams.get("q") || "")
  const [sort, setSort] = useState(searchParams.get("sortBy") || "newest")
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const updateUrl = (newQuery: string, newSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newQuery) {
      params.set("q", newQuery)
    } else {
      params.delete("q")
    }
    params.set("sortBy", newSort)
    router.push(`/properti?${params.toString()}`)
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      updateUrl(value, sort)
    }, 300)
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    updateUrl(query, newSort)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari properti..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative hidden sm:block">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-10 pl-3 pr-10 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1769AA] focus:border-[#1769AA] bg-white min-w-[160px]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 h-10 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>

        {resultsCount !== undefined && (
          <p className="text-sm text-gray-500 mt-2">
            Menampilkan {resultsCount.toLocaleString("id-ID")} properti
          </p>
        )}
      </div>
    </div>
  )
}
