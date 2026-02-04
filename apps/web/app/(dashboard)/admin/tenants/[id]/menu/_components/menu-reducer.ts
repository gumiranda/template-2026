import type { Id } from "@workspace/backend/_generated/dataModel";
import type { CategoryFormData } from "./menu-types";

interface EditingCategory {
  _id: Id<"menuCategories">;
  name: string;
  description?: string;
  icon?: string;
}

interface DeleteDialogState {
  type: "category" | "item";
  id: string;
  name: string;
}

export interface MenuDialogState {
  categoryDialog: {
    open: boolean;
    editing: EditingCategory | null;
    form: CategoryFormData;
  };
  deleteDialog: DeleteDialogState | null;
  draggedCategoryId: Id<"menuCategories"> | null;
}

export type MenuDialogAction =
  | { type: "OPEN_ADD_CATEGORY" }
  | { type: "OPEN_EDIT_CATEGORY"; payload: EditingCategory }
  | { type: "SET_CATEGORY_FORM"; payload: Partial<CategoryFormData> }
  | { type: "CLOSE_CATEGORY_DIALOG" }
  | { type: "OPEN_DELETE_DIALOG"; payload: DeleteDialogState }
  | { type: "CLOSE_DELETE_DIALOG" }
  | { type: "SET_DRAGGED_CATEGORY"; payload: Id<"menuCategories"> }
  | { type: "CLEAR_DRAGGED_CATEGORY" };

const EMPTY_FORM: CategoryFormData = { name: "", description: "", icon: "" };

export const menuDialogInitialState: MenuDialogState = {
  categoryDialog: { open: false, editing: null, form: EMPTY_FORM },
  deleteDialog: null,
  draggedCategoryId: null,
};

export function menuDialogReducer(
  state: MenuDialogState,
  action: MenuDialogAction
): MenuDialogState {
  switch (action.type) {
    case "OPEN_ADD_CATEGORY":
      return {
        ...state,
        categoryDialog: { open: true, editing: null, form: EMPTY_FORM },
      };
    case "OPEN_EDIT_CATEGORY":
      return {
        ...state,
        categoryDialog: {
          open: true,
          editing: action.payload,
          form: {
            name: action.payload.name,
            description: action.payload.description ?? "",
            icon: action.payload.icon ?? "",
          },
        },
      };
    case "SET_CATEGORY_FORM":
      return {
        ...state,
        categoryDialog: {
          ...state.categoryDialog,
          form: { ...state.categoryDialog.form, ...action.payload },
        },
      };
    case "CLOSE_CATEGORY_DIALOG":
      return {
        ...state,
        categoryDialog: { ...state.categoryDialog, open: false },
      };
    case "OPEN_DELETE_DIALOG":
      return { ...state, deleteDialog: action.payload };
    case "CLOSE_DELETE_DIALOG":
      return { ...state, deleteDialog: null };
    case "SET_DRAGGED_CATEGORY":
      return { ...state, draggedCategoryId: action.payload };
    case "CLEAR_DRAGGED_CATEGORY":
      return { ...state, draggedCategoryId: null };
  }
}
