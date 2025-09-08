import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  Tooltip,
  ResponsiveContainer,
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
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";

// Revenue trend chart removed in favor of live total revenue display

const orderTypeData = [
  { name: "Dine-in", value: 65, color: "#10b981" },
  { name: "Pickup", value: 25, color: "#059669" },
  { name: "Delivery", value: 10, color: "#047857" },
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
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("today");
  const [orderStats, setOrderStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch order stats from API
  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/order-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrderStats(response.data);
      } catch (error) {
        console.error("Error fetching order stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, [timeRange]);
  // Calculate stats based on API data
  const stats = [
    {
      title: "Total Revenue",
      value: `₹${orderStats.totalRevenue?.toLocaleString() || 0}`,
      change: "0%",
      changeType: "neutral",
      icon: faIndianRupeeSign,
      description: "total revenue"
    },
    {
      title: "Total Orders",
      value: orderStats.totalOrders?.toString() || "0",
      change: "0%",
      changeType: "neutral",
      icon: faShoppingCart,
      description: "total orders"
    },
    {
      title: "Active Customers",
      value: "100", //Static right now, will be dynamic later
      change: "0%",
      changeType: "neutral",
      icon: faUtensils,
      description: "occupancy rate"
    },
    {
      title: "Avg Order Value",
      value: `₹${Math.round(orderStats.averageOrderValue || 0)}`,
      change: "0%",
      changeType: "neutral",
      icon: faCalculator,
      description: "average per order"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Main Content */}
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
          <div className="flex h-24 md:h-32 items-center justify-between p-4 md:p-6">
            <div className="py-2 md:py-5">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
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
        <div className="p-4 md:p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card key={index} className="group border border-gray-200 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-4 md:p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stat.changeType === "positive" ? "text-green-700 bg-green-100" : 
                          stat.changeType === "negative" ? "text-red-700 bg-red-100" : 
                          "text-gray-600 bg-gray-100"
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <FontAwesomeIcon icon={stat.icon} className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 md:gap-6">
            {/* Total Revenue (Live) */}
            <Card className="lg:col-span-4 border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">Total Revenue</CardTitle>
                    <p className="text-sm text-gray-600">Live total revenue from orders</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all">
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/60">
                  <div>
                    <p className="text-sm text-gray-600">Current Total</p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-3xl md:text-4xl font-extrabold text-green-700">
                        ₹{(orderStats.totalRevenue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="text-lg font-semibold text-gray-800">{orderStats.totalOrders || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Avg Order Value</p>
                    <p className="text-lg font-semibold text-gray-800">₹{Math.round(orderStats.averageOrderValue || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Types Pie Chart */}
            <Card className="lg:col-span-3 border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800">Order Distribution</CardTitle>
                <p className="text-sm text-gray-600">By order type</p>
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
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"> */}
            {/* Top Menu Items */}
            {/* <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800">Top Selling Items</CardTitle>
                <p className="text-sm text-gray-600">Most popular items today</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200/50 hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200/50 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">₹{item.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Recent Orders */}
            {/* <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">Recent Orders</CardTitle>
                    <p className="text-sm text-gray-600">Latest customer orders</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50/30 transition-all duration-300 border border-transparent hover:border-green-200/50">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800">{order.customer}</p>
                          <span className="text-sm text-gray-500">{order.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">{order.table}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                              {order.status}
                            </Badge>
                            <span className="font-bold text-green-700">₹{order.amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          {/* </div> */}

          {/* Quick Actions */}
          <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Quick Actions</CardTitle>
              <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Button onClick={() => navigate("/dashboard/orders")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faPlus} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">View Order</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/tables")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faUtensils} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Manage Tables</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/menu")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faListDots} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">View Menu</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/staff")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faUsers} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Staff Schedule</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/staff/attendance")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faClock} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Attendance</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/staff/salary")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faCalculator} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Staff Salary</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/inventory-manage")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Inventory</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/customers")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faUserFriends} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Customers</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/backup")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faDatabase} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Backup & Restore</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/inventory-report")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Inventory Report</span>
                </Button>
                <Button onClick={() => navigate("/dashboard/menu-manage")} variant="outline" className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300 group">
                  <FontAwesomeIcon icon={faListDots} className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Manage Menu</span>
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
