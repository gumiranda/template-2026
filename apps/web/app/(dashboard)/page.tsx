"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { LayoutDashboard, Users, Settings } from "lucide-react";

export default function DashboardPage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome{currentUser?.name ? `, ${currentUser.name}` : ""}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <CardTitle>Getting Started</CardTitle>
            </div>
            <CardDescription>
              This is a clean template with authentication and user management ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start building your application by adding new features and pages to this template.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>
              Manage users, roles, and permissions from the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Superadmins and CEOs can approve new users and manage existing ones.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Configuration</CardTitle>
            </div>
            <CardDescription>
              Built with Next.js, Convex, Clerk, and shadcn/ui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Customize the template to fit your needs. All configurations are ready for production.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
