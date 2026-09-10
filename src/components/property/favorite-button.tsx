"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface FavoriteButtonProps {
  propertyId: string;
  isFavorited?: boolean;
}

function FavoriteButton({
  propertyId,
  isFavorited = false,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const prev = favorited;
    setFavorited(!prev);
    setLoading(true);

    try {
      const method = prev ? "DELETE" : "POST";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(prev ? "Dihapus dari favorit" : "Ditambahkan ke favorit");
    } catch {
      setFavorited(prev);
      toast.error("Gagal memperbarui favorit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110"
      )}
      aria-label={favorited ? "Hapus dari favorit" : "Tambah ke favorit"}
    >
      <Heart
        className={cn(
          "h-4.5 w-4.5 transition-colors",
          favorited ? "text-red-500" : "text-gray-600"
        )}
        fill={favorited ? "currentColor" : "none"}
      />
    </button>
  );
}

export { FavoriteButton };
