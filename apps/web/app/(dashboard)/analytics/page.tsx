"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$12,480",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    description: "vs last month",
  },
  {
    title: "Active Users",
    value: "1,284",
    change: "+8.2%",
    trend: "up" as const,
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Conversion Rate",
    value: "3.6%",
    change: "+2.1%",
    trend: "up" as const,
    icon: TrendingUp,
    description: "vs last month",
  },
  {
    title: "Churn Rate",
    value: "1.2%",
    change: "-0.4%",
    trend: "down" as const,
    icon: Activity,
    description: "vs last month",
  },
];

const revenueData = [
  { month: "Jan", revenue: 4200, users: 180 },
  { month: "Feb", revenue: 5100, users: 220 },
  { month: "Mar", revenue: 4800, users: 250 },
  { month: "Apr", revenue: 6300, users: 310 },
  { month: "May", revenue: 7200, users: 380 },
  { month: "Jun", revenue: 8100, users: 420 },
  { month: "Jul", revenue: 7800, users: 460 },
  { month: "Aug", revenue: 9200, users: 510 },
  { month: "Sep", revenue: 10100, users: 580 },
  { month: "Oct", revenue: 11300, users: 640 },
  { month: "Nov", revenue: 10800, users: 700 },
  { month: "Dec", revenue: 12480, users: 780 },
];

const topPlans = [
  { name: "Pro Monthly", subscribers: 482, revenue: "$13,978", percent: 56 },
  { name: "Enterprise Monthly", subscribers: 124, revenue: "$12,276", percent: 35 },
  { name: "Pro Annual", subscribers: 67, revenue: "$6,432", percent: 9 },
];

const recentActivity = [
  { event: "New signup", user: "maria@example.com", plan: "Pro", time: "2 min ago" },
  { event: "Upgrade", user: "john@example.com", plan: "Enterprise", time: "15 min ago" },
  { event: "New signup", user: "alex@example.com", plan: "Free", time: "1 hour ago" },
  { event: "Cancellation", user: "sara@example.com", plan: "Pro", time: "2 hours ago" },
  { event: "New signup", user: "lucas@example.com", plan: "Pro", time: "3 hours ago" },
  { event: "Upgrade", user: "ana@example.com", plan: "Pro", time: "5 hours ago" },
];

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your key metrics and business performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
                  {stat.trend === "up" ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-green-500" />
                  )}
                  <span className="text-xs text-green-500">{stat.change}</span>
                  <span className="text-xs text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Revenue Chart */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-64">
                {revenueData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      ${(d.revenue / 1000).toFixed(1)}k
                    </span>
                    <div
                      className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors"
                      style={{
                        height: `${(d.revenue / maxRevenue) * 200}px`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {d.month}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Chart */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Active users over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-64">
                {revenueData.map((d) => {
                  const maxUsers = Math.max(
                    ...revenueData.map((r) => r.users)
                  );
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {d.users}
                      </span>
                      <div
                        className="w-full bg-blue-500/80 rounded-t hover:bg-blue-500 transition-colors"
                        style={{
                          height: `${(d.users / maxUsers) * 200}px`,
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Top Plans</CardTitle>
            <CardDescription>Most popular subscription plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPlans.map((plan) => (
              <div key={plan.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-muted-foreground">
                    {plan.subscribers} subscribers &middot; {plan.revenue}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${plan.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest subscription events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        activity.event === "Cancellation"
                          ? "destructive"
                          : activity.event === "Upgrade"
                            ? "default"
                            : "secondary"
                      }
                      className="w-24 justify-center text-xs"
                    >
                      {activity.event}
                    </Badge>
                    <span className="text-muted-foreground truncate max-w-[160px]">
                      {activity.user}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.plan}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
