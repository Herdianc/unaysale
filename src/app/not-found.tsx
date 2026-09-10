import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-text">
          Halaman Tidak Ditemukan
        </h2>
        <p className="mt-2 max-w-md text-text-light">
          Sepertinya halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-secondary"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
