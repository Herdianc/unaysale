import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeVillages = searchParams.get("include") === "villages"
    const cityId = searchParams.get("cityId")

    const where: any = {}
    if (cityId) {
      where.cityId = cityId
    }

    const districts = await prisma.district.findMany({
      where,
      include: {
        ...(includeVillages && {
          villages: { orderBy: { name: "asc" } },
        }),
        city: {
          include: { province: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(districts)
  } catch (error) {
    console.error("Districts fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
