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

    const targetRole = body.role as string | undefined

    // Validasi role
    if (targetRole && !["USER", "AGENT", "ADMIN", "SUPER_ADMIN"].includes(targetRole)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 })
    }

    const userBefore = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, agent: { select: { id: true } } },
    })
    if (!userBefore) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data: Record<string, any> = {}
    if (targetRole) data.role = targetRole
    if (typeof body.isActive === "boolean") data.isActive = body.isActive

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, isActive: true },
      })

      // Jika promote ke AGENT -> buat Agent record jika belum ada
      if (targetRole === "AGENT" && !userBefore.agent) {
        await tx.agent.create({
          data: {
            userId: id,
            isVerified: false,
            rating: 0,
            totalSales: 0,
          },
        })
      }

      // Jika demote dari AGENT ke USER/ADMIN -> hapus Agent record
      if (targetRole && targetRole !== "AGENT" && userBefore.role === "AGENT" && userBefore.agent) {
        // Hapus agen & lepas properti yang terikat agen (jangan hapus propertinya)
        await tx.property.updateMany({
          where: { agentId: userBefore.agent.id },
          data: { agentId: null },
        })
        await tx.agent.delete({ where: { id: userBefore.agent.id } })
      }

      return user
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[ADMIN_USERS_ID_PATCH]", error)
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
    // Cegah hapus diri sendiri
    if (id === session.user.id) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 })
    }

    // Hapus agen terkait jika ada, lalu soft delete user
    const existing = await prisma.user.findUnique({ where: { id }, select: { agent: { select: { id: true } } } })
    if (existing?.agent) {
      await prisma.property.updateMany({ where: { agentId: existing.agent.id }, data: { agentId: null } })
      await prisma.agent.delete({ where: { id: existing.agent.id } })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true },
    })

    return NextResponse.json({ ...user, status: user.isActive ? "ACTIVE" : "INACTIVE" })
  } catch (error) {
    console.error("[ADMIN_USERS_ID_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
