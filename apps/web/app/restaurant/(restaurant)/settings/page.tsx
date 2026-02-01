"use client";

import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useMutation, useQuery } from "convex/react";
import { Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useRestaurantSelection } from "@/hooks/use-restaurant-selection";
import { RestaurantSelectorButtons, RestaurantEmptyState } from "../components/RestaurantSelector";

export default function RestaurantSettingsPage() {
  const { selectedRestaurantId, setSelectedRestaurantId, restaurants } =
    useRestaurantSelection();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
  });

  const restaurant = useQuery(
    api.restaurants.get,
    selectedRestaurantId ? { id: selectedRestaurantId } : "skip"
  );

  const updateRestaurant = useMutation(api.restaurants.update);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone || "",
        description: restaurant.description || "",
      });
    }
  }, [restaurant]);

  const handleSave = async () => {
    if (!selectedRestaurantId) return;

    setIsSaving(true);
    try {
      await updateRestaurant({
        id: selectedRestaurantId,
        options: {
          name: formData.name,
          address: formData.address,
          phone: formData.phone || "",
          description: formData.description || "",
        },
      });

      toast.success("Restaurant updated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update restaurant");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = selectedRestaurantId && restaurant === undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage restaurant information</p>
        </div>
        <div className="flex gap-2">
          <RestaurantSelectorButtons
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurantId}
            onSelect={setSelectedRestaurantId}
          />
        </div>
      </div>

      {!selectedRestaurantId && (
        <RestaurantEmptyState message="Select a restaurant to manage" />
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedRestaurantId && restaurant && (
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Restaurant name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contact phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of restaurant"
              />
            </div>

            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
