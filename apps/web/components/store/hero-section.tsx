"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/restaurants?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="bg-gradient-to-b from-primary/5 to-background py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Seus restaurantes favoritos,
          <br />
          <span className="text-primary">na sua porta.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Peça delivery dos melhores restaurantes da cidade
        </p>
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-6 flex max-w-md gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar restaurantes ou pratos..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
      </div>
    </section>
  );
}
