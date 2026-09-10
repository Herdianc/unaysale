import { Bed, Bath, Maximize, Home, Car, Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertySpecsProps {
  specs: any;
  legalities?: any;
}

interface SpecItem {
  label: string;
  value: any;
  icon: React.ElementType;
}

function PropertySpecs({ specs, legalities }: PropertySpecsProps) {
  const items: SpecItem[] = [
    { label: "Luas Tanah", value: specs?.landArea, icon: Maximize },
    { label: "Luas Bangunan", value: specs?.buildingArea, icon: Building },
    { label: "Kamar Tidur", value: specs?.bedrooms, icon: Bed },
    { label: "Kamar Mandi", value: specs?.bathrooms, icon: Bath },
    { label: "Lantai", value: specs?.floors, icon: Home },
    { label: "Carport", value: specs?.carport, icon: Car },
    { label: "Garasi", value: specs?.garage, icon: Car },
  ];

  const visibleItems = items.filter(
    (item) => item.value != null && item.value !== ""
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-[#222222]">
        Spesifikasi
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#F7F8FA] px-4 py-3"
          >
            <item.icon className="h-5 w-5 flex-shrink-0 text-[#1769AA]" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-medium text-[#222222]">
                {item.label === "Luas Tanah" || item.label === "Luas Bangunan"
                  ? `${item.value} m²`
                  : item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {legalities && (
        <div className="mt-4 space-y-2">
          <h3 className="text-base font-semibold text-[#222222]">
            Legalitas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {legalities.certificate && (
              <div className="flex justify-between rounded-lg border border-gray-100 bg-[#F7F8FA] px-4 py-2.5">
                <span className="text-gray-500">Sertifikat</span>
                <span className="font-medium text-[#222222]">
                  {legalities.certificate}
                </span>
              </div>
            )}
            {legalities.isImb && (
              <div className="flex justify-between rounded-lg border border-gray-100 bg-[#F7F8FA] px-4 py-2.5">
                <span className="text-gray-500">IMB</span>
                <span className="font-medium text-[#222222]">Ada</span>
              </div>
            )}
            {legalities.isPbb && (
              <div className="flex justify-between rounded-lg border border-gray-100 bg-[#F7F8FA] px-4 py-2.5">
                <span className="text-gray-500">PBB</span>
                <span className="font-medium text-[#222222]">Lunas</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { PropertySpecs };
