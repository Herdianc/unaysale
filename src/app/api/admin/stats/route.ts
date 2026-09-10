import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      totalProperties,
      activeProperties,
      pendingProperties,
      soldProperties,
      totalUsers,
      totalAgents,
      totalLeads,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: "ACTIVE" } }),
      prisma.property.count({ where: { status: "PENDING" } }),
      prisma.property.count({ where: { status: "SOLD" } }),
      prisma.user.count(),
      prisma.agent.count(),
      prisma.lead.count(),
    ])

    return NextResponse.json({
      totalProperties,
      activeProperties,
      pendingProperties,
      soldProperties,
      totalUsers,
      totalAgents,
      totalLeads,
    })
  } catch (error) {
    console.error("[ADMIN_STATS]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
