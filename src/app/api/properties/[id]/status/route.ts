import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PropertyStatus } from "@prisma/client"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { status } = (await request.json()) as { status: PropertyStatus }

    if (!status || !Object.values(PropertyStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, userId: true, user: { select: { role: true } } },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    const isOwner = property.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { status },
      include: {
        images: true,
        specs: true,
        legalities: true,
        facilities: { include: { facility: true } },
        category: true,
        district: { include: { city: { include: { province: true } } } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Status update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
