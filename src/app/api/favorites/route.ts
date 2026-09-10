import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        property: {
          include: {
            images: { take: 1, orderBy: { sortOrder: "asc" } },
            category: true,
            specs: true,
            district: { include: { city: { include: { province: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Favorites fetch error:", error)
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
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    const existing = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        propertyId,
      },
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ isFavorited: false })
    }

    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        propertyId,
      },
    })

    return NextResponse.json({ isFavorited: true })
  } catch (error) {
    console.error("Favorite toggle error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
