"use client";

import { useReducer, useMemo, useRef, Dispatch, SetStateAction } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Loader2,
  Building2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Users,
  DollarSign,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  RESTAURANT_STATUSES,
  getRestaurantStatus,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { AdminGuard } from "@/components/admin-guard";
import { StatCard } from "@/components/stat-card";
import { useUploadFile } from "@/hooks/use-upload-file";

interface RestaurantForm {
  name: string;
  address: string;
  phone: string;
  description: string;
  logoFile: File | null;
  logoPreview: string | null;
}

const initialFormData: RestaurantForm = {
  name: "",
  address: "",
  phone: "",
  description: "",
  logoFile: null,
  logoPreview: null,
};

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
  | { type: "SET_FORM_DATA"; payload: RestaurantForm }
  | { type: "SET_EDIT_FORM_DATA"; payload: RestaurantForm }
  | { type: "SET_CREATE_SUBMITTING"; payload: boolean }
  | { type: "SET_EDIT_SUBMITTING"; payload: boolean };

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
    case "SET_FORM_DATA":
      return { ...state, formData: action.payload };
    case "SET_EDIT_FORM_DATA":
      return { ...state, editFormData: action.payload };
    case "SET_CREATE_SUBMITTING":
      return { ...state, isCreateSubmitting: action.payload };
    case "SET_EDIT_SUBMITTING":
      return { ...state, isEditSubmitting: action.payload };
    default:
      return state;
  }
}

function validateRestaurantForm(form: RestaurantForm): string | null {
  if (!form.name.trim()) return "Restaurant name is required";
  if (!form.address.trim()) return "Address is required";
  return null;
}

interface RestaurantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RestaurantForm;
  setFormData: Dispatch<SetStateAction<RestaurantForm>>;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

function RestaurantFormDialog({
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
      <DialogContent className="sm:max-w-[500px]">
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
                setFormData((prev) => ({ ...prev, description: e.target.value }))
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
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
          >
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

export default function TenantOverviewPage() {
  return (
    <AdminGuard>
      {() => <TenantOverviewContent />}
    </AdminGuard>
  );
}

function TenantOverviewContent() {
  const router = useRouter();
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
  } = state;

  const stats = useQuery(api.restaurants.getOverviewStats);
  const restaurants = useQuery(api.restaurants.listAllWithStats);
  const createRestaurant = useMutation(api.restaurants.create);
  const updateRestaurant = useMutation(api.restaurants.update);
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

  const handleOpenEditModal = (restaurant: NonNullable<typeof restaurants>[number]) => {
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

  const handleManageRestaurant = (restaurantId: Id<"restaurants">) => {
    router.push(`/admin/tenants/${restaurantId}`);
  };

  const handleCancelCreate = () => {
    dispatch({ type: "CLOSE_CREATE_MODAL" });
  };

  const handleCancelEdit = () => {
    dispatch({ type: "CLOSE_EDIT_MODAL" });
  };

  const setFormData: Dispatch<SetStateAction<RestaurantForm>> = (action) => {
    const newData = typeof action === "function" ? action(formData) : action;
    dispatch({ type: "SET_FORM_DATA", payload: newData });
  };

  const setEditFormData: Dispatch<SetStateAction<RestaurantForm>> = (action) => {
    const newData = typeof action === "function" ? action(editFormData) : action;
    dispatch({ type: "SET_EDIT_FORM_DATA", payload: newData });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <div className="grid gap-4 md:grid-cols-3">
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

      <Card>
        <CardContent className="pt-6">
          {restaurants === undefined ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRestaurants?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No restaurants found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first restaurant to get started"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants?.map((restaurant) => {
                  const status = getRestaurantStatus(restaurant.status);
                  const StatusIcon = status.icon;

                  return (
                    <TableRow key={restaurant._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={restaurant.logoUrl ?? undefined} />
                            <AvatarFallback className="bg-muted">
                              {restaurant.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{restaurant.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${status.textColor} border-current`}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(restaurant.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(restaurant)}
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageRestaurant(restaurant._id)}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Manage
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
