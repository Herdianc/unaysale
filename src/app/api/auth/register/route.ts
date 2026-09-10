import { NextResponse } from "next/server"

export async function POST(_request: Request) {
  // Pendaftaran publik dinonaktifkan - akun dibuat oleh Admin via /admin/pengguna.
  return NextResponse.json(
    { error: "Pendaftaran akun baru dinonaktifkan. Hubungi admin." },
    { status: 403 }
  )
}
