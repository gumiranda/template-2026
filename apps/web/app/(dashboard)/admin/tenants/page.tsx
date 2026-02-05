"use client";

import { useReducer, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { RESTAURANT_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { AdminGuard } from "@/components/admin-guard";
import { StatCard } from "@/components/stat-card";
import { useUploadFile } from "@/hooks/use-upload-file";
import type { RestaurantForm, RestaurantWithStats, RestaurantFormUpdater } from "./_components/types";
import { initialFormData } from "./_components/types";
import { RestaurantFormDialog } from "./_components/restaurant-form-dialog";
import { DeleteRestaurantDialog } from "./_components/delete-restaurant-dialog";
import { DesktopRestaurantTable } from "./_components/desktop-restaurant-table";
import { TenantStatsMobile } from "./_components/tenant-stats-mobile";
import { MobileRestaurantList } from "./_components/mobile-restaurant-list";

interface PageState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  editingRestaurantId: Id<"restaurants"> | null;
  searchQuery: string;
  statusFilter: string;
  formData: RestaurantForm;
  editFormData: RestaurantForm;
  isCreateSubmitting: boolean;
  isEditSubmitting: boolean;
  deleteRestaurantId: Id<"restaurants"> | null;
  isDeleting: boolean;
}

type PageAction =
  | { type: "OPEN_CREATE_MODAL" }
  | { type: "CLOSE_CREATE_MODAL" }
  | { type: "CREATE_SUCCESS" }
  | { type: "OPEN_EDIT_MODAL"; payload: { id: Id<"restaurants">; data: RestaurantForm } }
  | { type: "CLOSE_EDIT_MODAL" }
  | { type: "EDIT_SUCCESS" }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: string }
  | { type: "UPDATE_FORM_DATA"; payload: RestaurantFormUpdater }
  | { type: "UPDATE_EDIT_FORM_DATA"; payload: RestaurantFormUpdater }
  | { type: "SET_CREATE_SUBMITTING"; payload: boolean }
  | { type: "SET_EDIT_SUBMITTING"; payload: boolean }
  | { type: "SET_DELETE_RESTAURANT_ID"; payload: Id<"restaurants"> | null }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "DELETE_SUCCESS" };

const initialState: PageState = {
  isCreateModalOpen: false,
  isEditModalOpen: false,
  editingRestaurantId: null,
  searchQuery: "",
  statusFilter: "all",
  formData: initialFormData,
  editFormData: initialFormData,
  isCreateSubmitting: false,
  isEditSubmitting: false,
  deleteRestaurantId: null,
  isDeleting: false,
};

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case "OPEN_CREATE_MODAL":
      return { ...state, isCreateModalOpen: true };
    case "CLOSE_CREATE_MODAL":
      if (state.isCreateSubmitting) return state;
      return { ...state, isCreateModalOpen: false, formData: initialFormData };
    case "CREATE_SUCCESS":
      return { ...state, isCreateModalOpen: false, formData: initialFormData, isCreateSubmitting: false };
    case "OPEN_EDIT_MODAL":
      return {
        ...state,
        isEditModalOpen: true,
        editingRestaurantId: action.payload.id,
        editFormData: action.payload.data,
      };
    case "CLOSE_EDIT_MODAL":
      if (state.isEditSubmitting) return state;
      return {
        ...state,
        isEditModalOpen: false,
        editingRestaurantId: null,
        editFormData: initialFormData,
      };
    case "EDIT_SUCCESS":
      return {
        ...state,
        isEditModalOpen: false,
        editingRestaurantId: null,
        editFormData: initialFormData,
        isEditSubmitting: false,
      };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload };
    case "UPDATE_FORM_DATA": {
      const newData = typeof action.payload === "function"
        ? action.payload(state.formData)
        : action.payload;
      return { ...state, formData: newData };
    }
    case "UPDATE_EDIT_FORM_DATA": {
      const newData = typeof action.payload === "function"
        ? action.payload(state.editFormData)
        : action.payload;
      return { ...state, editFormData: newData };
    }
    case "SET_CREATE_SUBMITTING":
      return { ...state, isCreateSubmitting: action.payload };
    case "SET_EDIT_SUBMITTING":
      return { ...state, isEditSubmitting: action.payload };
    case "SET_DELETE_RESTAURANT_ID":
      return { ...state, deleteRestaurantId: action.payload };
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload };
    case "DELETE_SUCCESS":
      return { ...state, deleteRestaurantId: null, isDeleting: false };
    default:
      return state;
  }
}

