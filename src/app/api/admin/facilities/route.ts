import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(facilities)
  } catch (error) {
    console.error("[ADMIN_FACILITIES_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, icon } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const facility = await prisma.facility.create({
      data: { name, slug, icon },
    })

    return NextResponse.json(facility, { status: 201 })
  } catch (error) {
    console.error("[ADMIN_FACILITIES_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
