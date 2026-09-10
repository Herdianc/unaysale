import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { propertyCreateSchema } from "@/lib/validations"
import { generatePropertyCode } from "@/lib/property-code"

const propertyInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  specs: true,
  legalities: true,
  facilities: { include: { facility: true } },
  category: true,
  district: {
    include: { city: { include: { province: true } } },
  },
  village: true,
  user: {
    select: { id: true, name: true, image: true, phone: true, email: true },
  },
  agent: {
    include: {
      user: {
        select: { id: true, name: true, image: true, phone: true },
      },
    },
  },
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const property = await prisma.property.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: propertyInclude,
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    await prisma.property.update({
      where: { id: property.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error("Property fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    if (property.userId !== session.user.id && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = propertyCreateSchema.partial().parse(body)

    let newCode: string | undefined
    if (data.transactionType && data.transactionType !== property.transactionType) {
      newCode = await generatePropertyCode(data.transactionType)
    }

    await prisma.property.update({
      where: { id },
      data: {
        ...(newCode && { code: newCode }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.priceNegotiable !== undefined && { priceNegotiable: data.priceNegotiable }),
        ...(data.transactionType !== undefined && { transactionType: data.transactionType }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.districtId !== undefined && { districtId: data.districtId }),
        ...(data.villageId !== undefined && { villageId: data.villageId }),
      },
    })

    const hasSpecFields =
      data.landArea !== undefined ||
      data.buildingArea !== undefined ||
      data.bedrooms !== undefined ||
      data.bathrooms !== undefined ||
      data.floors !== undefined ||
      data.carport !== undefined ||
      data.garage !== undefined

    if (hasSpecFields) {
      const existingSpec = await prisma.propertySpec.findUnique({
        where: { propertyId: id },
      })

      if (existingSpec) {
        await prisma.propertySpec.update({
          where: { propertyId: id },
          data: {
            ...(data.landArea !== undefined && { landArea: data.landArea }),
            ...(data.buildingArea !== undefined && { buildingArea: data.buildingArea }),
            ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
            ...(data.bathrooms !== undefined && { bathrooms: data.bathrooms }),
            ...(data.floors !== undefined && { floors: data.floors }),
            ...(data.carport !== undefined && { carport: data.carport }),
            ...(data.garage !== undefined && { garage: data.garage }),
          },
        })
      } else {
        await prisma.propertySpec.create({
          data: {
            propertyId: id,
            landArea: data.landArea ?? null,
            buildingArea: data.buildingArea ?? null,
            bedrooms: data.bedrooms ?? null,
            bathrooms: data.bathrooms ?? null,
            floors: data.floors ?? null,
            carport: data.carport ?? null,
            garage: data.garage ?? null,
          },
        })
      }
    }

    const hasLegalFields =
      data.certificate !== undefined ||
      data.pbb !== undefined ||
      data.imb !== undefined

    if (hasLegalFields) {
      const existingLegal = await prisma.propertyLegal.findUnique({
        where: { propertyId: id },
      })

      if (existingLegal) {
        await prisma.propertyLegal.update({
          where: { propertyId: id },
          data: {
            ...(data.certificate !== undefined && { certificate: data.certificate }),
            ...(data.pbb !== undefined && { pbb: data.pbb }),
            ...(data.imb !== undefined && { imb: data.imb }),
          },
        })
      } else {
        await prisma.propertyLegal.create({
          data: {
            propertyId: id,
            certificate: data.certificate ?? null,
            pbb: data.pbb ?? false,
            imb: data.imb ?? false,
          },
        })
      }
    }

    if (data.facilityIds !== undefined) {
      await prisma.propertyFacility.deleteMany({ where: { propertyId: id } })
      if (data.facilityIds.length > 0) {
        await prisma.propertyFacility.createMany({
          data: data.facilityIds.map((facilityId: string) => ({
            propertyId: id,
            facilityId,
          })),
        })
      }
    }

    if (data.imageUrls !== undefined) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } })
      if (data.imageUrls.length > 0) {
        await prisma.propertyImage.createMany({
          data: data.imageUrls.map((url: string, index: number) => ({
            propertyId: id,
            url,
            alt: data.title ?? property.title,
            sortOrder: index,
            isPrimary: index === (data.primaryImageIndex ?? 0),
          })),
        })
      }
    }

    const updated = await prisma.property.findUnique({
      where: { id },
      include: propertyInclude,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    console.error("Property update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    if (property.userId !== session.user.id && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    await prisma.property.delete({ where: { id } })

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Property deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
