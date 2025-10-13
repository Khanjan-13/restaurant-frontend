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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faRefresh,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faXmark,
  faUsers,
  faUser,
  faPercent,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faCrown,
  faGift,
  faUserPlus,
  faUserCheck,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";

function DashboardCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Form states for adding/editing customer
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    status: "Family",
    discount: 0,
    notes: "",
  });
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, selectedFilter, searchQuery, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const raw = response.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.customers)
              ? raw.customers
              : [];
        setCustomers(list);
        setFilteredCustomers(list);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.message || "Failed to fetch customers. Please try again.");
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      // Basic phone validation: exactly 10 digits
      const phoneDigits = String(customerForm.phone || "").trim();
      if (!/^\d{10}$/.test(phoneDigits)) {
        toast.error("Phone number must be exactly 10 digits");
        return;
      }

      // Safely decode JWT to extract user id for createdBy
      const parseJwt = (tkn) => {
        try {
          const base64Url = tkn.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          return JSON.parse(jsonPayload);
        } catch (err) {
          return {};
        }
      };
      const decoded = parseJwt(token);
      const localUser = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
      })();
      const createdBy = decoded?.id || decoded?.adminId || decoded?._id || localUser?._id || localUser?.id || null;

      // Normalize status for backend enum (family | friend | vip)
      const uiStatus = customerForm.status || "Family";
      const statusDb = (() => {
        const v = String(uiStatus).toLowerCase();
        if (v.startsWith("vip")) return "vip";
        if (v.startsWith("family")) return "family";
        if (v.startsWith("friend")) return "friend";
        return v;
      })();

      const customerData = {
        name: customerForm.name,
        phone: phoneDigits,
        email: customerForm.email,
        address: customerForm.address,
        notes: customerForm.notes,
        status: statusDb,
        discount: Number(customerForm.discount) || 0,
        createdBy,
      };

      const response = await axios.post(`${BASE_URL}/api/customers`, customerData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Customer added successfully!");
        setIsAddDialogOpen(false);
        resetCustomerForm();
        fetchCustomers();
      }
    } catch (err) {
      console.error("Error adding customer:", err);
      toast.error("Failed to add customer. Please try again.");
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      // Basic phone validation: exactly 10 digits
      const phoneDigits = String(customerForm.phone || "").trim();
      if (!/^\d{10}$/.test(phoneDigits)) {
        toast.error("Phone number must be exactly 10 digits");
        return;
      }

      // Normalize status for backend enum (family | friend | vip)
      const uiStatus = customerForm.status || "Family";
      const statusDb = (() => {
        const v = String(uiStatus).toLowerCase();
        if (v.startsWith("vip")) return "vip";
        if (v.startsWith("family")) return "family";
        if (v.startsWith("friend")) return "friend";
        return v;
      })();

      const customerData = {
        name: customerForm.name,
        phone: phoneDigits,
        email: customerForm.email,
        address: customerForm.address,
        notes: customerForm.notes,
        status: statusDb,
        discount: Number(customerForm.discount) || 0,
      };

      const response = await axios.put(`${BASE_URL}/api/customers/${editingCustomer._id}`, customerData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Customer updated successfully!");
        setIsEditDialogOpen(false);
        setEditingCustomer(null);
        resetCustomerForm();
        fetchCustomers();
      }
    } catch (err) {
      console.error("Error updating customer:", err);
      toast.error("Failed to update customer. Please try again.");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.delete(`${BASE_URL}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Customer deleted successfully!");
        fetchCustomers();
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error("Failed to delete customer. Please try again.");
    }
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      status: customer.status || "active",
      discount: customer.discount || 0,
      notes: customer.notes
    });
    setIsEditDialogOpen(true);
  };

  const resetCustomerForm = () => {
    setCustomerForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      status: "Family",
      discount: 0,
      notes: "",
    });
  };

  const filterCustomers = () => {
    const source = Array.isArray(customers) ? customers : [];
    let filtered = [...source];

    // Filter by status selector
    if (statusFilter) {
      const desired = String(statusFilter).toLowerCase();
      filtered = filtered.filter(customer => String(customer.status || "").toLowerCase() === desired);
    }

    // Extra filter (discount only)
    if (selectedFilter) {
      switch (selectedFilter) {
        case "discount":
          filtered = filtered.filter(customer => (customer.discount || 0) > 0);
          break;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((customer) =>
        customer.name?.toLowerCase().includes(q) ||
        customer.phone?.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(q) ||
        customer.status?.toLowerCase().includes(q)
      );
    }

    setFilteredCustomers(filtered);
  };

  const clearFilters = () => {
    setSelectedFilter("");
    setSearchQuery("");
    setStatusFilter("");
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      regular: { label: "Regular", icon: faUser, color: "bg-gray-100 text-gray-800" },
      family: { label: "Family", icon: faHeart, color: "bg-red-100 text-red-800" },
      friend: { label: "Friend", icon: faUserFriends, color: "bg-blue-100 text-blue-800" },
      vip: { label: "VIP", icon: faCrown, color: "bg-purple-100 text-purple-800" }
    };

    const config = categoryConfig[category] || categoryConfig.regular;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <FontAwesomeIcon icon={config.icon} className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === 'family') {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Family
        </Badge>
      );
    }
    if (s === 'friend') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Friend
        </Badge>
      );
    }
    if (s === 'vip') {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          VIP
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Unknown
      </Badge>
    );
  };

  // Calculate stats
  const stats = {
    total: filteredCustomers.length,
    family: filteredCustomers.filter(customer => String(customer.status || "").toLowerCase() === 'family').length,
    friend: filteredCustomers.filter(customer => String(customer.status || "").toLowerCase() === 'friend').length,
    vip: filteredCustomers.filter(customer => String(customer.status || "").toLowerCase() === 'vip').length,
    withDiscount: filteredCustomers.filter(customer => (customer.discount || 0) > 0).length
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Customer Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage customer details, status and discounts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCustomers}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faRefresh} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.total}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Family</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.family}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserCheck} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Friend</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.friend}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserTimes} className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">VIP</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.vip}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCrown} className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">With Discount</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.withDiscount}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faPercent} className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
                    />
                    <Input
                      placeholder="Search by name, phone, email, or status..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">All Status</option>
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="VIP">VIP</option>
                </select>

                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">All</option>
                  <option value="discount">With Discount</option>
                </select>

                {(selectedFilter || searchQuery || statusFilter) && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Customer Database</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredCustomers.length} of {customers.length} customers
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
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faRefresh} className="h-4 w-4 animate-spin" />
                            Loading customers...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <TableRow key={customer._id || index} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.address}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{customer.phone}</span>
                              </div>
                              {customer.email && (
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{customer.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(customer.discount || 0) > 0 ? (
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPercent} className="h-3 w-3 text-green-600" />
                                <span className="font-semibold text-green-600">{customer.discount}%</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No discount</span>
                            )}
                          </TableCell>
                          <TableCell>
                    {getStatusBadge(customer.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(customer)}
                              >
                                <FontAwesomeIcon icon={faEdit} className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCustomer(customer._id)}
                              >
                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No customers found</p>
                            {(selectedFilter || searchQuery || statusFilter) && (
                              <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear filters to see all customers
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

      {/* Customer Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information about this customer.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-medium">{selectedCustomer.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedCustomer.email || "Not provided"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{selectedCustomer.address || "Not provided"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedCustomer.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Discount</p>
                  <p className="text-sm font-semibold">
                    {(selectedCustomer.discount || 0) > 0 ? `${selectedCustomer.discount}%` : "No discount"}
                  </p>
                </div>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to the database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCustomer} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={customerForm.address}
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={customerForm.status}
                  onValueChange={(value) => setCustomerForm({...customerForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customerForm.discount}
                  onChange={(e) => setCustomerForm({...customerForm, discount: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            {/* No birthday or isActive in schema */}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={customerForm.notes}
                onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                placeholder="Additional notes about the customer"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Add Customer
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCustomer} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input
                  id="edit-phone"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={customerForm.address}
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={customerForm.status}
                  onValueChange={(value) => setCustomerForm({...customerForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-discount">Discount (%)</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customerForm.discount}
                  onChange={(e) => setCustomerForm({...customerForm, discount: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            {/* No birthday or isActive in schema */}

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={customerForm.notes}
                onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                placeholder="Additional notes about the customer"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Customer
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardCustomers; 