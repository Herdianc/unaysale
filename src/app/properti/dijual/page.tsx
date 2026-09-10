import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PropertyGrid } from "@/components/property/property-grid"
import { SearchBar } from "@/components/search/search-bar"
import { FilterPanel } from "@/components/search/filter-panel"
import { PropertyListingClient } from "../client-wrapper"

export const metadata: Metadata = {
  title: "Properti Dijual - UNAYSALE",
  description:
    "Temukan properti terbaik untuk dijual di seluruh Indonesia. Rumah, apartemen, tanah, ruko, villa, dan gudang.",
}

const ITEMS_PER_PAGE = 20

const propertyInclude = {
  images: { where: { isPrimary: true }, take: 1 },
  category: true,
  district: { include: { city: { include: { province: true } } } },
  village: true,
  specs: true,
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DijualPage({ searchParams }: PageProps) {
  const params = await searchParams

  const getParam = (key: string): string => {
    const val = params[key]
    return Array.isArray(val) ? val[0] : val || ""
  }

  const q = getParam("q")
  const tipe = getParam("tipe")
  const kategori = getParam("kategori")
  const lokasi = getParam("lokasi")
  const hargaMin = getParam("hargaMin")
  const hargaMax = getParam("hargaMax")
  const kamarTidur = getParam("kamarTidur")
  const kamarMandi = getParam("kamarMandi")
  const luasTanahMin = getParam("luasTanahMin")
  const luasTanahMax = getParam("luasTanahMax")
  const luasBangunanMin = getParam("luasBangunanMin")
  const luasBangunanMax = getParam("luasBangunanMax")
  const sertifikat = getParam("sertifikat")
  const sortBy = getParam("sortBy") || "newest"
  const page = Math.max(1, parseInt(getParam("page") || "1", 10))

  const where: any = {
    status: "ACTIVE",
    transactionType: "DIJUAL",
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ]
  }

  if (kategori) {
    const category = await prisma.category.findFirst({
      where: { slug: kategori },
      select: { id: true },
    })
    if (category) {
      where.categoryId = category.id
    }
  }

  if (lokasi) {
    const district = await prisma.district.findFirst({
      where: { slug: lokasi },
      select: { id: true },
    })
    if (district) {
      where.districtId = district.id
    }
  }

  if (hargaMin || hargaMax) {
    where.price = {}
    if (hargaMin) where.price.gte = parseFloat(hargaMin)
    if (hargaMax) where.price.lte = parseFloat(hargaMax)
  }

  if (kamarTidur) {
    const bedrooms = parseInt(kamarTidur, 10)
    if (!isNaN(bedrooms)) {
      where.specs = {
        ...where.specs,
        bedrooms: kamarTidur === "5" ? { gte: 5 } : bedrooms,
      }
    }
  }

  if (kamarMandi) {
    const bathrooms = parseInt(kamarMandi, 10)
    if (!isNaN(bathrooms)) {
      where.specs = {
        ...where.specs,
        bathrooms: kamarMandi === "4" ? { gte: 4 } : bathrooms,
      }
    }
  }

  if (luasTanahMin || luasTanahMax) {
    where.specs = { ...where.specs }
    where.specs.landArea = {}
    if (luasTanahMin) where.specs.landArea.gte = parseFloat(luasTanahMin)
    if (luasTanahMax) where.specs.landArea.lte = parseFloat(luasTanahMax)
  }

  if (luasBangunanMin || luasBangunanMax) {
    where.specs = { ...where.specs }
    where.specs.buildingArea = {}
    if (luasBangunanMin)
      where.specs.buildingArea.gte = parseFloat(luasBangunanMin)
    if (luasBangunanMax)
      where.specs.buildingArea.lte = parseFloat(luasBangunanMax)
  }

  if (sertifikat) {
    where.legalities = { certificate: sertifikat }
  }

  let orderBy: any = { createdAt: "desc" }
  switch (sortBy) {
    case "price_asc":
      orderBy = { price: "asc" }
      break
    case "price_desc":
      orderBy = { price: "desc" }
      break
    case "popular":
      orderBy = { views: "desc" }
      break
    default:
      orderBy = { createdAt: "desc" }
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: propertyInclude,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.property.count({ where }),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <SearchBar defaultValue={q} resultsCount={total} />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20">
              <FilterPanel baseUrl="/properti/dijual" />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#222222]">
                  Properti Dijual
                </h1>
                <p className="text-sm text-gray-500">
                  Menampilkan {total.toLocaleString("id-ID")} properti
                </p>
              </div>
            </div>

            <PropertyGrid
              properties={properties}
              emptyMessage="Tidak ada properti dijual yang sesuai dengan pencarian Anda."
            />

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <PropertyListingClient
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl="/properti/dijual"
                  currentParams={params}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
