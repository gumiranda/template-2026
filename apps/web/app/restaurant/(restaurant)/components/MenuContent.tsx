"use client";

import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useRestaurantSelection } from "@/hooks/use-restaurant-selection";
import {
  RestaurantEmptyState,
  RestaurantSelectorButtons,
} from "./RestaurantSelector";
import { Card, CardContent } from "@workspace/ui/components/card";

interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  categoryId: Id<"menuCategories">;
}

interface MenuCategory {
  _id: Id<"menuCategories">;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  items: MenuItem[];
}

export default function MenuContent({
  selectedRestaurantIdProps,
}: { selectedRestaurantIdProps?: Id<"restaurants"> } = {}) {
  const { selectedRestaurantId, setSelectedRestaurantId, restaurants } =
    useRestaurantSelection();
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemLoading, setIsItemLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const effectiveRestaurantId =
    selectedRestaurantId ?? selectedRestaurantIdProps ?? null;

  const menu = useQuery(
    api.menu.getMenuByRestaurant,
    effectiveRestaurantId ? { restaurantId: effectiveRestaurantId } : "skip"
  ) as MenuCategory[] | undefined;

  const createItem = useMutation(api.menu.createItem);
  const createCategory = useMutation(api.menu.createCategory);
  const updateItemStatus = useMutation(api.menu.updateItemStatus);

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    imageUrl: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    order: 0,
  });

  const handleCreateItem = async () => {
    if (!effectiveRestaurantId || !itemForm.categoryId) return;

    setIsItemLoading(true);
    try {
      await createItem({
        restaurantId: effectiveRestaurantId,
        categoryId: itemForm.categoryId as Id<"menuCategories">,
        name: itemForm.name,
        description: itemForm.description || undefined,
        price: Number(itemForm.price),
        imageUrl: itemForm.imageUrl || undefined,
      });

      toast.success("Item criado com sucesso!");
      setIsItemDialogOpen(false);
      setItemForm({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        imageUrl: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar item"
      );
    } finally {
      setIsItemLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!effectiveRestaurantId) return;

    setIsCategoryLoading(true);
    try {
      await createCategory({
        restaurantId: effectiveRestaurantId,
        ...categoryForm,
      });

      toast.success("Categoria criada com sucesso!");
      setIsCategoryDialogOpen(false);
      setCategoryForm({ name: "", description: "", order: 0 });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar categoria"
      );
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleToggleItemStatus = async (
    itemId: Id<"menuItems">,
    currentStatus: boolean
  ) => {
    try {
      await updateItemStatus({
        itemId,
        isActive: !currentStatus,
      });
      toast.success(
        currentStatus ? "Item desativado" : "Item ativado"
      );
    } catch (error) {
      toast.error("Erro ao atualizar status do item");
    }
  };

  const filteredMenu = useMemo(() => {
    if (!menu) return [];

    let filtered = menu;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (category) => category._id === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.items.length > 0);
    }

    return filtered;
  }, [menu, selectedCategory, searchQuery]);

  const isLoading = effectiveRestaurantId && menu === undefined;

  const categories = [
    { id: "all", name: "Todos" },
    ...(menu?.map((cat) => ({ id: cat._id, name: cat.name })) || []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Configuração do Cardápio</h1>
          </div>
          <Dialog
            open={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
                <DialogDescription>
                  Adicione uma nova categoria ao cardápio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Nome</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    placeholder="Nome da categoria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Descrição</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descrição (opcional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-order">Ordem</Label>
                  <Input
                    id="category-order"
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <Button
                  onClick={handleCreateCategory}
                  className="w-full"
                  disabled={isCategoryLoading || !categoryForm.name}
                >
                  {isCategoryLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Criar Categoria
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Restaurant Selector */}
        <div className="px-6 pb-3">
          <RestaurantSelectorButtons
            restaurants={restaurants}
            selectedRestaurantId={effectiveRestaurantId}
            onSelect={setSelectedRestaurantId}
          />
        </div>

        {/* Search Bar */}
        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar item no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 rounded-full"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-24">
        {!effectiveRestaurantId && (
          <RestaurantEmptyState message="Selecione um restaurante para gerenciar o cardápio" />
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {effectiveRestaurantId && menu && (
          <div className="space-y-6">
            {filteredMenu.map((category) => (
              <div key={category._id}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold">{category.name}</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {category.items.length} itens
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <Card
                      key={item._id}
                      className={`transition-opacity ${
                        !item.isActive ? "opacity-60" : ""
                      }`}
                    >
                      <CardContent className="flex items-center gap-4 py-4">
                        {/* Item Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              Sem foto
                            </div>
                          )}
                          {!item.isActive && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Esgotado
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-primary mt-1">
                            R$ {item.price.toFixed(2).replace(".", ",")}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() =>
                              handleToggleItemStatus(item._id, item.isActive)
                            }
                            className="data-[state=checked]:bg-primary"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {category.items.length === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground text-sm">
                          Nenhum item nesta categoria
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ))}

            {filteredMenu.length === 0 && searchQuery && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-sm">
                    Nenhum item encontrado para "{searchQuery}"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {effectiveRestaurantId && (
        <div className="fixed bottom-6 left-6 right-6 z-50">
          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 rounded-full text-base font-medium shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Item</DialogTitle>
                <DialogDescription>
                  Adicione um novo item ao cardápio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Nome</Label>
                  <Input
                    id="item-name"
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, name: e.target.value })
                    }
                    placeholder="Nome do item"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-category">Categoria</Label>
                  <Select
                    value={itemForm.categoryId}
                    onValueChange={(value) =>
                      setItemForm({ ...itemForm, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {menu?.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price">Preço</Label>
                  <Input
                    id="item-price"
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-description">Descrição</Label>
                  <Textarea
                    id="item-description"
                    value={itemForm.description}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descrição do item (opcional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-image">URL da Imagem</Label>
                  <Input
                    id="item-image"
                    value={itemForm.imageUrl}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, imageUrl: e.target.value })
                    }
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <Button
                  onClick={handleCreateItem}
                  disabled={
                    !itemForm.categoryId || !itemForm.name || isItemLoading
                  }
                  className="w-full"
                >
                  {isItemLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Criar Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
