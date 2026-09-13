import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { leadCreateSchema } from "@/lib/validations"
import { sendWaNotification } from "@/lib/wa-gateway"

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()
    const data = leadCreateSchema.parse(body)

    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      include: {
        agent: { include: { user: { select: { phone: true } } } },
        user: { select: { phone: true } },
      },
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

    // Notifikasi WA ke agen (fire-and-forget: gagal kirim tidak menggagalkan lead)
    const agentPhone =
      (property.agent as { whatsapp?: string | null } | null)?.whatsapp ||
      property.agent?.user?.phone ||
      property.user?.phone
    let waSent = false
    if (agentPhone) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXTAUTH_URL ||
        ""
      const waMessage =
        `🔔 Lead Baru UNAYSALE\n` +
        `Properti: ${property.code ? `[${property.code}] ` : ""}${property.title}\n` +
        `Nama: ${data.name}\n` +
        `Telp: ${data.phone}\n` +
        `Pesan: ${data.message || "-"}` +
        (siteUrl ? `\nLihat: ${siteUrl}/dashboard/leads` : "")
      const waRes = await sendWaNotification(agentPhone, waMessage)
      waSent = waRes.ok
      if (!waRes.ok && !waRes.skipped) {
        console.warn("[LEAD_WA]", waRes.error)
      }
    }

    return NextResponse.json(
      { message: "Lead submitted successfully", lead, waSent },
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
