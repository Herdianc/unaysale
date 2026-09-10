import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "province"
    const parentId = searchParams.get("parentId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    let data: any[] = []
    let total = 0

    switch (type) {
      case "province":
        ;[data, total] = await Promise.all([
          prisma.province.findMany({
            skip,
            take: limit,
            orderBy: { name: "asc" },
            include: { _count: { select: { cities: true } } },
          }),
          prisma.province.count(),
        ])
        break
      case "city":
        const cityWhere: any = {}
        if (parentId) cityWhere.provinceId = parentId
        ;[data, total] = await Promise.all([
          prisma.city.findMany({
            where: cityWhere,
            skip,
            take: limit,
            orderBy: { name: "asc" },
            include: { province: { select: { id: true, name: true } }, _count: { select: { districts: true } } },
          }),
          prisma.city.count({ where: cityWhere }),
        ])
        break
      case "district":
        const districtWhere: any = {}
        if (parentId) districtWhere.cityId = parentId
        ;[data, total] = await Promise.all([
          prisma.district.findMany({
            where: districtWhere,
            skip,
            take: limit,
            orderBy: { name: "asc" },
            include: { city: { select: { id: true, name: true } }, _count: { select: { villages: true, properties: true } } },
          }),
          prisma.district.count({ where: districtWhere }),
        ])
        break
      case "village":
        const villageWhere: any = {}
        if (parentId) villageWhere.districtId = parentId
        ;[data, total] = await Promise.all([
          prisma.village.findMany({
            where: villageWhere,
            skip,
            take: limit,
            orderBy: { name: "asc" },
            include: { district: { select: { id: true, name: true } }, _count: { select: { properties: true } } },
          }),
          prisma.village.count({ where: villageWhere }),
        ])
        break
      default:
        return NextResponse.json({ error: "Invalid type. Use: province, city, district, village" }, { status: 400 })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[ADMIN_LOCATIONS_GET]", error)
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
    const { type, name, slug, parentId } = body

    if (!type || !name || !slug) {
      return NextResponse.json({ error: "Type, name, and slug are required" }, { status: 400 })
    }

    let location: any

    switch (type) {
      case "province":
        location = await prisma.province.create({ data: { name, slug } })
        break
      case "city":
        if (!parentId) return NextResponse.json({ error: "parentId required for city" }, { status: 400 })
        location = await prisma.city.create({ data: { name, slug, provinceId: parentId } })
        break
      case "district":
        if (!parentId) return NextResponse.json({ error: "parentId required for district" }, { status: 400 })
        location = await prisma.district.create({ data: { name, slug, cityId: parentId } })
        break
      case "village":
        if (!parentId) return NextResponse.json({ error: "parentId required for village" }, { status: 400 })
        location = await prisma.village.create({ data: { name, slug, districtId: parentId } })
        break
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error("[ADMIN_LOCATIONS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
