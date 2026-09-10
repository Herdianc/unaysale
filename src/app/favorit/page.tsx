import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PropertyGrid } from "@/components/property/property-grid";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Properti Favorit | UNAYSALE",
};

export default async function FavoritPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Properti Favorit</h1>
            <p className="text-gray-500 mb-6">
              Silakan login untuk menyimpan properti favorit
            </p>
            <Link href="/login">
              <Button>Masuk</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      property: {
        include: {
          category: true,
          district: { include: { city: { include: { province: true } } } },
          images: { take: 1 },
          user: { select: { name: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const properties = favorites.map((fav) => fav.property);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Properti Favorit</h1>
          <p className="text-gray-500 mt-1">
            {properties.length} properti tersimpan
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">Belum ada properti favorit</p>
            <Link href="/">
              <Button variant="outline">Jelajahi Properti</Button>
            </Link>
          </div>
        ) : (
          <PropertyGrid properties={properties} />
        )}
      </div>
    </div>
  );
}
