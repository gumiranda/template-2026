import { ShoppingBag } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="border-t bg-muted/50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            <span>FoodStore &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Feito com Next.js, Convex e Clerk
          </p>
        </div>
      </div>
    </footer>
  );
}
