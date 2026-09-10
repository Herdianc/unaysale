import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(facilities)
  } catch (error) {
    console.error("Facilities fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "Nama fasilitas harus 2-50 karakter" },
        { status: 400 }
      )
    }

    const allFacilities = await prisma.facility.findMany({ select: { id: true, name: true, slug: true, icon: true, isActive: true } })
    const existing = allFacilities.find(
      (f) => f.name.toLowerCase() === name.toLowerCase()
    )
    if (existing) {
      return NextResponse.json(existing)
    }

    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
    if (!slug) slug = `fasilitas-${Date.now()}`

    const slugTaken = await prisma.facility.findUnique({ where: { slug } })
    if (slugTaken) slug = `${slug}-${Date.now()}`

    const facility = await prisma.facility.create({
      data: { name, slug, isActive: true },
    })

    return NextResponse.json(facility, { status: 201 })
  } catch (error) {
    console.error("Facility creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
