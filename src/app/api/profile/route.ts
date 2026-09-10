import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        agent: {
          select: {
            id: true,
            companyName: true,
            bio: true,
            license: true,
            isVerified: true,
            rating: true,
            totalSales: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[PROFILE_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, password } = body

    const data: Record<string, any> = {}
    if (typeof name === "string") data.name = name
    if (typeof phone === "string") data.phone = phone
    if (typeof password === "string" && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password harus minimal 6 karakter" },
          { status: 400 }
        )
      }
      data.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[PROFILE_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
