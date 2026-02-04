"use client";

import { useReducer, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Loader2, Plus, Tags } from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";
import { useUploadFile } from "@/hooks/use-upload-file";
import { toast } from "sonner";
import { FoodCategoryCard } from "./_components/food-category-card";
import { FoodCategoryDialog } from "./_components/food-category-dialog";
import {
  DEFAULT_CATEGORY_FORM,
  type FoodCategoryFormData,
} from "./_components/food-category-types";

// ─── State ───────────────────────────────────────────────────────────────────

interface CategoriesState {
  dialogOpen: boolean;
  editingId: string | null;
  editingForm: FoodCategoryFormData;
  editingImageUrl: string | null;
  deleteId: string | null;
  deleteName: string;
}

type CategoriesAction =
  | { type: "OPEN_CREATE" }
  | {
      type: "OPEN_EDIT";
      id: string;
      form: FoodCategoryFormData;
      imageUrl: string | null;
    }
  | { type: "CLOSE_DIALOG" }
  | { type: "OPEN_DELETE"; id: string; name: string }
  | { type: "CLOSE_DELETE" };

function categoriesReducer(
  state: CategoriesState,
  action: CategoriesAction
): CategoriesState {
  switch (action.type) {
    case "OPEN_CREATE":
      return {
        ...state,
        dialogOpen: true,
        editingId: null,
        editingForm: DEFAULT_CATEGORY_FORM,
        editingImageUrl: null,
      };
    case "OPEN_EDIT":
      return {
        ...state,
        dialogOpen: true,
        editingId: action.id,
        editingForm: action.form,
        editingImageUrl: action.imageUrl,
      };
    case "CLOSE_DIALOG":
      return { ...state, dialogOpen: false };
    case "OPEN_DELETE":
      return { ...state, deleteId: action.id, deleteName: action.name };
    case "CLOSE_DELETE":
      return { ...state, deleteId: null, deleteName: "" };
  }
}

const INITIAL_STATE: CategoriesState = {
  dialogOpen: false,
  editingId: null,
  editingForm: DEFAULT_CATEGORY_FORM,
  editingImageUrl: null,
  deleteId: null,
  deleteName: "",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FoodCategoriesPage() {
  return (
    <AdminGuard>
      {() => <FoodCategoriesContent />}
    </AdminGuard>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

function FoodCategoriesContent() {
  const [state, dispatch] = useReducer(categoriesReducer, INITIAL_STATE);
  const categories = useQuery(api.foodCategories.listAllFoodCategories);
  const createCategory = useMutation(api.foodCategories.createFoodCategory);
  const updateCategory = useMutation(api.foodCategories.updateFoodCategory);
  const deleteCategory = useMutation(api.foodCategories.deleteFoodCategory);
  const { uploadFile, isUploading } = useUploadFile();

  const handleSubmit = useCallback(
    async (
      data: FoodCategoryFormData,
      imageId: Id<"_storage"> | undefined
    ): Promise<string> => {
      try {
        if (state.editingId) {
          await updateCategory({
            id: state.editingId as Id<"foodCategories">,
            name: data.name,
            imageId,
            order: data.order,
            isActive: data.isActive,
          });
          toast.success("Categoria atualizada com sucesso");
          return state.editingId;
        } else {
          const id = await createCategory({
            name: data.name,
            imageId,
            order: data.order,
          });
          toast.success("Categoria criada com sucesso");
          return id;
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao salvar categoria"
        );
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.editingId]
  );

  const handleDelete = useCallback(async () => {
    if (!state.deleteId) return;
    try {
      await deleteCategory({
        id: state.deleteId as Id<"foodCategories">,
      });
      toast.success("Categoria removida com sucesso");
      dispatch({ type: "CLOSE_DELETE" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao remover categoria"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.deleteId]);

  if (categories === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias de Comida</h1>
        <Button onClick={() => dispatch({ type: "OPEN_CREATE" })}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* List */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tags className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma categoria cadastrada</h3>
          <p className="text-muted-foreground">
            Crie categorias de comida para organizar os restaurantes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <FoodCategoryCard
              key={category._id}
              category={category}
              onEdit={() =>
                dispatch({
                  type: "OPEN_EDIT",
                  id: category._id,
                  form: {
                    name: category.name,
                    order: category.order,
                    isActive: category.isActive,
                  },
                  imageUrl: category.imageUrl,
                })
              }
              onDelete={() =>
                dispatch({
                  type: "OPEN_DELETE",
                  id: category._id,
                  name: category.name,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <FoodCategoryDialog
        open={state.dialogOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLOSE_DIALOG" });
        }}
        initialData={state.editingForm}
        existingImageUrl={state.editingImageUrl}
        editingId={state.editingId ?? undefined}
        onSubmit={handleSubmit}
        uploadFile={uploadFile}
        isUploading={isUploading}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={state.deleteId !== null}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLOSE_DELETE" });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a categoria &quot;
              {state.deleteName}&quot;? Todos os vinculos com restaurantes
              serao removidos. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
