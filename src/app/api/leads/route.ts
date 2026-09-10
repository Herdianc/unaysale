import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { leadCreateSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()
    const data = leadCreateSchema.parse(body)

    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email ?? null,
        phone: data.phone,
        message: data.message ?? null,
        propertyId: data.propertyId,
        userId: session?.user?.id ?? null,
      },
    })

    return NextResponse.json(
      { message: "Lead submitted successfully", lead },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }
    console.error("Lead creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
