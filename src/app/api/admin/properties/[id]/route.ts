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

    const allowedFields = ["status", "isFeatured", "categoryId", "agentId"]
    const data: Record<string, any> = {}
    for (const key of allowedFields) {
      if (key in body) {
        data[key] = body[key]
      }
    }

    const property = await prisma.property.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error("[ADMIN_PROPERTIES_PATCH]", error)
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

    await prisma.property.delete({ where: { id } })

    return NextResponse.json({ message: "Property deleted" })
  } catch (error) {
    console.error("[ADMIN_PROPERTIES_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
