"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

const quickLinks = [
  { href: "/properti/dijual", label: "Dijual" },
  { href: "/properti/disewa", label: "Disewa" },
  { href: "/properti", label: "Semua Properti" },
  { href: "/favorit", label: "Favorit" },
];

const propertyTypes = [
  { href: "/properti?kategori=rumah", label: "Rumah" },
  { href: "/properti?kategori=apartemen", label: "Apartemen" },
  { href: "/properti?kategori=tanah", label: "Tanah" },
  { href: "/properti?kategori=ruko", label: "Ruko" },
  { href: "/properti?kategori=villa", label: "Villa" },
];

const FALLBACK = {
  siteName: "UNAYSALE",
  email: "info@unaysale.co.id",
  phone: "+62 21 1234 56789",
  address: "Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190",
  description:
    "Marketplace properti terpercaya di Indonesia. Temukan rumah, apartemen, tanah, dan properti lainnya untuk dijual atau disewa dengan mudah dan aman.",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [setting, setSetting] = useState(FALLBACK);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setSetting({
            siteName: d.siteName || FALLBACK.siteName,
            email: d.email || FALLBACK.email,
            phone: d.phone || FALLBACK.phone,
            address: d.address || FALLBACK.address,
            description: d.description || FALLBACK.description,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-secondary text-white">
      <div className="container-unaysale py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold text-white">{setting.siteName}</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-300">{setting.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Tautan Cepat
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Properti Berdasarkan Jenis
            </h3>
            <ul className="space-y-2.5">
              {propertyTypes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Hubungi Kami
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <span className="block text-xs text-gray-400">Email</span>
                <a href={`mailto:${setting.email}`} className="transition-colors hover:text-white">
                  {setting.email}
                </a>
              </li>
              <li>
                <span className="block text-xs text-gray-400">Telepon</span>
                <a
                  href={`tel:${setting.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {setting.phone}
                </a>
              </li>
              <li>
                <span className="block text-xs text-gray-400">Alamat</span>
                <span>{setting.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-unaysale flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} {setting.siteName}. Hak cipta dilindungi.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/kebijakan-privasi" className="transition-colors hover:text-white">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat-ketentuan" className="transition-colors hover:text-white">
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
