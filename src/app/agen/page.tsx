import { Metadata } from "next"
import Link from "next/link"
import { Search, BadgeCheck, MapPin, Building, Star, Home } from "lucide-react"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Cari Agen Properti - UNAYSALE",
  description:
    "Temukan agen properti terpercaya untuk membantu Anda membeli, menjual, atau menyewa properti impian.",
}

export default async function AgentListPage() {
  const agents = await prisma.agent.findMany({
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
    orderBy: [{ isVerified: "desc" }, { totalSales: "desc" }],
  })

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="bg-gradient-to-r from-[#0F4C75] to-[#1769AA] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Cari Agen Properti
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Temukan agen properti terbaik dan terpercaya untuk membantu Anda
            menemukan properti impian.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {agents.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Belum ada agen properti yang terdaftar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agen/${agent.user.name
                  ?.toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "") || agent.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#1769AA]/20 transition-all duration-300">
                  <div className="bg-gradient-to-br from-[#0F4C75] to-[#1769AA] h-24 relative">
                    {agent.isVerified && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#1769AA] text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Terverifikasi
                      </div>
                    )}
                  </div>

                  <div className="px-5 pb-5 -mt-10">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 overflow-hidden mb-3 mx-auto group-hover:scale-105 transition-transform">
                      <img
                        src={
                          agent.user.image ||
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
                        }
                        alt={agent.user.name || "Agen"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="text-base font-bold text-[#222222] text-center mb-1 group-hover:text-[#1769AA] transition-colors">
                      {agent.user.name}
                    </h3>

                    {agent.companyName && (
                      <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500 mb-3">
                        <Building className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{agent.companyName}</span>
                      </div>
                    )}

                    {agent.bio && (
                      <p className="text-xs text-gray-400 text-center mb-4 line-clamp-2 px-2">
                        {agent.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-1">
                        <Home className="h-3.5 w-3.5" />
                        <span>{agent._count.properties} Properti</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span>{agent.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{agent.totalSales} Terjual</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
