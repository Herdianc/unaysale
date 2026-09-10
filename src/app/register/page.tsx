"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validations";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || data.message || "";
        const details = data.details ? ` (${data.details})` : "";
        if (res.status === 409) {
          setGeneralError("Email sudah terdaftar. Gunakan email lain atau Masuk.");
          setErrors((prev) => ({ ...prev, email: "Email sudah terdaftar" }));
        } else if (msg.toLowerCase().includes("validation")) {
          setGeneralError(details || "Cek lagi form: " + (msg || "data tidak valid"));
        } else {
          setGeneralError((msg + details) || "Gagal mendaftar. Silakan coba lagi.");
        }
        return;
      }

      const csrfData = await fetch("/api/auth/csrf").then(r => r.json());
      
      const formData = new FormData();
      formData.append("csrfToken", csrfData.csrfToken);
      formData.append("email", form.email);
      formData.append("password", form.password);

      await fetch("/api/auth/callback/credentials", {
        method: "POST",
        body: formData,
        redirect: "manual",
      });

      window.location.href = "/";
    } catch {
      setGeneralError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">UNAYSALE</h1>
          <p className="text-gray-500 mt-2">Buat akun baru</p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Nama lengkap"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@contoh.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8, ada huruf besar & angka (contoh: Fathan123)"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
