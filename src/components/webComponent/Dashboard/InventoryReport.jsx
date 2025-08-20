import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFilter,
  faSearch,
  faChartLine,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faBoxes,
  faWarehouse,
  faArrowUp,
  faArrowDown,
  faCalendar,
  faFileAlt,
  faPrint,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

function InventoryReport() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data for inventory reports
  const mockData = {
    // Stock level trends over time
    stockTrends: [
      { month: "Jan", totalItems: 120, lowStock: 8, outOfStock: 2 },
      { month: "Feb", totalItems: 135, lowStock: 12, outOfStock: 3 },
      { month: "Mar", totalItems: 142, lowStock: 15, outOfStock: 1 },
      { month: "Apr", totalItems: 138, lowStock: 10, outOfStock: 2 },
      { month: "May", totalItems: 150, lowStock: 18, outOfStock: 4 },
      { month: "Jun", totalItems: 145, lowStock: 14, outOfStock: 2 },
    ],

    // Category distribution
    categoryDistribution: [
      { name: "Vegetables", value: 25, color: "#10B981" },
      { name: "Meat", value: 20, color: "#EF4444" },
      { name: "Dairy", value: 15, color: "#F59E0B" },
      { name: "Grains", value: 18, color: "#8B5CF6" },
      { name: "Spices", value: 12, color: "#06B6D4" },
      { name: "Others", value: 10, color: "#6B7280" },
    ],

    // Top items by consumption
    topConsumedItems: [
      { name: "Tomatoes", category: "Vegetables", consumed: 45, remaining: 12, trend: "up" },
      { name: "Chicken", category: "Meat", consumed: 38, remaining: 8, trend: "up" },
      { name: "Rice", category: "Grains", consumed: 32, remaining: 25, trend: "down" },
      { name: "Onions", category: "Vegetables", consumed: 28, remaining: 15, trend: "up" },
      { name: "Milk", category: "Dairy", consumed: 25, remaining: 18, trend: "up" },
    ],

    // Low stock alerts
    lowStockAlerts: [
      { name: "Ginger", category: "Spices", currentStock: 2, minLevel: 5, daysLeft: 1 },
      { name: "Chicken", category: "Meat", currentStock: 8, minLevel: 10, daysLeft: 2 },
      { name: "Tomatoes", category: "Vegetables", currentStock: 12, minLevel: 15, daysLeft: 3 },
      { name: "Coriander", category: "Vegetables", currentStock: 3, minLevel: 8, daysLeft: 1 },
      { name: "Butter", category: "Dairy", currentStock: 5, minLevel: 12, daysLeft: 2 },
    ],

    // Value analysis
    valueAnalysis: [
      { category: "Meat", totalValue: 45000, avgCost: 320, items: 15 },
      { category: "Vegetables", totalValue: 28000, avgCost: 45, items: 25 },
      { category: "Dairy", totalValue: 22000, avgCost: 180, items: 12 },
      { category: "Grains", totalValue: 35000, avgCost: 85, items: 18 },
      { category: "Spices", totalValue: 15000, avgCost: 120, items: 10 },
    ],

    // Recent activities
    recentActivities: [
      { action: "Stock Added", item: "Chicken", quantity: 20, date: "2024-01-15", user: "Admin" },
      { action: "Stock Used", item: "Tomatoes", quantity: 15, date: "2024-01-14", user: "Chef" },
      { action: "Low Stock Alert", item: "Ginger", quantity: 2, date: "2024-01-14", user: "System" },
      { action: "Stock Added", item: "Rice", quantity: 50, date: "2024-01-13", user: "Admin" },
      { action: "Stock Used", item: "Onions", quantity: 8, date: "2024-01-13", user: "Chef" },
    ],
  };

  const getTrendIcon = (trend) => {
    return trend === "up" ? (
      <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3 text-green-600" />
    ) : (
      <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3 text-red-600" />
    );
  };

  const getStatusBadge = (daysLeft) => {
    if (daysLeft <= 1) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3 mr-1" />
          Critical
        </Badge>
      );
    } else if (daysLeft <= 3) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3 mr-1" />
          Low
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
          Normal
        </Badge>
      );
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Inventory Reports</h1>
              <p className="text-sm text-muted-foreground">
                Analytics and insights for inventory management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <FontAwesomeIcon icon={faPrint} className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <h3 className="text-2xl font-bold mt-2">145</h3>
                    <p className="text-xs text-green-600 mt-1">+5% from last month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBoxes} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                    <h3 className="text-2xl font-bold mt-2">14</h3>
                    <p className="text-xs text-yellow-600 mt-1">3 critical alerts</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <h3 className="text-2xl font-bold mt-2">₹145,000</h3>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categories</p>
                    <h3 className="text-2xl font-bold mt-2">6</h3>
                    <p className="text-xs text-blue-600 mt-1">Well organized</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faWarehouse} className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Trends Chart */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Stock Level Trends</CardTitle>
                <p className="text-sm text-muted-foreground">Monthly inventory levels</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockData.stockTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalItems" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Total Items"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lowStock" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Low Stock"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outOfStock" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Out of Stock"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">Items by category</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockData.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Consumed Items */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Top Consumed Items</CardTitle>
                <p className="text-sm text-muted-foreground">Most used items this month</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.topConsumedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.consumed} used</p>
                          {getTrendIcon(item.trend)}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.remaining} remaining</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
                <p className="text-sm text-muted-foreground">Items needing restocking</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.lowStockAlerts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.currentStock}/{item.minLevel}</p>
                          {getStatusBadge(item.daysLeft)}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.daysLeft} days left</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Value Analysis Table */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Value Analysis by Category</CardTitle>
              <p className="text-sm text-muted-foreground">Financial breakdown of inventory</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Average Cost</TableHead>
                      <TableHead>Items Count</TableHead>
                      <TableHead>Value per Item</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockData.valueAnalysis.map((category, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {category.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">₹{category.totalValue.toLocaleString()}</TableCell>
                        <TableCell>₹{category.avgCost}</TableCell>
                        <TableCell>{category.items}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{Math.round(category.totalValue / category.items).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <p className="text-sm text-muted-foreground">Latest inventory transactions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.action.includes('Added') ? 'bg-green-100' : 
                        activity.action.includes('Used') ? 'bg-blue-100' : 'bg-yellow-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={activity.action.includes('Added') ? faArrowUp : 
                                activity.action.includes('Used') ? faArrowDown : faExclamationTriangle} 
                          className={`h-4 w-4 ${
                            activity.action.includes('Added') ? 'text-green-600' : 
                            activity.action.includes('Used') ? 'text-blue-600' : 'text-yellow-600'
                          }`} 
                        />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.item}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{activity.quantity} units</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                      <p className="text-xs text-muted-foreground">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InventoryReport; 