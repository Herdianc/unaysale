import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const VALID_STATUSES = ["NEW", "CONTACTED", "FOLLOW_UP", "CLOSED"]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { property: { select: { userId: true } } },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 })
    }
    if (lead.property.userId !== session.user.id && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: { status: body.status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[DASHBOARD_LEADS_ID_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
