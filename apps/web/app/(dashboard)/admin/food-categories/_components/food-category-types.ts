export interface FoodCategoryFormData {
  name: string;
  order: number;
  isActive: boolean;
}

export const DEFAULT_CATEGORY_FORM: FoodCategoryFormData = {
  name: "",
  order: 0,
  isActive: true,
};
