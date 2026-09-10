import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }
    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { properties: true, favorites: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, role, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 })
    }

    if (role && !["USER", "AGENT", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 })
    }

    const userBefore = id ? await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, agent: { select: { id: true } } },
    }) : null
    if (id && !userBefore) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data: Record<string, any> = {}
    if (role) data.role = role
    if (typeof isActive === "boolean") data.isActive = isActive

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, isActive: true },
      })
      if (role === "AGENT" && userBefore && !userBefore.agent) {
        await tx.agent.create({
          data: { userId: id, isVerified: false, rating: 0, totalSales: 0 },
        })
      }
      if (role && role !== "AGENT" && userBefore?.role === "AGENT" && userBefore.agent) {
        await tx.property.updateMany({ where: { agentId: userBefore.agent.id }, data: { agentId: null } })
        await tx.agent.delete({ where: { id: userBefore.agent.id } })
      }
      return user
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
