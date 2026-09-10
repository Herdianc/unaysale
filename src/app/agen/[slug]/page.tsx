import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ChevronRight,
  BadgeCheck,
  MapPin,
  Phone,
  Mail,
  Building,
  Star,
  Home,
  Briefcase,
  MessageCircle,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { PropertyGrid } from "@/components/property/property-grid"
import { siteConfig } from "@/types"

interface PageProps {
  params: Promise<{ slug: string }>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const allAgents = await prisma.agent.findMany({
    include: {
      user: { select: { name: true } },
      _count: { select: { properties: { where: { status: "ACTIVE" } } } },
    },
  })

  const resolvedAgent = allAgents.find(
    (a) => a.user.name && slugify(a.user.name) === slug
  )

  if (!resolvedAgent) {
    return { title: "Agen Tidak Ditemukan - UNAYSALE" }
  }

  const title = `${resolvedAgent.user.name} - Agen Properti | UNAYSALE`
  const description =
    resolvedAgent.bio ||
    `Agen properti ${resolvedAgent.user.name}${
      resolvedAgent.companyName ? ` dari ${resolvedAgent.companyName}` : ""
    }. ${resolvedAgent._count.properties} properti aktif dijual/disewa.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      locale: "id_ID",
    },
  }
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { slug } = await params

  const allAgents = await prisma.agent.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
      _count: {
        select: {
          properties: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
  })

  const agent = allAgents.find(
    (a) => a.user.name && slugify(a.user.name) === slug
  )

  if (!agent) {
    notFound()
  }

  const totalListings = await prisma.property.count({
    where: { agentId: agent.id },
  })

  const activeProperties = await prisma.property.findMany({
    where: {
      agentId: agent.id,
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
  })

  const whatsappNumber = siteConfig.whatsapp
  const whatsappMessage = encodeURIComponent(
    `Halo ${agent.user.name}, saya tertarik dengan properti Anda di UNAYSALE.`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

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
            <li>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link
                href="/agen"
                className="hover:text-[#1769AA] transition-colors"
              >
                Agen
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="text-[#222222] font-medium">
              {agent.user.name}
            </li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
                  <img
                    src={
                      agent.user.image ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
                    }
                    alt={agent.user.name || "Agen"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-[#222222]">
                      {agent.user.name}
                    </h1>
                    {agent.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1769AA] text-xs font-semibold px-2 py-0.5 rounded-full">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Terverifikasi
                      </span>
                    )}
                  </div>

                  {agent.companyName && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-500 mb-2">
                      <Building className="h-4 w-4" />
                      <span>{agent.companyName}</span>
                    </div>
                  )}

                  {agent.bio && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {agent.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-[#222222]">
                        {agent.rating.toFixed(1)}
                      </span>
                      <span>Rating</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-[#1769AA]" />
                      <span className="font-semibold text-[#222222]">
                        {agent.totalSales}
                      </span>
                      <span>Terjual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Home className="h-4 w-4 text-[#1769AA]" />
                      <span className="font-semibold text-[#222222]">
                        {agent._count.properties}
                      </span>
                      <span>Listing Aktif</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#222222] mb-5">
                Properti oleh {agent.user.name}
              </h2>
              <PropertyGrid
                properties={activeProperties}
                emptyMessage="Agen ini belum memiliki properti aktif."
              />
            </section>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-base font-semibold text-[#222222] mb-4">
                  Kontak Agen
                </h3>

                <div className="space-y-3 mb-5">
                  {agent.user.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-9 h-9 rounded-lg bg-[#1769AA]/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-[#1769AA]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Telepon</p>
                        <p className="font-medium">{agent.user.phone}</p>
                      </div>
                    </div>
                  )}

                  {agent.user.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-9 h-9 rounded-lg bg-[#1769AA]/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-[#1769AA]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="font-medium">{agent.user.email}</p>
                      </div>
                    </div>
                  )}

                  {agent.license && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-9 h-9 rounded-lg bg-[#1769AA]/10 flex items-center justify-center flex-shrink-0">
                        <BadgeCheck className="h-4 w-4 text-[#1769AA]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">No. Lisensi</p>
                        <p className="font-medium">{agent.license}</p>
                      </div>
                    </div>
                  )}
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Hubungi via WhatsApp
                </a>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-base font-semibold text-[#222222] mb-3">
                  Statistik Agen
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Listing</span>
                    <span className="font-semibold text-[#222222]">
                      {totalListings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Properti Aktif</span>
                    <span className="font-semibold text-emerald-600">
                      {agent._count.properties}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-[#222222]">
                        {agent.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Terjual</span>
                    <span className="font-semibold text-[#222222]">
                      {agent.totalSales}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`font-semibold ${
                        agent.isVerified
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {agent.isVerified ? "Terverifikasi" : "Belum Diverifikasi"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
