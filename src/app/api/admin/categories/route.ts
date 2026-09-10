import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_GET]", error)
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
    const { name, slug, description, icon } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name, slug, description, icon },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
