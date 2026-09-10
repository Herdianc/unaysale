import { Search } from "lucide-react";
import { PropertyCard } from "./property-card";
import { EmptyState } from "@/components/ui/empty-state";

interface PropertyGridProps {
  properties: any[];
  emptyMessage?: string;
}

function PropertyGrid({
  properties,
  emptyMessage = "Tidak ada properti ditemukan",
}: PropertyGridProps) {
  if (!properties || properties.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12" />}
        title="Tidak Ada Properti"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

export { PropertyGrid };
