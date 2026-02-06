import Image from "next/image";
import Link from "next/link";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import { Plus, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { CategoryData, MenuItemData } from "./menu-types";

interface MobileProductsTabProps {
  selectedCategory: CategoryData | null;
  filteredItems: MenuItemData[];
  restaurantId: Id<"restaurants">;
  onToggleItemStatus: (itemId: Id<"menuItems">, isActive: boolean) => void;
}

export function MobileProductsTab({
  selectedCategory,
  filteredItems,
  restaurantId,
  onToggleItemStatus,
}: MobileProductsTabProps) {
  if (!selectedCategory) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UtensilsCrossed className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Selecione uma categoria na aba Categorias
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-semibold">{selectedCategory.name}</h2>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum item nesta categoria
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-md border">
          {filteredItems.map((item) => (
            <div key={item._id} className="flex items-center gap-3 px-3 py-3">
              <Link
                href={`/admin/tenants/${restaurantId}/menu/items/${item._id}/edit`}
                className="flex flex-1 items-center gap-3 min-w-0 transition-colors hover:opacity-80"
              >
                {item.imageUrl ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  )}
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </Link>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge variant={item.isActive ? "default" : "destructive"} className="text-[10px]">
                  {item.isActive ? "DISPONÍVEL" : "ESGOTADO"}
                </Badge>
                <Switch
                  checked={item.isActive}
                  onCheckedChange={(checked) => onToggleItemStatus(item._id, checked)}
                  className="scale-75"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Button asChild className="w-full">
        <Link href={`/admin/tenants/${restaurantId}/menu/items/new`}>
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Novo Prato
        </Link>
      </Button>
    </>
  );
}
