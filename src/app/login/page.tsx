"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [csrfToken, setCsrfToken] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get("error") === "1") setError(true)
    fetch("/api/auth/csrf").then(r => r.json()).then(d => setCsrfToken(d.csrfToken)).catch(() => {})
  }, [])

  // Jika sudah login, redirect sesuai role (hindari error Failed to fetch saat sudah auth)
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role
      if (role === "ADMIN" || role === "SUPER_ADMIN") router.replace("/admin")
      else router.replace("/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Sudah login sebagai {session?.user?.email} - mengalihkan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">UNAYSALE</h1>
          <p className="text-gray-500 mt-2">Masuk ke akun Anda</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            Email atau password salah
          </div>
        )}

        <form method="POST" action="/api/auth/callback/credentials" className="space-y-4">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value="/dashboard" />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email@contoh.com"
              required
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              required
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 w-full disabled:opacity-50"
          >
            Masuk
          </button>
        </form>


      </div>
    </div>
  )
}
