"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Building2, Plus, Trash2, Edit, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminRestaurantsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const restaurants = useQuery(api.restaurants.list);
  const allUsers = useQuery(api.users.getAllUsers);
  const createRestaurant = useMutation(api.restaurants.create);
  const updateRestaurant = useMutation(api.restaurants.update);
  const deleteRestaurant = useMutation(api.restaurants.deleteRestaurant);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<Id<"restaurants"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
  });
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  const isSuperadmin = currentUser?.role === "superadmin";

  if (!currentUser || !isSuperadmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!selectedOwnerId) {
      toast.error("Please select a CEO/Owner");
      return;
    }

    setIsLoading(true);
    try {
      await createRestaurant({
        ...formData,
      });

      toast.success("Restaurant created!");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create restaurant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRestaurantId) return;

    setIsLoading(true);
    try {
      await updateRestaurant({
        id: editingRestaurantId,
        options: formData,
      });

      toast.success("Restaurant updated!");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update restaurant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: Id<"restaurants">) => {
    if (confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await deleteRestaurant({ id });
        toast.success("Restaurant deleted!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete restaurant");
      }
    }
  };

  const openCreateDialog = () => {
    setIsEditMode(false);
    setEditingRestaurantId(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (restaurant: { _id: Id<"restaurants">; name: string; address: string; phone?: string; description?: string }) => {
    setIsEditMode(true);
    setEditingRestaurantId(restaurant._id);
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone || "",
      description: restaurant.description || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      description: "",
    });
    setSelectedOwnerId("");
  };

  const ceos = allUsers?.filter(
    (user) => user.role === "ceo" || user.role === "superadmin"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">
            Manage all restaurants in the system
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Restaurant" : "New Restaurant"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update restaurant information"
                  : "Add a new restaurant to the system"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Restaurant name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Full address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Contact phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description"
                />
              </div>

              {!isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner / CEO</Label>
                  <Select
                    value={selectedOwnerId}
                    onValueChange={setSelectedOwnerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ceos?.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={isEditMode ? handleUpdate : handleCreate}
                  disabled={!formData.name || !formData.address || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Restaurants
          </CardTitle>
          <CardDescription>
            {restaurants?.length || 0} restaurant(s) in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {restaurants === undefined ? (
            <div className="flex justify-center py-8 ">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No restaurants found</p>
              <p className="text-sm">
                Create your first restaurant to get started
              </p>
            </div>
          ) : (
            <div className="flex gap-11 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                  onEdit={() => openEditDialog(restaurant)}
                  onDelete={() => handleDelete(restaurant._id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface RestaurantCardProps {
  restaurant: { _id: Id<"restaurants">; name: string; address: string; phone?: string; description?: string; ownerId: string };
  onEdit: () => void;
  onDelete: () => void;
}

function RestaurantCard({ restaurant, onEdit, onDelete }: RestaurantCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between ">
          <div className="flex-1">
            <CardTitle className="text-xl">
              {restaurant.name}
            </CardTitle>
            {restaurant.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {restaurant.description}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <p>{restaurant.address}</p>
          {restaurant.phone && (
            <p>Phone: {restaurant.phone}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>Owner ID: {restaurant.ownerId}</span>
        </div>
      </CardContent>
    </Card>
  );
}
