import Link from "next/link";
import { Building2 } from "lucide-react";

const quickLinks = [
  { href: "/properti/dijual", label: "Dijual" },
  { href: "/properti/disewa", label: "Disewa" },
  { href: "/agen", label: "Cari Agen" },
  { href: "/pasang-properti", label: "Pasang Properti" },
];

const propertyTypes = [
  { href: "/properti?kategori=rumah", label: "Rumah" },
  { href: "/properti?kategori=apartemen", label: "Apartemen" },
  { href: "/properti?kategori=tanah", label: "Tanah" },
  { href: "/properti?kategori=ruko", label: "Ruko" },
  { href: "/properti?kategori=villa", label: "Villa" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-white">
      <div className="container-unaysale py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold text-white">UNAYSALE</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-300">
              Marketplace properti terpercaya di Indonesia. Temukan rumah,
              apartemen, tanah, dan properti lainnya untuk dijual atau disewa
              dengan mudah dan aman.
            </p>
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
                <a
                  href="mailto:info@unaysale.co.id"
                  className="transition-colors hover:text-white"
                >
                  info@unaysale.co.id
                </a>
              </li>
              <li>
                <span className="block text-xs text-gray-400">Telepon</span>
                <a
                  href="tel:+6221123456789"
                  className="transition-colors hover:text-white"
                >
                  +62 21 1234 56789
                </a>
              </li>
              <li>
                <span className="block text-xs text-gray-400">Alamat</span>
                <span>Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-unaysale flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} UNAYSALE. Hak cipta dilindungi.
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
