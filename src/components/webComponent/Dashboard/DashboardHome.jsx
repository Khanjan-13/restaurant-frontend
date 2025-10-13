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

function DashboardHome() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("today");
  const [orderStats, setOrderStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [orderTypeData, setOrderTypeData] = useState([]); // [{name, value, color}]
  const [activeCustomers, setActiveCustomers] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

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
        // Optional fields from API
        if (Array.isArray(response.data?.orderTypeDistribution)) {
          // Expect [{name: 'Dine-in', value: 65, color?: '#hex'}]
          const palette = ["#10b981", "#059669", "#047857", "#16a34a", "#22c55e"];
          const dist = response.data.orderTypeDistribution.map((d, i) => ({
            name: d.name,
            value: Number(d.value) || 0,
            color: d.color || palette[i % palette.length],
          }));
          setOrderTypeData(dist);
        }
        if (typeof response.data?.activeCustomers === 'number') {
          setActiveCustomers(response.data.activeCustomers);
        }
      } catch (error) {
        console.error("Error fetching order stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, [timeRange]);

  // Fetch recent orders (optional endpoint)
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/recent-orders?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) setRecentOrders(res.data.slice(0, 10));
        else if (Array.isArray(res.data?.orders)) setRecentOrders(res.data.orders.slice(0, 10));
      } catch {
        // ignore if endpoint not present
      }
    };
    fetchRecent();
  }, [timeRange]);

  // Fetch active customers count from backend (separate endpoint)
  useEffect(() => {
    const fetchActiveCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        // Prefer dedicated endpoint if available
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Normalize to array per customers endpoint
        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.customers)
              ? raw.customers
              : [];
        setActiveCustomers(list.length);
      } catch (e) {
        // ignore if endpoint not present
      }
    };
    fetchActiveCustomers();
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
      value: activeCustomers != null ? String(activeCustomers) : "-",
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
                        {stat.change && stat.change !== "0%" && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            stat.changeType === "positive" ? "text-green-700 bg-green-100" : 
                            stat.changeType === "negative" ? "text-red-700 bg-red-100" : 
                            "text-gray-600 bg-gray-100"
                          }`}>
                            {stat.change}
                          </span>
                        )}
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

            {/* Order Types Pie Chart (dynamic if available) */}
            <Card className="lg:col-span-3 border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800">Order Distribution</CardTitle>
                <p className="text-sm text-gray-600">By order type</p>
              </CardHeader>
              <CardContent>
                {orderTypeData.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-sm text-gray-500">No distribution data</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders (dynamic if endpoint available) */}
          {recentOrders.length > 0 && (
            <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">Recent Orders</CardTitle>
                    <p className="text-sm text-gray-600">Latest customer orders</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order, index) => {
                    const customer = order.customer || order.customerName || "-";
                    const table = order.table || order.tableNumber || order.mode || "-";
                    const amount = order.amount ?? order.total ?? 0;
                    const status = (order.status || order.orderStatus || "").toString().toLowerCase();
                    const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : "";
                    return (
                      <div key={order.id || order._id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50/30 transition-all duration-300 border border-transparent hover:border-green-200/50">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-800">{customer}</p>
                            <span className="text-sm text-gray-500">{createdAt}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">{table}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusBadgeVariant(status)} className="text-xs capitalize">
                                {status || "-"}
                              </Badge>
                              <span className="font-bold text-green-700">₹{Number(amount).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

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
