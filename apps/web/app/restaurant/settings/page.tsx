"use client";

import { useMemo, useState } from "react";

import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function RestaurantSettingsPage() {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const restaurants = useQuery(api.restaurants.list);
  const restaurant = useQuery(
    api.restaurants.get,
    selectedRestaurantId ? { id: selectedRestaurantId as any } : "skip"
  );

  const updateRestaurant = useMutation(api.restaurants.update);

  const formData = useMemo(() => {
    if (!restaurant) {
      return {
        name: "",
        address: "",
        phone: "",
        description: "",
      };
    }

    return {
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone || "",
      description: restaurant.description || "",
    };
  }, [restaurant]);

  const handleSave = async () => {
    if (!selectedRestaurantId) return;

    await updateRestaurant({
      id: selectedRestaurantId as any,
      name: formData.name,
      address: formData.address,
      phone: formData.phone || undefined,
      description: formData.description || undefined,
    });

    toast.success("Restaurant updated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage restaurant information
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
        </div>
      </div>

      {!selectedRestaurantId && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select a restaurant to manage
            </p>
          </CardContent>
        </Card>
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
                onChange={(e) => {
                  if (!restaurant) return;
                  updateRestaurant({
                    id: restaurant._id,
                    name: e.target.value,
                    address: restaurant.address,
                    phone: restaurant.phone,
                    description: restaurant.description,
                  });
                }}
                placeholder="Restaurant name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => {
                  if (!restaurant) return;
                  updateRestaurant({
                    id: restaurant._id,
                    name: restaurant.name,
                    address: e.target.value,
                    phone: restaurant.phone,
                    description: restaurant.description,
                  });
                }}
                placeholder="Full address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  if (!restaurant) return;
                  updateRestaurant({
                    id: restaurant._id,
                    name: restaurant.name,
                    address: restaurant.address,
                    phone: e.target.value,
                    description: restaurant.description,
                  });
                }}
                placeholder="Contact phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  if (!restaurant) return;
                  updateRestaurant({
                    id: restaurant._id,
                    name: restaurant.name,
                    address: restaurant.address,
                    phone: restaurant.phone,
                    description: e.target.value,
                  });
                }}
                placeholder="Brief description of restaurant"
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
