import { NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    const role = (session.user as { role?: string }).role
    if (role !== "AGENT" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Agen dan Admin yang bisa upload gambar" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format harus JPG, PNG, WebP, atau GIF" },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran maksimal 5MB" },
        { status: 400 }
      )
    }

    const ext = file.type === "image/jpeg" ? ".jpg" : `.${file.type.split("/")[1]}`
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`

    // Vercel production: simpan permanen di Vercel Blob (tidak hilang saat redeploy).
    // Aktifkan dengan ENV BLOB_READ_WRITE_TOKEN (Vercel Dashboard -> Storage -> Create Blob Store).
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (blobToken) {
      const blob = await put(`uploads/${safeName}`, file, {
        access: "public",
        token: blobToken,
      })
      return NextResponse.json({ url: blob.url }, { status: 201 })
    }

    // Lokal / fallback: simpan di public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, safeName), buffer)

    return NextResponse.json({ url: `/uploads/${safeName}` }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
