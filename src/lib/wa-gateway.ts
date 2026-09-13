// Kirim notifikasi WhatsApp via wa-gateway (whatsapp-web.js, self-hosted).
// Tidak pernah throw - kegagalan gateway tidak boleh menggagalkan alur utama.
export async function sendWaNotification(
  target: string,
  message: string
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const baseUrl = (
    process.env.WA_GATEWAY_URL || "http://localhost:3001"
  ).replace(/\/+$/, "")

  if (!target || !target.trim()) {
    return { ok: false, skipped: true, error: "Nomor tujuan kosong" }
  }

  try {
    const body: Record<string, string> = {
      target: target.trim(),
      message,
    }
    if (process.env.WA_GATEWAY_KEY) {
      body.key = process.env.WA_GATEWAY_KEY
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(`${baseUrl}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const data = await res.json().catch(() => null)
    if (res.ok && data?.status === "ok") {
      return { ok: true }
    }
    return { ok: false, error: data?.message || `Gateway HTTP ${res.status}` }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gateway tidak terjangkau",
    }
  }
}
