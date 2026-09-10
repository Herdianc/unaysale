import { NextResponse } from "next/server"
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
    const { type, name, slug } = body

    if (!type) {
      return NextResponse.json({ error: "Type is required (province, city, district, village)" }, { status: 400 })
    }

    const data: Record<string, any> = {}
    if (typeof name === "string") data.name = name
    if (typeof slug === "string") data.slug = slug

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    let location: any

    switch (type) {
      case "province":
        location = await prisma.province.update({ where: { id }, data })
        break
      case "city":
        location = await prisma.city.update({ where: { id }, data })
        break
      case "district":
        location = await prisma.district.update({ where: { id }, data })
        break
      case "village":
        location = await prisma.village.update({ where: { id }, data })
        break
      default:
        return NextResponse.json({ error: "Invalid type. Use: province, city, district, village" }, { status: 400 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("[ADMIN_LOCATIONS_ID_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type) {
      return NextResponse.json({ error: "Type query param is required (province, city, district, village)" }, { status: 400 })
    }

    switch (type) {
      case "province": {
        const cityCount = await prisma.city.count({ where: { provinceId: id } })
        if (cityCount > 0) {
          return NextResponse.json(
            { error: `Cannot delete province with ${cityCount} cities. Remove them first.` },
            { status: 400 }
          )
        }
        await prisma.province.delete({ where: { id } })
        break
      }
      case "city": {
        const districtCount = await prisma.district.count({ where: { cityId: id } })
        if (districtCount > 0) {
          return NextResponse.json(
            { error: `Cannot delete city with ${districtCount} districts. Remove them first.` },
            { status: 400 }
          )
        }
        await prisma.city.delete({ where: { id } })
        break
      }
      case "district": {
        const villageCount = await prisma.village.count({ where: { districtId: id } })
        if (villageCount > 0) {
          return NextResponse.json(
            { error: `Cannot delete district with ${villageCount} villages. Remove them first.` },
            { status: 400 }
          )
        }
        const propertyCount = await prisma.property.count({ where: { districtId: id } })
        if (propertyCount > 0) {
          return NextResponse.json(
            { error: `Cannot delete district with ${propertyCount} properties. Reassign them first.` },
            { status: 400 }
          )
        }
        await prisma.district.delete({ where: { id } })
        break
      }
      case "village": {
        const villagePropertyCount = await prisma.property.count({ where: { villageId: id } })
        if (villagePropertyCount > 0) {
          return NextResponse.json(
            { error: `Cannot delete village with ${villagePropertyCount} properties. Reassign them first.` },
            { status: 400 }
          )
        }
        await prisma.village.delete({ where: { id } })
        break
      }
      default:
        return NextResponse.json({ error: "Invalid type. Use: province, city, district, village" }, { status: 400 })
    }

    return NextResponse.json({ message: `${type} deleted` })
  } catch (error) {
    console.error("[ADMIN_LOCATIONS_ID_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
