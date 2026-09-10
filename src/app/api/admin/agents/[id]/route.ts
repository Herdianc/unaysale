import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const agent = await prisma.agent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    let isVerified: boolean | undefined
    if (body.action === "verify") {
      isVerified = true
    } else if (body.action === "unverify") {
      isVerified = false
    } else if (typeof body.isVerified === "boolean") {
      isVerified = body.isVerified
    }

    const agentData: Record<string, any> = {}
    if (typeof isVerified === "boolean") agentData.isVerified = isVerified
    if (body.companyName !== undefined) {
      agentData.companyName =
        typeof body.companyName === "string" && body.companyName.trim()
          ? body.companyName.trim()
          : null
    }
    if (body.bio !== undefined) {
      agentData.bio =
        typeof body.bio === "string" && body.bio.trim() ? body.bio.trim() : null
    }
    if (body.license !== undefined) {
      agentData.license =
        typeof body.license === "string" && body.license.trim()
          ? body.license.trim()
          : null
    }
    if (body.whatsapp !== undefined) {
      agentData.whatsapp =
        typeof body.whatsapp === "string" && body.whatsapp.trim()
          ? body.whatsapp.trim()
          : null
    }

    const userData: Record<string, any> = {}
    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : ""
      if (name.length < 2) {
        return NextResponse.json({ error: "Nama minimal 2 karakter" }, { status: 400 })
      }
      userData.name = name
    }
    if (body.email !== undefined) {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Email tidak valid" }, { status: 400 })
      }
      const dupe = await prisma.user.findFirst({
        where: { email, NOT: { id: agent.userId } },
      })
      if (dupe) {
        return NextResponse.json({ error: "Email sudah dipakai user lain" }, { status: 409 })
      }
      userData.email = email
    }
    if (body.phone !== undefined) {
      userData.phone =
        typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null
    }
    if (body.password !== undefined && typeof body.password === "string" && body.password.trim().length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 })
      }
      userData.password = await bcrypt.hash(body.password, 12)
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({ where: { id: agent.userId }, data: userData })
      }
      return tx.agent.update({
        where: { id },
        data: agentData,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { properties: true, leads: true } },
        },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[ADMIN_AGENTS_ID_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const agent = await prisma.agent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    await prisma.property.updateMany({
      where: { agentId: id },
      data: { agentId: null },
    })

    await prisma.$transaction([
      prisma.agent.delete({ where: { id } }),
      prisma.user.update({
        where: { id: agent.userId },
        data: { isActive: false },
      }),
    ])

    return NextResponse.json({ message: "Agent deleted successfully" })
  } catch (error) {
    console.error("[ADMIN_AGENTS_ID_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
