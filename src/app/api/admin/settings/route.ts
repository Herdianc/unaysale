import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULTS = {
  id: "site",
  siteName: "UNAYSALE",
  email: "info@unaysale.co.id",
  phone: "+62 21 1234 56789",
  address: "Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190",
  description: "Marketplace properti terpercaya di Indonesia.",
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    let setting = await prisma.siteSetting.findUnique({ where: { id: "site" } })
    if (!setting) {
      setting = await prisma.siteSetting.create({ data: DEFAULTS })
    }
    return NextResponse.json(setting)
  } catch (error) {
    console.error("[ADMIN_SETTINGS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const data: Record<string, string> = {}
    if (typeof body.siteName === "string" && body.siteName.trim()) data.siteName = body.siteName.trim()
    if (typeof body.email === "string" && body.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
        return NextResponse.json({ error: "Email tidak valid" }, { status: 400 })
      }
      data.email = body.email.trim()
    }
    if (typeof body.phone === "string" && body.phone.trim()) data.phone = body.phone.trim()
    if (typeof body.address === "string" && body.address.trim()) data.address = body.address.trim()
    if (body.description !== undefined) data.description = typeof body.description === "string" ? body.description.trim() : null as unknown as string

    const setting = await prisma.siteSetting.upsert({
      where: { id: "site" },
      update: data,
      create: { ...DEFAULTS, ...data },
    })
    return NextResponse.json(setting)
  } catch (error) {
    console.error("[ADMIN_SETTINGS_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
