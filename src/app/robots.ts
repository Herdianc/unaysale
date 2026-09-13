import { MetadataRoute } from "next"
import { headers } from "next/headers"

// Domain diambil dari request yang masuk (otomatis benar di domain mana pun).
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

export default async function robots(): Promise<MetadataRoute.Robots> {
  const BASE_URL = await getBaseUrl()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
