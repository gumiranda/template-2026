"use client";

import { useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Loader2, Building2, Plus, Pencil, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { RestaurantFormDialogProps } from "./types";

export function RestaurantFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: RestaurantFormDialogProps) {
  const idPrefix = isEdit ? "edit-" : "";
  const TitleIcon = isEdit ? Pencil : Building2;
  const title = isEdit ? "Edit Restaurant" : "Create New Restaurant";
  const submitText = isEdit ? "Save Changes" : "Create Restaurant";
  const submittingText = isEdit ? "Saving..." : "Creating...";
  const SubmitIcon = isEdit ? Pencil : Plus;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, logoFile: file, logoPreview: preview }));
  };

  const handleRemoveLogo = () => {
    if (formData.logoPreview) {
      URL.revokeObjectURL(formData.logoPreview);
    }
    setFormData((prev) => ({ ...prev, logoFile: null, logoPreview: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100dvh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TitleIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {formData.logoPreview ? (
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.logoPreview} />
                    <AvatarFallback className="bg-muted">
                      {formData.name.slice(0, 2).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-1 -right-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-muted">
                    {formData.name.slice(0, 2).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-3 w-3" />
                  {formData.logoPreview ? "Change" : "Upload"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB. PNG, JPG, or WebP.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}name`}>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${idPrefix}name`}
              placeholder="Restaurant name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}address`}>
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${idPrefix}address`}
              placeholder="123 Main St, City, State"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}phone`}>Phone</Label>
            <Input
              id={`${idPrefix}phone`}
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}description`}>Description</Label>
            <Textarea
              id={`${idPrefix}description`}
              placeholder="A brief description of the restaurant..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submittingText}
              </>
            ) : (
              <>
                <SubmitIcon className="mr-2 h-4 w-4" />
                {submitText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
