import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public - untuk footer & homepage
export async function GET() {
  try {
    let setting = await prisma.siteSetting.findUnique({ where: { id: "site" } })
    if (!setting) {
      setting = await prisma.siteSetting.create({
        data: {
          id: "site",
          siteName: "UNAYSALE",
          email: "info@unaysale.co.id",
          phone: "+62 21 1234 56789",
          address: "Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190",
          description: "Marketplace properti terpercaya di Indonesia.",
        },
      })
    }
    return NextResponse.json(setting)
  } catch (error) {
    console.error("[SETTINGS_GET]", error)
    return NextResponse.json(
      {
        id: "site",
        siteName: "UNAYSALE",
        email: "info@unaysale.co.id",
        phone: "+62 21 1234 56789",
        address: "Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190",
        description: "Marketplace properti terpercaya di Indonesia.",
      },
      { status: 200 }
    )
  }
}
