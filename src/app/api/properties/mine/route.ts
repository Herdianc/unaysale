import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const properties = await prisma.property.findMany({
      where: { userId: session.user.id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("[PROPERTIES_MINE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
