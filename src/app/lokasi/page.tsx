import { Metadata } from "next"
import Link from "next/link"
import { MapPin, ChevronRight, Building } from "lucide-react"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Properti Berdasarkan Lokasi - UNAYSALE",
  description:
    "Jelajahi properti berdasarkan lokasi di seluruh Indonesia. Temukan rumah, apartemen, tanah, dan properti lainnya di provinsi favorit Anda.",
}

export default async function LocationListingPage() {
  const provinces = await prisma.province.findMany({
    include: {
      cities: {
        select: { id: true },
      },
      _count: {
        select: {
          cities: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  const provincesWithPropertyCount = await Promise.all(
    provinces.map(async (province) => {
      const districtIds = await prisma.district.findMany({
        where: { city: { provinceId: province.id } },
        select: { id: true },
      })

      const propertyCount = await prisma.property.count({
        where: {
          districtId: { in: districtIds.map((d) => d.id) },
          status: "ACTIVE",
        },
      })

      return {
        ...province,
        propertyCount,
      }
    })
  )

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-1.5 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#1769AA] transition-colors">
                Beranda
              </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="text-[#222222] font-medium">Lokasi</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#222222] mb-3">
            Properti Berdasarkan Lokasi
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Temukan properti impian Anda di berbagai provinsi di seluruh Indonesia
          </p>
        </div>

        {provincesWithPropertyCount.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada lokasi tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {provincesWithPropertyCount.map((province) => (
              <Link
                key={province.id}
                href={`/properti?lokasi=${province.slug}`}
                className="group block bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:border-[#1769AA]/20 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1769AA]/10 flex items-center justify-center group-hover:bg-[#1769AA]/20 transition-colors">
                    <MapPin className="h-6 w-6 text-[#1769AA]" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#1769AA] transition-colors" />
                </div>

                <h2 className="text-lg font-semibold text-[#222222] mb-1 group-hover:text-[#1769AA] transition-colors">
                  {province.name}
                </h2>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    <span>{province._count.cities} kota</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span>{province.propertyCount} properti</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
