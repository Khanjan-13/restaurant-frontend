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
import axios from "axios";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faEye,
  faPrint,
  faXmark,
  faCalendar,
  faDownload,
  faRefresh,
  faShoppingCart,
  faIndianRupeeSign,
  faUsers,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { printOrderReceipt } from "@/utils/printUtils";

function DashboardOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Enhanced print function for reprinting existing orders
  const handlePrintOrder = async (order) => {
    try {
      toast.loading("Preparing receipt for printing...", { duration: 1000 });
      
      // If order doesn't have items, try to fetch detailed order data
      let orderData = order;
      if (!order.items || !Array.isArray(order.items)) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${BASE_URL}/dashboard/order/${order._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          orderData = { ...order, ...response.data };
        } catch (err) {
          console.warn("Could not fetch detailed order data, using available data:", err);
          // Create mock items from available data if needed
          orderData.items = [{
            itemName: "Order Items",
            itemPrice: order.totalAmount || 0,
            itemQuantity: 1,
            itemCategory: "Mixed"
          }];
        }
      }

      // Prepare the order data for printing
      const printData = {
        tokenNumber: order.tokenNumber,
        items: orderData.items || [{
          itemName: "Order Items",
          itemPrice: order.totalAmount || 0,
          itemQuantity: 1,
        }],
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        tableNumber: order.tableNumber,
        createdAt: order.createdAt,
      };

      // Use the imported print utility with reprint flag
      printOrderReceipt(printData, true);

    } catch (error) {
      console.error("Error printing receipt:", error);
      toast.error("Failed to print receipt. Please try again.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedFilter, searchQuery, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/dashboard/orderFetch`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        console.log("Fetched orders:", response.data.length, response.data);
        setOrders(response.data);
        setFilteredOrders(response.data);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to fetch orders. Please try again.");
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    console.log("Initial orders count:", orders.length);
    console.log("Date range filter:", dateRange);

    // Filter by payment method
    if (selectedFilter) {
      filtered = filtered.filter(
        (order) => order.paymentMethod?.toLowerCase() === selectedFilter.toLowerCase()
      );
      console.log("After payment filter:", filtered.length);
    }

    // Filter by search query (customer name, phone, or order number)
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerPhone?.includes(searchQuery) ||
          order.tokenNumber?.toString().includes(searchQuery)
      );
      console.log("After search filter:", filtered.length);
    }

    // Filter by date range (simplified for demo)
    if (dateRange !== "all") {
      const today = new Date();
      console.log("Today's date:", today.toDateString());

      switch (dateRange) {
        case "today":
          filtered = filtered.filter(order => {
            const createdAt = new Date(order.createdAt);
            const orderDateString = createdAt.toDateString();
            console.log("Order date:", orderDateString, "Today:", today.toDateString());
            return orderDateString === today.toDateString();
          });
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => {
            const createdAt = new Date(order.createdAt);
            return createdAt >= weekAgo;
          });
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => {
            const createdAt = new Date(order.createdAt);
            return createdAt >= monthAgo;
          });
          break;
      }
      console.log("After date filter:", filtered.length);
    }

    console.log("Final filtered orders:", filtered.length);
    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setSelectedFilter("");
    setSearchQuery("");
    setDateRange("all");
  };

  const getStatusBadge = (order) => {
    // Simple status logic based on available data
    if (order.paymentMethod) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Pending
      </Badge>
    );
  };

  const getOrderTypeDisplay = (order) => {
    if (order.tableNumber === "PICK UP") {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pickup
          </Badge>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Dine-in
        </Badge>
        <span className="text-sm text-muted-foreground">
          {order.tableNumber || "N/A"}
        </span>
      </div>
    );
  };

  // Calculate stats
  const stats = {
    total: filteredOrders.length,
    revenue: filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    avgOrder: filteredOrders.length > 0
      ? filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / filteredOrders.length
      : 0,
    completed: filteredOrders.filter(order => order.paymentMethod).length
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Orders Management</h1>
              <p className="text-sm text-muted-foreground">
                Track and manage all restaurant orders
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faRefresh} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.total}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold mt-2">₹{stats.revenue.toLocaleString()}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faIndianRupeeSign} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                    <h3 className="text-2xl font-bold mt-2">₹{Math.round(stats.avgOrder)}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.completed}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
                    />
                    <Input
                      placeholder="Search by customer name, phone, or order number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">All Payment Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>

                {(selectedFilter || searchQuery || dateRange !== "all") && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order History</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredOrders.length} of {orders.length} orders
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faRefresh} className="h-4 w-4 animate-spin" />
                            Loading orders...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length > 0 ? (
                      filteredOrders.map((order, index) => (
                        <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-mono">
                            #{order.tokenNumber || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customerName || "Anonymous"}</p>
                              {order.customerPhone && (
                                <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getOrderTypeDisplay(order)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {order.paymentMethod || "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{order.totalAmount || 0}
                          </TableCell>
                          <TableCell>{getStatusBadge(order)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <NavLink to={`/dashboard/view-orders/${order._id}`}>
                                  <FontAwesomeIcon icon={faEye} className="h-3 w-3 mr-1" />
                                  View
                                </NavLink>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePrintOrder(order)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <FontAwesomeIcon icon={faPrint} className="h-3 w-3 mr-1" />
                                Print
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FontAwesomeIcon icon={faShoppingCart} className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No orders found</p>
                            {(selectedFilter || searchQuery) && (
                              <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear filters to see all orders
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardOrders;
