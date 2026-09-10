import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
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
    const skip = (page - 1) * limit

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
          _count: { select: { properties: true, leads: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.agent.count(),
    ])

    return NextResponse.json({
      agents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[ADMIN_AGENTS_GET]", error)
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
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" && body.password.length >= 8
      ? body.password
      : "Password123"

    if (name.length < 2) {
      return NextResponse.json({ error: "Nama minimal 2 karakter" }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null,
        role: "AGENT",
        isActive: true,
        agent: {
          create: {
            companyName: typeof body.companyName === "string" && body.companyName.trim() ? body.companyName.trim() : null,
            bio: typeof body.bio === "string" && body.bio.trim() ? body.bio.trim() : null,
            license: typeof body.license === "string" && body.license.trim() ? body.license.trim() : null,
            whatsapp: typeof body.whatsapp === "string" && body.whatsapp.trim() ? body.whatsapp.trim() : null,
            isVerified: Boolean(body.isVerified),
          },
        },
      },
      include: {
        agent: {
          include: {
            _count: { select: { properties: true, leads: true } },
          },
        },
      },
    })

    return NextResponse.json(user.agent, { status: 201 })
  } catch (error) {
    console.error("[ADMIN_AGENTS_POST]", error)
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
    const { id, isVerified } = body

    if (!id) {
      return NextResponse.json({ error: "Agent id is required" }, { status: 400 })
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(agent)
  } catch (error) {
    console.error("[ADMIN_AGENTS_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
