import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIndianRupeeSign,
  faListDots,
  faUsers,
  faCalculator,
  faClock,
  faChartLine,
  faEye,
  faUtensils,
  faShoppingCart,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

// Sample data - in real app this would come from API
const revenueData = [
  { name: "Jan", revenue: 45000, orders: 240 },
  { name: "Feb", revenue: 52000, orders: 280 },
  { name: "Mar", revenue: 48000, orders: 260 },
  { name: "Apr", revenue: 61000, orders: 320 },
  { name: "May", revenue: 55000, orders: 290 },
  { name: "Jun", revenue: 67000, orders: 350 },
  { name: "Jul", revenue: 71000, orders: 380 },
];

const orderTypeData = [
  { name: "Dine-in", value: 65, color: "hsl(var(--primary))" },
  { name: "Pickup", value: 25, color: "hsl(var(--secondary))" },
  { name: "Delivery", value: 10, color: "hsl(var(--accent))" },
];

const topItems = [
  { name: "Butter Chicken", orders: 145, revenue: 8700 },
  { name: "Biryani", orders: 132, revenue: 7920 },
  { name: "Paneer Tikka", orders: 98, revenue: 4900 },
  { name: "Naan", orders: 87, revenue: 2610 },
  { name: "Dal Makhani", orders: 76, revenue: 3040 },
];

const recentOrders = [
  { id: "ORD-2024-001", customer: "Rahul Sharma", table: "Table 12", amount: 1250, status: "completed", time: "2 min ago" },
  { id: "ORD-2024-002", customer: "Priya Patel", table: "Pickup", amount: 890, status: "preparing", time: "5 min ago" },
  { id: "ORD-2024-003", customer: "Amit Kumar", table: "Table 8", amount: 2100, status: "served", time: "8 min ago" },
  { id: "ORD-2024-004", customer: "Sneha Gupta", table: "Table 15", amount: 1650, status: "completed", time: "12 min ago" },
];

function DashboardHome() {
  const [timeRange, setTimeRange] = useState("today");

  const stats = [
    {
      title: "Today's Revenue",
      value: "₹45,231",
      change: "+20.1%",
      changeType: "positive",
      icon: faIndianRupeeSign,
      description: "from yesterday"
    },
    {
      title: "Orders Today",
      value: "234",
      change: "+12.5%",
      changeType: "positive",
      icon: faShoppingCart,
      description: "from yesterday"
    },
    {
      title: "Active Tables",
      value: "18/24",
      change: "75%",
      changeType: "neutral",
      icon: faUtensils,
      description: "occupancy rate"
    },
    {
      title: "Avg Order Value",
      value: "₹193",
      change: "+5.2%",
      changeType: "positive",
      icon: faCalculator,
      description: "from last week"
    },
  ];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed": return "default";
      case "preparing": return "secondary";
      case "served": return "outline";
      default: return "secondary";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "preparing": return "text-orange-600";
      case "served": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        <span className={`text-xs font-medium ${
                          stat.changeType === "positive" ? "text-green-600" : 
                          stat.changeType === "negative" ? "text-red-600" : 
                          "text-muted-foreground"
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FontAwesomeIcon icon={stat.icon} className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-4 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Revenue Trend</CardTitle>
                    <p className="text-sm text-muted-foreground">Monthly revenue and order count</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Types Pie Chart */}
            <Card className="lg:col-span-3 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">By order type</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {orderTypeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tables and Orders Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Menu Items */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Top Selling Items</CardTitle>
                <p className="text-sm text-muted-foreground">Most popular items today</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{item.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                    <p className="text-sm text-muted-foreground">Latest customer orders</p>
                  </div>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{order.customer}</p>
                          <span className="text-sm text-muted-foreground">{order.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{order.table}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                            <span className="font-semibold">₹{order.amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
                  <span className="text-sm">Add Order</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FontAwesomeIcon icon={faUtensils} className="h-5 w-5" />
                  <span className="text-sm">Manage Tables</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FontAwesomeIcon icon={faListDots} className="h-5 w-5" />
                  <span className="text-sm">View Menu</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
                  <span className="text-sm">Staff Schedule</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
