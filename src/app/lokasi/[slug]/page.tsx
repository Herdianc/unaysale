import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ChevronRight,
  MapPin,
  Home,
  LandPlot,
  Building2,
  Store,
  ChevronDown,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { PropertyGrid } from "@/components/property/property-grid"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const province = await prisma.province.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      _count: {
        select: { cities: true },
      },
    },
  })

  if (!province) {
    return { title: "Lokasi Tidak Ditemukan - UNAYSALE" }
  }

  const title = `Properti di ${province.name} - UNAYSALE`
  const description = `Temukan properti terbaik di ${province.name}. Jelajahi ${province._count.cities} kota/kabupaten dengan ribuan properti untuk dijual dan disewa.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "id_ID",
    },
  }
}

const PROPERTY_TYPES = [
  { slug: "rumah", name: "Rumah", icon: Home },
  { slug: "tanah", name: "Tanah", icon: LandPlot },
  { slug: "apartemen", name: "Apartemen", icon: Building2 },
  { slug: "ruko", name: "Ruko", icon: Store },
]

export default async function LocationDetailPage({ params }: PageProps) {
  const { slug } = await params

  const province = await prisma.province.findUnique({
    where: { slug },
    include: {
      cities: {
        include: {
          districts: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  })

  if (!province) {
    notFound()
  }

  const districtIds = province.cities.flatMap((city) =>
    city.districts.map((d) => d.id)
  )

  const [totalPropertyCount, categoryCounts, propertyTypeCounts, properties] =
    await Promise.all([
      prisma.property.count({
        where: {
          districtId: { in: districtIds },
          status: "ACTIVE",
        },
      }),

      prisma.category.findMany({
        where: {
          isActive: true,
          properties: {
            some: {
              districtId: { in: districtIds },
              status: "ACTIVE",
            },
          },
        },
        include: {
          _count: {
            select: {
              properties: {
                where: {
                  districtId: { in: districtIds },
                  status: "ACTIVE",
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),

      Promise.all(
        PROPERTY_TYPES.map(async (type) => {
          const category = await prisma.category.findFirst({
            where: { slug: type.slug },
            select: { id: true },
          })

          const count = category
            ? await prisma.property.count({
                where: {
                  categoryId: category.id,
                  districtId: { in: districtIds },
                  status: "ACTIVE",
                },
              })
            : 0

          return { ...type, count }
        })
      ),

      prisma.property.findMany({
        where: {
          districtId: { in: districtIds },
          status: "ACTIVE",
        },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
          district: { include: { city: { include: { province: true } } } },
          village: true,
          specs: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ])

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
            <li>
              <Link href="/" className="hover:text-[#1769AA] transition-colors">
                Beranda
              </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li>
              <Link
                href="/lokasi"
                className="hover:text-[#1769AA] transition-colors"
              >
                Lokasi
              </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="text-[#222222] font-medium">{province.name}</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#1769AA]/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-[#1769AA]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">
                Properti di {province.name}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {totalPropertyCount.toLocaleString("id-ID")} properti tersedia
              </p>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[#222222] mb-4">
            Tipe Properti
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {propertyTypeCounts.map((type) => {
              const Icon = type.icon
              return (
                <Link
                  key={type.slug}
                  href={`/properti?kategori=${type.slug}&lokasi=${province.slug}`}
                  className="group block bg-white rounded-xl border border-gray-100 p-5 text-center transition-all duration-300 hover:shadow-lg hover:border-[#1769AA]/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1769AA]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#1769AA]/20 transition-colors">
                    <Icon className="h-6 w-6 text-[#1769AA]" />
                  </div>
                  <h3 className="font-semibold text-[#222222] mb-1">
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {type.count} properti
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {categoryCounts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-[#222222] mb-4">
              Berdasarkan Kategori
            </h2>
            <div className="flex flex-wrap gap-3">
              {categoryCounts.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/properti?kategori=${cat.slug}&lokasi=${province.slug}`}
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm transition-all hover:border-[#1769AA] hover:text-[#1769AA]"
                >
                  <span className="font-medium text-[#222222]">{cat.name}</span>
                  <span className="text-xs text-gray-400">
                    {cat._count.properties}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[#222222] mb-4">
            Kota / Kabupaten
          </h2>
          <div className="space-y-3">
            {province.cities.map((city) => (
              <div
                key={city.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#222222]">{city.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {city.districts.length} kecamatan
                      </p>
                    </div>
                  </div>
                  {city.districts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {city.districts.map((district) => (
                        <Link
                          key={district.id}
                          href={`/properti?lokasi=${district.slug}`}
                          className="text-xs bg-[#F7F8FA] hover:bg-[#1769AA]/10 hover:text-[#1769AA] text-gray-600 rounded-full px-3 py-1 transition-colors"
                        >
                          {district.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[#222222]">
              Properti Terbaru di {province.name}
            </h2>
            <Link
              href={`/properti?lokasi=${province.slug}`}
              className="text-sm text-[#1769AA] hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <PropertyGrid
            properties={properties}
            emptyMessage={`Belum ada properti di ${province.name}`}
          />
        </section>
      </div>
    </main>
  )
}
