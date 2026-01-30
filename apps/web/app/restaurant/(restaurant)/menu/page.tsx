"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Plus, Trash2, Edit, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Id } from "@workspace/backend/_generated/dataModel";

export default function MenuPage({selectedRestaurantIdProps}:{selectedRestaurantIdProps:Id<"restaurants">}) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<Id<"restaurants"> | null>(selectedRestaurantIdProps);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const restaurants = useQuery(api.restaurants.list);
  const menu = useQuery(
    api.menu.getMenuByRestaurant,
    selectedRestaurantId
      ? { restaurantId: selectedRestaurantId as any }
      : "skip"
  );

  const createCategory = useMutation(api.menu.createCategory);
  const createItem = useMutation(api.menu.createItem);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    order: 0,
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
  });

  const handleCreateCategory = async () => {
    if (!selectedRestaurantId) return;

    await createCategory({
      restaurantId: selectedRestaurantId as any,
      ...categoryForm,
    });

    toast.success("Category created!");
    setIsCategoryDialogOpen(false);
    setCategoryForm({ name: "", description: "", order: 0 });
  };

  const handleCreateItem = async () => {
    if (!selectedRestaurantId || !itemForm.categoryId) return;

    await createItem({
      restaurantId: selectedRestaurantId as any,
      categoryId: itemForm.categoryId as any,
      name: itemForm.name,
      description: itemForm.description || undefined,
      price: Number(itemForm.price),
    });

    toast.success("Item created!");
    setIsItemDialogOpen(false);
    setItemForm({ name: "", description: "", price: 0, categoryId: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu</h1>
          <p className="text-muted-foreground">
            Manage restaurant menu
          </p>
        </div>
        <div className="flex gap-2">
           {restaurants &&
            restaurants.map((restaurant) => (
              <Button
                key={restaurant._id}
                variant={
                  selectedRestaurantId === restaurant._id ? "default" : "outline"
                }
                onClick={() => setSelectedRestaurantId(restaurant._id)}
              >
                {restaurant.name}
              </Button>
            ))} 
          <Dialog
            open={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Add a new menu category
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Name</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    placeholder="Category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">
                    Description
                  </Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Category description (optional)"
                  />
                </div>
                <Button onClick={handleCreateCategory} className="w-full">
                  Create Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isItemDialogOpen}
            onOpenChange={setIsItemDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Menu Item</DialogTitle>
                <DialogDescription>
                  Add a new item to the menu
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Name</Label>
                  <Input
                    id="item-name"
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, name: e.target.value })
                    }
                    placeholder="Item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price">Price</Label>
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
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select
                    value={itemForm.categoryId}
                    onValueChange={(value) =>
                      setItemForm({ ...itemForm, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {menu?.map((category) => (
                        <SelectItem
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    value={itemForm.description}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Item description (optional)"
                  />
                </div>
                <Button
                  onClick={handleCreateItem}
                  disabled={!itemForm.categoryId}
                  className="w-full"
                >
                  Create Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedRestaurantId && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select a restaurant to manage menu
            </p>
          </CardContent>
        </Card>
      )}

      {selectedRestaurantId &&
        menu &&
        menu.map((category) => (
          <Card key={category._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {category.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-3 border-b last:border-0 bg-white p-10px rounded-sm hover:scale-101 transition-transform duration-600"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary">
                        R$ {item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {category.items.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No items in this category
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
