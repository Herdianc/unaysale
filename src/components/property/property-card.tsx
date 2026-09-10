import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed, Bath, Maximize, Heart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./favorite-button";

interface PropertyCardProps {
  property: any;
  className?: string;
}

function PropertyCard({ property, className }: PropertyCardProps) {
  const primaryImage = property.images?.[0];
  const price = Number(property.price);
  const specs = property.specs;
  const area = specs?.landArea || specs?.buildingArea;

  const location = [
    property.village?.name,
    property.district?.name,
    property.district?.province?.name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/properti/${property.slug}`}
      className={cn(
        "group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-sm text-gray-400">Tidak ada gambar</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge variant={property.transactionType === "DIJUAL" ? "success" : "info"}>
            {property.transactionType === "DIJUAL" ? "Dijual" : "Disewa"}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <FavoriteButton propertyId={property.id} />
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <h3 className="text-sm sm:text-base font-semibold text-[#222222] line-clamp-2 leading-snug">
          {property.title}
        </h3>

        {location && (
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        <div className="text-base sm:text-lg font-bold text-[#1769AA]">
          {formatPrice(price)}
          {property.transactionType === "DISEWA" && (
            <span className="text-xs font-normal text-gray-500"> / tahun</span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
          {specs?.bedrooms != null && (
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-gray-400" />
              <span>{specs.bedrooms}</span>
            </div>
          )}
          {specs?.bathrooms != null && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-gray-400" />
              <span>{specs.bathrooms}</span>
            </div>
          )}
          {area != null && (
            <div className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5 text-gray-400" />
              <span>{area} m²</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {property.code && (
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-[#1769AA]/10 text-[#1769AA] font-semibold">
              {property.code}
            </span>
          )}
          {property.category?.name && (
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
              {property.category.name}
            </span>
          )}
          {property.certificate && (
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
              {property.certificate}
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-gray-50 text-xs sm:text-sm text-gray-500 truncate">
          {property.agent?.user?.name || property.user?.name || ""}
        </div>
      </div>
    </Link>
  );
}

export { PropertyCard };
