import Link from "next/link"
import {
  Home,
  Building2,
  Trees,
  Store,
  Warehouse,
  Mountain,
  Shield,
  Globe,
  Headphones,
  MapPin,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { HeroSearch } from "@/components/search/hero-search"
import { PropertyGrid } from "@/components/property/property-grid"
import { formatPrice } from "@/lib/utils"

const categoryIcons: Record<string, React.ReactNode> = {
  Rumah: <Home className="h-8 w-8" />,
  Apartemen: <Building2 className="h-8 w-8" />,
  Tanah: <Trees className="h-8 w-8" />,
  Ruko: <Store className="h-8 w-8" />,
  Villa: <Mountain className="h-8 w-8" />,
  Gudang: <Warehouse className="h-8 w-8" />,
}

const popularCities = [
  { name: "Bekasi", slug: "bekasi" },
  { name: "Jakarta", slug: "jakarta" },
  { name: "Bogor", slug: "bogor" },
  { name: "Depok", slug: "depok" },
  { name: "Tangerang", slug: "tangerang" },
  { name: "Bandung", slug: "bandung" },
]

const propertyInclude = {
  images: { where: { isPrimary: true }, take: 1 },
  category: true,
  district: { include: { city: { include: { province: true } } } },
  village: true,
  specs: true,
}

export default async function HomePage() {
  const [latestProperties, featuredProperties, categories, cityPropertyCounts] =
    await Promise.all([
      prisma.property.findMany({
        where: { status: "ACTIVE" },
        include: propertyInclude,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.property.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        include: propertyInclude,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              properties: {
                where: { status: "ACTIVE" },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      Promise.all(
        popularCities.map(async (city) => {
          const cityRecord = await prisma.city.findFirst({
            where: { slug: city.slug },
            select: { id: true },
          })
          if (!cityRecord) return { ...city, count: 0 }
          const count = await prisma.property.count({
            where: { district: { cityId: cityRecord.id }, status: "ACTIVE" },
          })
          return { ...city, count }
        })
      ),
    ])

  // Hanya tampilkan yang ada isinya (>0), walaupun cuma 1 tetap tampil
  const visibleCategories = categories.filter((c) => c._count.properties > 0)
  const visibleCities = cityPropertyCounts.filter((c) => c.count > 0)

  return (
    <main className="flex flex-col">
      <HeroSearch />

      {latestProperties.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#222222]">
                Properti Terbaru
              </h2>
              <Link
                href="/properti?sort=newest"
                className="text-sm font-medium text-[#1769AA] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <PropertyGrid properties={latestProperties} />
          </div>
        </section>
      )}

      {featuredProperties.length > 0 && (
        <section className="py-12 bg-[#F7F8FA]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#222222]">
                Properti Pilihan
              </h2>
              <Link
                href="/properti?sort=popular"
                className="text-sm font-medium text-[#1769AA] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <PropertyGrid properties={featuredProperties} />
          </div>
        </section>
      )}

      {visibleCategories.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#222222] mb-6">
              Jelajahi Berdasarkan Kategori
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {visibleCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/properti?kategori=${cat.slug}`}
                  className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-[#F7F8FA] p-6 text-center transition-all hover:shadow-md hover:border-[#1769AA]/30 hover:bg-white"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1769AA]/10 text-[#1769AA]">
                    {categoryIcons[cat.name] || (
                      <Home className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cat._count.properties} properti
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {visibleCities.length > 0 && (
        <section className="py-12 bg-[#F7F8FA]">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#222222] mb-6">
              Jelajahi Berdasarkan Lokasi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {visibleCities.map((city) => (
              <Link
                key={city.slug}
                href={`/properti?lokasi=${city.slug}`}
                className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white p-6 text-center transition-all hover:shadow-md hover:border-[#1769AA]/30"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5A623]/10 text-[#F5A623]">
                  <MapPin className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#222222]">
                    {city.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {city.count} properti
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#222222] text-center mb-8">
            Mengapa UNAYSALE?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-100 bg-[#F7F8FA] p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1769AA]/10 text-[#1769AA]">
                <Home className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[#222222]">
                Mudah Digunakan
              </h3>
              <p className="text-sm text-gray-500">
                Cari dan temukan properti impian Anda dengan mudah melalui
                platform kami yang intuitif.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-100 bg-[#F7F8FA] p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[#222222]">
                Aman &amp; Terpercaya
              </h3>
              <p className="text-sm text-gray-500">
                Setiap properti terverifikasi dan data yang ditampilkan akurat
                untuk keamanan transaksi Anda.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-100 bg-[#F7F8FA] p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5A623]/10 text-[#F5A623]">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[#222222]">
                Jangkauan Luas
              </h3>
              <p className="text-sm text-gray-500">
                Tersedia properti di berbagai kota dan wilayah di seluruh
                Indonesia.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-100 bg-[#F7F8FA] p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Headphones className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[#222222]">
                Dukungan Agen
              </h3>
              <p className="text-sm text-gray-500">
                Terhubung langsung dengan agen properti profesional dan
                berpengalaman.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
