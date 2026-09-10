import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE_URL = "https://unaysale.id"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
