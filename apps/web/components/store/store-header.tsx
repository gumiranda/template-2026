"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { ShoppingBag, Search, Heart, ClipboardList } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { useCart } from "@/hooks/use-cart";

interface StoreHeaderProps {
  onOpenCart: () => void;
}

export function StoreHeader({ onOpenCart }: StoreHeaderProps) {
  const { isSignedIn } = useUser();
  const { totalItems } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/restaurants?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">FoodStore</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar restaurantes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {isSignedIn && (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/my-favorites">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/my-orders">
                  <ClipboardList className="h-5 w-5" />
                </Link>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onOpenCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs"
              >
                {totalItems}
              </Badge>
            )}
          </Button>

          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
