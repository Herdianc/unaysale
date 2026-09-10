import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/agents/sync -> buat Agent record untuk semua USER role=AGENT yang belum punya profil
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orphanAgents = await prisma.user.findMany({
      where: { role: "AGENT", agent: null },
      select: { id: true, name: true, email: true },
    })

    if (orphanAgents.length === 0) {
      return NextResponse.json({ message: "Semua agen sudah sinkron", created: 0 })
    }

    for (const u of orphanAgents) {
      await prisma.agent.create({
        data: {
          userId: u.id,
          isVerified: false,
          rating: 0,
          totalSales: 0,
        },
      })
    }

    return NextResponse.json({
      message: `Berhasil sync ${orphanAgents.length} agen`,
      created: orphanAgents.length,
      users: orphanAgents,
    })
  } catch (error) {
    console.error("[ADMIN_AGENTS_SYNC]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
