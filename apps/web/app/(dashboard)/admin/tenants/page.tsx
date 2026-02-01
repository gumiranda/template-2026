"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
  Download,
  Settings,
  ExternalLink,
  Users,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
  RESTAURANT_STATUSES,
  getRestaurantStatus,
} from "@/lib/constants";
import { AdminGuard } from "@/components/admin-guard";

interface CreateRestaurantForm {
  name: string;
  subdomain: string;
  address: string;
  phone: string;
  description: string;
}

const initialFormState: CreateRestaurantForm = {
  name: "",
  subdomain: "",
  address: "",
  phone: "",
  description: "",
};

export default function TenantOverviewPage() {
  return (
    <AdminGuard>
      {({ currentUser, isSuperadmin }) => (
        <TenantOverviewContent
          currentUser={currentUser}
          isSuperadmin={isSuperadmin}
        />
      )}
    </AdminGuard>
  );
}

function TenantOverviewContent({
  currentUser,
  isSuperadmin,
}: {
  currentUser: { _id: Id<"users"> };
  isSuperadmin: boolean;
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState<CreateRestaurantForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useQuery(api.restaurants.getOverviewStats);
  const restaurants = useQuery(api.restaurants.listAllWithStats);
  const createRestaurant = useMutation(api.restaurants.create);

  const filteredRestaurants = restaurants?.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.subdomain?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (restaurant.status ?? "active") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateRestaurant = async () => {
    if (!formData.name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRestaurant({
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim() || undefined,
        description: formData.description.trim() || undefined,
        subdomain: formData.subdomain.trim() || undefined,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenant Overview</h1>
          <p className="text-muted-foreground">
            Manage all restaurants
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Restaurant
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats === undefined ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalRestaurants ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeRestaurants ?? 0} active
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats === undefined ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeSessions ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Current active sessions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats === undefined ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From all completed orders
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
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
                            {restaurant.subdomain && (
                              <div className="text-sm text-muted-foreground">
                                {restaurant.subdomain}.restaurantix.com
                              </div>
                            )}
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
                          <Button variant="outline" size="sm">
                            <Settings className="mr-1 h-3 w-3" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm">
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

      {/* Create Restaurant Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create New Restaurant
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Restaurant name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center">
                <Input
                  id="subdomain"
                  placeholder="my-restaurant"
                  value={formData.subdomain}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    }))
                  }
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                  .restaurantix.com
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
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
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData(initialFormState);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRestaurant}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Restaurant
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
