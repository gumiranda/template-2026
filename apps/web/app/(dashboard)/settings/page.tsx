"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useTheme } from "next-themes";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import {
  User,
  CreditCard,
  Bell,
  Palette,
  Shield,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";

const plans = [
  { id: "free", name: "Free", price: "$0/mo", current: true },
  { id: "pro", name: "Pro", price: "$29/mo", current: false },
  { id: "enterprise", name: "Enterprise", price: "$99/mo", current: false },
];

export default function SettingsPage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your profile details managed through Clerk.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Name</Label>
                  <p className="font-medium">{user?.fullName ?? currentUser?.name ?? "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium">{user?.primaryEmailAddress?.emailAddress ?? "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Role</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <Badge variant="secondary" className="capitalize">
                      {currentUser?.role ?? "user"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge
                    variant={currentUser?.status === "approved" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {currentUser?.status ?? "pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => user?.openUserProfile?.()}
              >
                Edit Profile in Clerk
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  You are currently on the Free plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-semibold">Free Plan</p>
                    <p className="text-sm text-muted-foreground">
                      Basic features for small projects
                    </p>
                  </div>
                  <Badge>Current</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Upgrade your plan to unlock more features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-lg border p-4 text-center ${
                        plan.current ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-2xl font-bold mt-2">{plan.price}</p>
                      {plan.current ? (
                        <Button size="sm" className="mt-4 w-full" disabled>
                          <Check className="mr-1 h-4 w-4" />
                          Current
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="mt-4 w-full">
                          Upgrade
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  Your recent invoices and payment history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  No billing history yet. Upgrade to a paid plan to see invoices here.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates.
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and promotions.
                  </p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about security events on your account.
                  </p>
                </div>
                <Switch
                  checked={securityAlerts}
                  onCheckedChange={setSecurityAlerts}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-4 max-w-sm">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted ${
                      theme === "light" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <Sun className="h-6 w-6" />
                    <span className="text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted ${
                      theme === "dark" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <Moon className="h-6 w-6" />
                    <span className="text-sm">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted ${
                      theme === "system" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <Monitor className="h-6 w-6" />
                    <span className="text-sm">System</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
