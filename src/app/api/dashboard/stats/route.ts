import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const [
      totalProperties,
      activeProperties,
      pendingProperties,
      soldProperties,
      rentedProperties,
      totalFavorites,
    ] = await Promise.all([
      prisma.property.count({ where: { userId } }),
      prisma.property.count({ where: { userId, status: "ACTIVE" } }),
      prisma.property.count({ where: { userId, status: "PENDING" } }),
      prisma.property.count({ where: { userId, status: "SOLD" } }),
      prisma.property.count({ where: { userId, status: "RENTED" } }),
      prisma.favorite.count({ where: { userId } }),
    ])

    return NextResponse.json({
      totalProperties,
      activeProperties,
      pendingProperties,
      soldProperties,
      rentedProperties,
      totalFavorites,
    })
  } catch (error) {
    console.error("[DASHBOARD_STATS]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
