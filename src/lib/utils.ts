import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    const miliar = price / 1_000_000_000
    const formatted = miliar % 1 === 0 ? miliar.toFixed(0) : miliar.toFixed(1).replace(/\.0$/, "")
    return `Rp ${formatted} Miliar`
  }

  if (price >= 1_000_000) {
    const juta = price / 1_000_000
    const formatted = juta % 1 === 0 ? juta.toFixed(0) : juta.toFixed(1).replace(/\.0$/, "")
    return `Rp ${formatted} Juta`
  }

  return `Rp ${price.toLocaleString("id-ID")}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d)
}

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateSlug(title: string): string {
  const now = Date.now().toString(36)
  const slug = slugifyText(title)
  return `${slug}-${now}`
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  let cleaned = phoneNumber.replace(/[^0-9]/g, "")
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1)
  }
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${cleaned}?text=${encoded}`
}
