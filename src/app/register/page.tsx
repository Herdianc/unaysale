import { redirect } from "next/navigation"

// Pendaftaran publik dinonaktifkan - akun dibuat oleh Admin via /admin/pengguna.
// File ini dipertahankan agar URL lama tidak 404.
export default function RegisterPage() {
  redirect("/login")
}
