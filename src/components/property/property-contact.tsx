"use client";

import { useState } from "react";
import { Phone, MessageCircle, Send } from "lucide-react";
import { cn, formatPrice, getWhatsAppUrl } from "@/lib/utils";
import { siteConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface PropertyContactProps {
  property: any;
}

function PropertyContact({ property }: PropertyContactProps) {
  const price = Number(property.price);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const propertyTitle = property.title;
  const propertyCode = property.code ? `[${property.code}]` : "";
  const propertyPrice = formatPrice(price);
  const propertyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/properti/${property.slug}`
      : "";

  const whatsappMessage = `Halo, saya tertarik dengan properti ${propertyCode} "${propertyTitle}" seharga ${propertyPrice}.\n\n${propertyUrl}`;
  const whatsappNumber =
    property.agent?.whatsapp ||
    property.agent?.user?.phone ||
    property.user?.phone ||
    siteConfig.whatsapp;
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, whatsappMessage);

  const phone =
    property.agent?.user?.phone || property.user?.phone || siteConfig.phone;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertyId: property.id,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengirim");

      setFeedback({
        ok: true,
        text: `Pesan terkirim!${propertyCode ? ` Sebutkan kode ${propertyCode} saat menghubungi.` : ""}`,
      });
      toast.success("Pesan berhasil dikirim!");
      setForm({ name: "", phone: "", message: "" });
    } catch {
      setFeedback({ ok: false, text: "Gagal mengirim pesan. Silakan coba lagi." });
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <div className="text-sm text-gray-500">Hubungi Agen</div>

        <div className="flex gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="primary" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
          <a href={`tel:${phone}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Phone className="h-4 w-4" />
              Telepon
            </Button>
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#222222]">
            Kirim Pesan
          </h3>
          {property.code && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {property.code}
            </span>
          )}
        </div>
        {feedback && (
          <div
            className={`mb-3 rounded-lg px-3 py-2 text-sm ${
              feedback.ok
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {feedback.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            name="name"
            placeholder="Nama Lengkap"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Nomor Telepon / WhatsApp"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <Textarea
            name="message"
            placeholder={`Saya tertarik dengan "${propertyTitle}". Mohon info lebih lanjut.`}
            value={form.message}
            onChange={handleChange}
            rows={3}
          />
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            <Send className="h-4 w-4" />
            Kirim Pesan
          </Button>
        </form>
      </div>
    </div>
  );
}

export { PropertyContact };
