import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  MapPin,
  ChevronRight,
  Clock,
  Eye,
  Tag,
  FileText,
  CheckCircle2,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import { PropertyGallery } from "@/components/property/property-gallery"
import { PropertySpecs } from "@/components/property/property-specs"
import { PropertyContact } from "@/components/property/property-contact"
import { PropertyGrid } from "@/components/property/property-grid"
import { Badge } from "@/components/ui/badge"
import { siteConfig } from "@/types"

const propertyFullInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  specs: true,
  legalities: true,
  facilities: { include: { facility: true } },
  category: true,
  district: { include: { city: { include: { province: true } } } },
  village: true,
  user: { select: { id: true, name: true, phone: true, image: true } },
  agent: { include: { user: { select: { id: true, name: true, phone: true, image: true } } } },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await prisma.property.findUnique({
    where: { slug },
    select: {
      title: true,
      metaTitle: true,
      metaDescription: true,
      description: true,
      price: true,
      transactionType: true,
      slug: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      category: { select: { name: true } },
      district: {
        select: {
          name: true,
          city: { select: { name: true, province: { select: { name: true } } } },
        },
      },
      village: { select: { name: true } },
    },
  })

  if (!property) {
    return { title: "Properti Tidak Ditemukan - UNAYSALE" }
  }

  const title = property.metaTitle || `${property.title} - UNAYSALE`
  const description =
    property.metaDescription ||
    `${property.title} - ${
      property.transactionType === "DIJUAL" ? "Dijual" : "Disewa"
    } seharga ${formatPrice(Number(property.price))}. ${property.description.slice(0, 150)}...`

  const location = [
    property.village?.name,
    property.district?.name,
    property.district?.city?.name,
    property.district?.city?.province?.name,
  ]
    .filter(Boolean)
    .join(", ")

  const ogImage = property.images[0]?.url

  return {
    title,
    description,
    keywords: property.category?.name ? [property.category.name, location] : [location],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "id_ID",
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params

  const property = await prisma.property.findUnique({
    where: { slug },
    include: propertyFullInclude,
  })

  if (!property) {
    notFound()
  }

  const price = Number(property.price)
  const location = [
    property.village?.name,
    property.district?.name,
    property.district?.city?.name,
    property.district?.city?.province?.name,
  ]
    .filter(Boolean)
    .join(", ")

  const relatedProperties = await prisma.property.findMany({
    where: {
      categoryId: property.categoryId,
      id: { not: property.id },
      status: "ACTIVE",
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
      district: { include: { city: { include: { province: true } } } },
      village: true,
      specs: true,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  })

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
                href="/properti"
                className="hover:text-[#1769AA] transition-colors"
              >
                Properti
              </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li>
              <Link
                href={`/properti?kategori=${property.category?.slug || ""}`}
                className="hover:text-[#1769AA] transition-colors"
              >
                {property.category?.name}
              </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="text-[#222222] font-medium truncate max-w-[200px]">
              {property.title}
            </li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PropertyGallery
              images={property.images.map((img) => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
              }))}
              title={property.title}
            />

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                {property.code && (
                  <span className="rounded-full bg-[#1769AA]/10 px-3 py-1 text-xs font-bold tracking-wide text-[#1769AA]">
                    Kode: {property.code}
                  </span>
                )}
                <Badge
                  variant={
                    property.transactionType === "DIJUAL" ? "success" : "info"
                  }
                >
                  {property.transactionType === "DIJUAL" ? "Dijual" : "Disewa"}
                </Badge>
                <Badge
                  variant={
                    property.status === "ACTIVE"
                      ? "success"
                      : property.status === "SOLD"
                      ? "danger"
                      : "warning"
                  }
                >
                  {property.status === "ACTIVE"
                    ? "Aktif"
                    : property.status === "SOLD"
                    ? "Terjual"
                    : property.status === "RENTED"
                    ? "Disewa"
                    : property.status}
                </Badge>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#222222] mb-2">
                {property.title}
              </h1>

              <div className="text-2xl sm:text-3xl font-bold text-[#1769AA] mb-4">
                {formatPrice(price)}
                {property.transactionType === "DISEWA" && (
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    / tahun
                  </span>
                )}
                {property.priceNegotiable && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (Nego)
                  </span>
                )}
              </div>

              {location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{location}</span>
                </div>
              )}

              {property.address && (
                <p className="text-sm text-gray-600 mb-4">
                  {property.address}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{property.views} dilihat</span>
                </div>
                {property.category && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{property.category.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <PropertySpecs
                specs={property.specs}
                legalities={
                  property.legalities
                    ? {
                        certificate: property.legalities.certificate,
                        isImb: property.legalities.imb,
                        isPbb: property.legalities.pbb,
                      }
                    : undefined
                }
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-[#222222] mb-3">
                Deskripsi
              </h3>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {property.facilities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-base font-semibold text-[#222222] mb-3">
                  Fasilitas
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.facilities.map((pf) => (
                    <div
                      key={pf.id}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-[#F7F8FA] rounded-lg px-3 py-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>{pf.facility.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-[#222222] mb-3">
                Lokasi
              </h3>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-[#1769AA] mt-0.5 flex-shrink-0" />
                <div>
                  <p>{property.address || location}</p>
                  {property.latitude && property.longitude && (
                    <p className="text-xs text-gray-400 mt-1">
                      Koordinat: {property.latitude}, {property.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-20">
              <PropertyContact property={property} />
            </div>
          </aside>
        </div>

        {relatedProperties.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#222222] mb-6">
              Properti Terkait
            </h2>
            <PropertyGrid properties={relatedProperties} />
          </section>
        )}
      </div>

      {(() => {
        const waNumber =
          (property.agent as any)?.whatsapp ||
          property.agent?.user?.phone ||
          property.user?.phone
        if (!waNumber) return null
        const message = encodeURIComponent(
          `Halo, saya tertarik dengan properti ${property.code ? `[${property.code}] ` : ""}"${property.title}". Mohon info lebih lanjut.`
        )
        let cleaned = String(waNumber).replace(/[^0-9]/g, "")
        if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1)
        return (
          <a
            href={`https://wa.me/${cleaned}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat via WhatsApp"
            className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        )
      })()}
    </main>
  )
}
