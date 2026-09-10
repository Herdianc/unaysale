"use client"

import { useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"

interface PropertyListingClientProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  currentParams: Record<string, string | string[] | undefined>
}

export function PropertyListingClient({
  currentPage,
  totalPages,
  baseUrl,
  currentParams,
}: PropertyListingClientProps) {
  const router = useRouter()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(currentParams).forEach(([key, value]) => {
      if (key === "page") return
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v))
      } else if (value) {
        params.set(key, value)
      }
    })
    params.set("page", page.toString())
    router.push(`${baseUrl}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}
