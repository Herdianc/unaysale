export interface PropertyWithRelations {
  id: string
  title: string
  slug: string
  description: string
  transactionType: string
  status: string
  price: number
  priceNegotiable: boolean
  isFeatured: boolean
  views: number
  address: string | null
  latitude: number | null
  longitude: number | null
  metaTitle: string | null
  metaDescription: string | null
  keywords: string | null
  categoryId: string
  userId: string
  agentId: string | null
  districtId: string | null
  villageId: string | null
  createdAt: Date
  updatedAt: Date
  images: { id: string; url: string; alt: string | null; isPrimary: boolean; sortOrder: number }[]
  specs: { id: string; landArea: number | null; buildingArea: number | null; bedrooms: number | null; bathrooms: number | null; floors: number | null; carport: number | null; garage: number | null } | null
  legalities: { id: string; certificate: string | null; pbb: boolean; imb: boolean } | null
  facilities: { facility: { id: string; name: string; slug: string; icon: string | null } }[]
  category: { id: string; name: string; slug: string; icon: string | null }
  district: any
  village: any
  user: any
  agent: any
}

export interface PropertyCardType {
  id: string
  title: string
  slug: string
  price: number
  transactionType: string
  status: string
  isFeatured: boolean
  address: string | null
  createdAt: Date
  images: { url: string; alt: string | null; isPrimary: boolean }[]
  category: { id: string; name: string; slug: string }
  district: any
  village: any
  specs: { landArea: number | null; buildingArea: number | null; bedrooms: number | null; bathrooms: number | null } | null
}

export type AgentWithUser = {
  id: string
  userId: string
  companyName: string | null
  bio: string | null
  license: string | null
  isVerified: boolean
  rating: number
  totalSales: number
  user: { id: string; name: string | null; email: string | null; phone: string | null; image: string | null }
  _count: { properties: number }
}

export type UserWithAgent = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  image: string | null
  role: string
  agent?: { id: string; companyName: string | null } | null
}

export interface PropertySearchParams {
  query?: string
  transactionType?: "DIJUAL" | "DISEWA"
  categorySlug?: string
  districtId?: string
  villageId?: string
  provinceId?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minLandArea?: number
  maxLandArea?: number
  minBuildingArea?: number
  maxBuildingArea?: number
  certificate?: string
  facilityIds?: string[]
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular"
  page?: number
  limit?: number
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
}

export interface SiteConfig {
  name: string
  tagline: string
  phone: string
  email: string
  whatsapp: string
}

export const siteConfig: SiteConfig = {
  name: "UNAYSALE",
  tagline: "Temukan Properti Impian Anda",
  phone: "+6281234567890",
  email: "info@unaysale.id",
  whatsapp: "6281234567890",
}