function validateRestaurantForm(form: RestaurantForm): string | null {
  if (!form.name.trim()) return "Restaurant name is required";
  if (!form.address.trim()) return "Address is required";
  return null;
}

function computeOnlinePercentage(stats: { activeRestaurants: number; totalRestaurants: number } | null | undefined): number {
  if (!stats || stats.totalRestaurants === 0) return 0;
  return Math.round((stats.activeRestaurants / stats.totalRestaurants) * 100);
}

export default function TenantOverviewPage() {
  return (
    <AdminGuard>
      {() => <TenantOverviewContent />}
    </AdminGuard>
  );
}

function TenantOverviewContent() {
  const [state, dispatch] = useReducer(pageReducer, initialState);
  const {
    isCreateModalOpen,
    isEditModalOpen,
    editingRestaurantId,
    searchQuery,
    statusFilter,
    formData,
    editFormData,
    isCreateSubmitting,
    isEditSubmitting,
    deleteRestaurantId,
    isDeleting,
  } = state;

  const stats = useQuery(api.restaurants.getOverviewStats);
  const restaurants = useQuery(api.restaurants.listAllWithStats);
  const createRestaurant = useMutation(api.restaurants.create);
  const updateRestaurant = useMutation(api.restaurants.update);
  const deleteRestaurantMutation = useMutation(api.restaurants.deleteRestaurant);
  const { uploadFile } = useUploadFile();

  const filteredRestaurants = useMemo(() => {
    return restaurants?.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (restaurant.status ?? "active") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, searchQuery, statusFilter]);

  const handleCreateRestaurant = async () => {
    const validationError = validateRestaurantForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    dispatch({ type: "SET_CREATE_SUBMITTING", payload: true });
    try {
      let logoId: Id<"_storage"> | undefined;
      if (formData.logoFile) {
        logoId = await uploadFile(formData.logoFile);
      }

      await createRestaurant({
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim() || undefined,
        description: formData.description.trim() || undefined,
        logoId,
      });
      toast.success("Restaurant created successfully");
      dispatch({ type: "CREATE_SUCCESS" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create restaurant"
      );
      dispatch({ type: "SET_CREATE_SUBMITTING", payload: false });
    }
  };

  const handleOpenEditModal = (restaurant: RestaurantWithStats) => {
    dispatch({
      type: "OPEN_EDIT_MODAL",
      payload: {
        id: restaurant._id,
        data: {
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone ?? "",
          description: restaurant.description ?? "",
          logoFile: null,
          logoPreview: restaurant.logoUrl ?? null,
        },
      },
    });
  };

  const handleEditRestaurant = async () => {
    if (!editingRestaurantId) return;

    const validationError = validateRestaurantForm(editFormData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    dispatch({ type: "SET_EDIT_SUBMITTING", payload: true });
    try {
      let logoId: Id<"_storage"> | undefined;
      if (editFormData.logoFile) {
        logoId = await uploadFile(editFormData.logoFile);
      }

      await updateRestaurant({
        id: editingRestaurantId,
        options: {
          name: editFormData.name.trim(),
          address: editFormData.address.trim(),
          phone: editFormData.phone.trim(),
          description: editFormData.description.trim(),
          logoId,
        },
      });
      toast.success("Restaurant updated successfully");
      dispatch({ type: "EDIT_SUCCESS" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update restaurant"
      );
      dispatch({ type: "SET_EDIT_SUBMITTING", payload: false });
    }
  };

  const handleCancelCreate = () => {
    dispatch({ type: "CLOSE_CREATE_MODAL" });
  };

  const handleCancelEdit = () => {
    dispatch({ type: "CLOSE_EDIT_MODAL" });
  };

  const handleDeleteRestaurant = async () => {
    if (!deleteRestaurantId) return;

    dispatch({ type: "SET_DELETING", payload: true });
    try {
      await deleteRestaurantMutation({ id: deleteRestaurantId });
      toast.success("Restaurante deletado com sucesso");
      dispatch({ type: "DELETE_SUCCESS" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao deletar restaurante"
      );
      dispatch({ type: "SET_DELETING", payload: false });
    }
  };

  const handleOpenDeleteModal = (restaurant: RestaurantWithStats) => {
    dispatch({ type: "SET_DELETE_RESTAURANT_ID", payload: restaurant._id });
  };

  const setFormData = useCallback((action: RestaurantFormUpdater) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: action });
  }, []);

  const setEditFormData = useCallback((action: RestaurantFormUpdater) => {
    dispatch({ type: "UPDATE_EDIT_FORM_DATA", payload: action });
  }, []);

  const onlinePercentage = computeOnlinePercentage(stats);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* MOBILE HEADER */}
      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Meus Restaurantes</h1>
          <Badge variant="secondary">Admin Mode</Badge>
        </div>
        <p className="text-muted-foreground">
          Gerencie suas franquias e unidades ativas.
        </p>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenant Overview</h1>
          <p className="text-muted-foreground">
            Manage all restaurants
          </p>
        </div>
        <Button
          onClick={() => dispatch({ type: "OPEN_CREATE_MODAL" })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Restaurant
        </Button>
      </div>

      {/* MOBILE STATS */}
      <div className="md:hidden">
        <TenantStatsMobile
          totalRestaurants={stats?.totalRestaurants ?? 0}
          totalTables={stats?.totalTables ?? 0}
          onlinePercentage={onlinePercentage}
          isLoading={stats === undefined}
        />
      </div>

      {/* DESKTOP STATS */}
      <div className="hidden md:grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Restaurants"
          value={stats?.totalRestaurants ?? 0}
          subtext={`${stats?.activeRestaurants ?? 0} active`}
          icon={Building2}
          isLoading={stats === undefined}
        />
        <StatCard
          title="Active Sessions"
          value={stats?.activeSessions ?? 0}
          subtext="Current active sessions"
          icon={Users}
          isLoading={stats === undefined}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          subtext="From all completed orders"
          icon={DollarSign}
          isLoading={stats === undefined}
        />
      </div>

      {/* MOBILE SEARCH */}
      <div className="md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar unidade..."
            value={searchQuery}
            onChange={(e) => dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      {/* DESKTOP SEARCH + FILTER */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search restaurants..."
                    value={searchQuery}
                    onChange={(e) => dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={(value) => dispatch({ type: "SET_STATUS_FILTER", payload: value })}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {RESTAURANT_STATUSES.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden">
        <MobileRestaurantList
          restaurants={restaurants}
          filteredRestaurants={filteredRestaurants}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block">
        <DesktopRestaurantTable
          restaurants={restaurants}
          filteredRestaurants={filteredRestaurants}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      </div>

      {/* MOBILE FLOATING BUTTON */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <Button
          className="w-full"
          onClick={() => dispatch({ type: "OPEN_CREATE_MODAL" })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Novo Restaurante
        </Button>
      </div>

      {/* DIALOGS (shared) */}
      <RestaurantFormDialog
        open={isCreateModalOpen}
        onOpenChange={(open) => dispatch({ type: open ? "OPEN_CREATE_MODAL" : "CLOSE_CREATE_MODAL" })}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateRestaurant}
        onCancel={handleCancelCreate}
        isSubmitting={isCreateSubmitting}
      />

      <RestaurantFormDialog
        open={isEditModalOpen}
        onOpenChange={(open) => { if (!open) dispatch({ type: "CLOSE_EDIT_MODAL" }); }}
        formData={editFormData}
        setFormData={setEditFormData}
        onSubmit={handleEditRestaurant}
        onCancel={handleCancelEdit}
        isSubmitting={isEditSubmitting}
        isEdit
      />

      <DeleteRestaurantDialog
        open={deleteRestaurantId !== null}
        onOpenChange={(open) =>
          !open && dispatch({ type: "SET_DELETE_RESTAURANT_ID", payload: null })
        }
        onConfirm={handleDeleteRestaurant}
        restaurantName={
          restaurants?.find((r) => r._id === deleteRestaurantId)?.name ?? ""
        }
        isDeleting={isDeleting}
      />
    </div>
  );
}
