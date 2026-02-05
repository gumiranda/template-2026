"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useMenuItemFormContext } from "./context";

export function BasicInfoSection() {
  const {
    name,
    setName,
    price,
    setPrice,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    categories,
  } = useMenuItemFormContext();

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h2 className="font-semibold">Basic Information</h2>

        <div className="space-y-2">
          <Label htmlFor="item-name">Item Name</Label>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grilled Salmon"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item-price">Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="item-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-desc">Description</Label>
          <Textarea
            id="item-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the dish"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
