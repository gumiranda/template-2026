"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import {
  BarChart3,
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
  ArrowUp,
  Activity,
  Zap,
} from "lucide-react";

const quickStats = [
  {
    title: "Monthly Revenue",
    value: "$12,480",
    change: "+12.5%",
    icon: CreditCard,
  },
  {
    title: "Active Users",
    value: "1,284",
    change: "+8.2%",
    icon: Users,
  },
  {
    title: "Conversion Rate",
    value: "3.6%",
    change: "+2.1%",
    icon: TrendingUp,
  },
  {
    title: "API Requests",
    value: "48.2K",
    change: "+15.3%",
    icon: Activity,
  },
];

const recentEvents = [
  { type: "signup", message: "New user signed up", time: "2 min ago" },
  { type: "upgrade", message: "User upgraded to Pro", time: "15 min ago" },
  { type: "signup", message: "New user signed up", time: "1 hour ago" },
  { type: "payment", message: "Payment received - $29.00", time: "2 hours ago" },
  { type: "signup", message: "New user signed up", time: "3 hours ago" },
];

export default function DashboardPage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{currentUser?.name ? `, ${currentUser.name}` : ""}!
          </p>
        </div>
        <Badge variant="secondary" className="capitalize gap-1">
          <Zap className="h-3 w-3" />
          {currentUser?.plan ?? "free"} plan
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">{stat.change}</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts for your workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/analytics" className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">View Analytics</p>
                  <p className="text-xs text-muted-foreground">Track your metrics and growth</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/settings" className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Manage Billing</p>
                  <p className="text-xs text-muted-foreground">Update plan and payment methods</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/settings" className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Team Settings</p>
                  <p className="text-xs text-muted-foreground">Manage members and permissions</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events from your application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    event.type === "upgrade" ? "bg-blue-500" :
                    event.type === "payment" ? "bg-green-500" :
                    "bg-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{event.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {event.time}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
              <Link href="/analytics">
                View all activity
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
