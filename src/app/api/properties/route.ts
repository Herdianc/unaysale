import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { propertyCreateSchema } from "@/lib/validations"
import { generatePropertyCode } from "@/lib/property-code"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get("page") ?? "1", 10)
    const limit = parseInt(searchParams.get("limit") ?? "12", 10)
    const sortBy = searchParams.get("sortBy") ?? "newest"
    const transactionType = searchParams.get("transactionType")
    const category = searchParams.get("category")
    const district = searchParams.get("district")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const bedrooms = searchParams.get("bedrooms")
    const bathrooms = searchParams.get("bathrooms")
    const landArea = searchParams.get("landArea")
    const buildingArea = searchParams.get("buildingArea")
    const certificate = searchParams.get("certificate")
    const search = searchParams.get("search")

    const where: any = {
      status: "ACTIVE",
    }

    if (transactionType) {
      where.transactionType = transactionType
    }

    if (category) {
      where.category = { slug: category }
    }

    if (district) {
      where.district = { slug: district }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (bedrooms) {
      where.specs = {
        ...where.specs,
        bedrooms: { gte: parseInt(bedrooms, 10) },
      }
    }

    if (bathrooms) {
      where.specs = {
        ...where.specs,
        bathrooms: { gte: parseInt(bathrooms, 10) },
      }
    }

    if (landArea) {
      where.specs = {
        ...where.specs,
        landArea: { gte: parseFloat(landArea) },
      }
    }

    if (buildingArea) {
      where.specs = {
        ...where.specs,
        buildingArea: { gte: parseFloat(buildingArea) },
      }
    }

    if (certificate) {
      where.legalities = { certificate }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { code: { equals: search.toUpperCase() } },
      ]
    }

    const orderBy: any = (() => {
      switch (sortBy) {
        case "price_asc":
          return { price: "asc" }
        case "price_desc":
          return { price: "desc" }
        case "popular":
          return { views: "desc" }
        case "newest":
        default:
          return { createdAt: "desc" }
      }
    })()

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: true,
          district: {
            include: { city: { include: { province: true } } },
          },
          specs: true,
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.property.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data,
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error("Properties fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // USER hanya bisa view - hanya AGENT/ADMIN/SUPER_ADMIN yang bisa pasang properti
    const allowedRoles = ["AGENT", "ADMIN", "SUPER_ADMIN"]
    if (!allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "Hanya Agen yang bisa memasang properti. Hubungi admin untuk upgrade akun menjadi Agen." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = propertyCreateSchema.parse(body)

    let slug = slugify(data.title)

    const existing = await prisma.property.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const code = await generatePropertyCode(data.transactionType)

    const property = await prisma.property.create({
      data: {
        code,
        title: data.title,
        slug,
        description: data.description,
        price: data.price,
        priceNegotiable: data.priceNegotiable,
        transactionType: data.transactionType,
        address: data.address,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        categoryId: data.categoryId,
        districtId: data.districtId ?? null,
        villageId: data.villageId ?? null,
        userId: session.user.id,
        facilities: {
          create: (data.facilityIds || []).map((facilityId: string) => ({
            facilityId,
          })),
        },
        images: {
          create: (data.imageUrls || []).map((url: string, index: number) => ({
            url,
            alt: data.title,
            sortOrder: index,
            isPrimary: index === (data.primaryImageIndex ?? 0),
          })),
        },
      },
    })

    try {
      await prisma.propertySpec.create({
        data: {
          propertyId: property.id,
          landArea: data.landArea ?? null,
          buildingArea: data.buildingArea ?? null,
          bedrooms: data.bedrooms ?? null,
          bathrooms: data.bathrooms ?? null,
          floors: data.floors ?? null,
          carport: data.carport ?? null,
          garage: data.garage ?? null,
        },
      })
    } catch (e) {
      console.error("Failed to create property specs:", e)
    }

    try {
      await prisma.propertyLegal.create({
        data: {
          propertyId: property.id,
          certificate: data.certificate ?? null,
          pbb: data.pbb ?? false,
          imb: data.imb ?? false,
        },
      })
    } catch (e) {
      console.error("Failed to create property legalities:", e)
    }

    const fullProperty = await prisma.property.findUnique({
      where: { id: property.id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specs: true,
        legalities: true,
        facilities: { include: { facility: true } },
        category: true,
        district: { include: { city: { include: { province: true } } } },
        village: true,
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json(fullProperty, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    console.error("Property creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
