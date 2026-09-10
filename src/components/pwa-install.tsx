"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // cek apakah sudah installed (standalone)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // jangan tampilkan lagi jika user sudah dismiss dalam 7 hari
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // fallback: tampilkan banner manual untuk iOS yang tidak support beforeinstallprompt
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS && !standalone) {
      // tampilkan setelah 3 detik untuk iOS
      setTimeout(() => setShowBanner(true), 3000);
    }

    // register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShowBanner(false);
      setDeferredPrompt(null);
    } else {
      // iOS manual instruction
      alert(
        "Untuk install di iPhone:\n1. Tap tombol Share (kotak + panah) di Safari\n2. Pilih 'Tambah ke Layar Utama' / Add to Home Screen"
      );
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  };

  if (isStandalone || !showBanner) return null;

  return (
    <div className="fixed bottom-[72px] md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-sm z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex gap-3 items-start animate-in slide-in-from-bottom-2">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Download className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">Install UNAYSALE</p>
        <p className="text-xs text-gray-600 mt-0.5">
          Pasang di HP untuk akses lebih cepat & bisa dibuka offline.
        </p>
        <button
          onClick={handleInstall}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          {deferredPrompt ? "Pasang Sekarang" : "Cara Install di iPhone"}
        </button>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
        aria-label="Tutup"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
