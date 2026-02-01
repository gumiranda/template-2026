"use client";

import { useState, useMemo, Dispatch, SetStateAction } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  RESTAURANT_STATUSES,
  getRestaurantStatus,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { AdminGuard } from "@/components/admin-guard";
import { StatCard } from "@/components/stat-card";

interface RestaurantForm {
  name: string;
  address: string;
  phone: string;
  description: string;
}

const initialFormState = {
  name: "",
  address: "",
  phone: "",
  description: "",
} satisfies RestaurantForm;

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<Id<"restaurants"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState<RestaurantForm>(initialFormState);
  const [editFormData, setEditFormData] = useState<RestaurantForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useQuery(api.restaurants.getOverviewStats);
  const restaurants = useQuery(api.restaurants.listAllWithStats);
  const createRestaurant = useMutation(api.restaurants.create);
  const updateRestaurant = useMutation(api.restaurants.update);

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

    setIsSubmitting(true);
    try {
      await createRestaurant({
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
      toast.success("Restaurant created successfully");
      setIsCreateModalOpen(false);
      setFormData(initialFormState);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create restaurant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (restaurant: NonNullable<typeof restaurants>[number]) => {
    setEditingRestaurantId(restaurant._id);
    setEditFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone ?? "",
      description: restaurant.description ?? "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditRestaurant = async () => {
    if (!editingRestaurantId) return;

    const validationError = validateRestaurantForm(editFormData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateRestaurant({
        id: editingRestaurantId,
        options: {
          name: editFormData.name.trim(),
          address: editFormData.address.trim(),
          phone: editFormData.phone.trim(),
          description: editFormData.description.trim(),
        },
      });
      toast.success("Restaurant updated successfully");
      setIsEditModalOpen(false);
      setEditingRestaurantId(null);
      setEditFormData(initialFormState);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update restaurant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageRestaurant = (restaurantId: Id<"restaurants">) => {
    router.push(`/admin/tenants/${restaurantId}`);
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    setFormData(initialFormState);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingRestaurantId(null);
    setEditFormData(initialFormState);
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
          onClick={() => setIsCreateModalOpen(true)}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                            <AvatarImage src={restaurant.logoUrl} />
                            <AvatarFallback className="bg-muted">
                              {restaurant.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{restaurant.name}</div>
                          </div>
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
        onOpenChange={setIsCreateModalOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateRestaurant}
        onCancel={handleCancelCreate}
        isSubmitting={isSubmitting}
      />

      <RestaurantFormDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        formData={editFormData}
        setFormData={setEditFormData}
        onSubmit={handleEditRestaurant}
        onCancel={handleCancelEdit}
        isSubmitting={isSubmitting}
        isEdit
      />
    </div>
  );
}
