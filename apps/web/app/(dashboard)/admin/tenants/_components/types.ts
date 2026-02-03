import type { Dispatch, SetStateAction } from "react";
import type { Id } from "@workspace/backend/_generated/dataModel";

export interface RestaurantWithStats {
  _id: Id<"restaurants">;
  name: string;
  address: string;
  phone?: string;
  description?: string;
  status?: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  totalRevenue: number;
  tablesCount: number;
}

export interface RestaurantForm {
  name: string;
  address: string;
  phone: string;
  description: string;
  logoFile: File | null;
  logoPreview: string | null;
}

export const initialFormData: RestaurantForm = {
  name: "",
  address: "",
  phone: "",
  description: "",
  logoFile: null,
  logoPreview: null,
};

export interface RestaurantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RestaurantForm;
  setFormData: Dispatch<SetStateAction<RestaurantForm>>;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}
