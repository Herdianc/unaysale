import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const data: Record<string, any> = {}
    if (body.name) data.name = body.name
    if (body.slug) data.slug = body.slug
    if (typeof body.description === "string") data.description = body.description
    if (typeof body.icon === "string") data.icon = body.icon
    if (typeof body.isActive === "boolean") data.isActive = body.isActive

    const category = await prisma.category.update({
      where: { id },
      data,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_ID_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const propertyCount = await prisma.property.count({ where: { categoryId: id } })
    if (propertyCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${propertyCount} properties. Reassign them first.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ message: "Category deleted" })
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_ID_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
