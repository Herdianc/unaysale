import { MetadataRoute } from "next"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

// Domain diambil dari request yang masuk (otomatis benar di domain mana pun,
// tanpa tergantung ENV). Fallback ke ENV lalu unaysale.id.
async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers()
    const host = h.get("x-forwarded-host") || h.get("host")
    if (host) {
      const proto = h.get("x-forwarded-proto") || "https"
      return `${proto}://${host}`.replace(/\/+$/, "")
    }
  } catch {}
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://unaysale.id"
  ).replace(/\/+$/, "")
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = await getBaseUrl()
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/properti`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/properti/dijual`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/properti/disewa`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/agen`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/lokasi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  const [properties, agents, districts] = await Promise.all([
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.agent.findMany({
      select: {
        id: true,
        user: { select: { name: true } },
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.district.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    }),
  ])

  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${BASE_URL}/properti/${property.slug}`,
    lastModified: property.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${BASE_URL}/agen/${agent.id}`,
    lastModified: agent.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  const locationPages: MetadataRoute.Sitemap = districts.map((district) => ({
    url: `${BASE_URL}/lokasi/${district.slug}`,
    lastModified: district.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...propertyPages, ...agentPages, ...locationPages]
}
