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
import { Switch } from "@/components/ui/switch";
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
  faUserFriends,
  faUserTie,
  faUser,
  faPercent,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faBirthdayCake,
  faStar,
  faCrown,
  faHeart,
  faGift,
  faUserPlus,
  faUserEdit,
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
  const [categoryFilter, setCategoryFilter] = useState("");
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
    birthday: "",
    category: "regular", // regular, family, friend, vip
    discountPercentage: 0,
    isActive: true,
    notes: ""
  });
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, selectedFilter, searchQuery, categoryFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/dashboard/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setCustomers(response.data);
        setFilteredCustomers(response.data);
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

      const customerData = {
        ...customerForm,
        discountPercentage: parseFloat(customerForm.discountPercentage)
      };

      const response = await axios.post(`${BASE_URL}/dashboard/customers`, customerData, {
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

      const customerData = {
        ...customerForm,
        discountPercentage: parseFloat(customerForm.discountPercentage)
      };

      const response = await axios.put(`${BASE_URL}/dashboard/customers/${editingCustomer._id}`, customerData, {
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

      const response = await axios.delete(`${BASE_URL}/dashboard/customers/${customerId}`, {
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
      birthday: customer.birthday,
      category: customer.category,
      discountPercentage: customer.discountPercentage,
      isActive: customer.isActive,
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
      birthday: "",
      category: "regular",
      discountPercentage: 0,
      isActive: true,
      notes: ""
    });
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(customer => customer.category === categoryFilter);
    }

    // Filter by status
    if (selectedFilter) {
      switch (selectedFilter) {
        case "active":
          filtered = filtered.filter(customer => customer.isActive);
          break;
        case "inactive":
          filtered = filtered.filter(customer => !customer.isActive);
          break;
        case "discount":
          filtered = filtered.filter(customer => customer.discountPercentage > 0);
          break;
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone?.includes(searchQuery) ||
          customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const clearFilters = () => {
    setSelectedFilter("");
    setSearchQuery("");
    setCategoryFilter("");
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

  const getStatusBadge = (customer) => {
    if (!customer.isActive) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <FontAwesomeIcon icon={faUserTimes} className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <FontAwesomeIcon icon={faUserCheck} className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  // Calculate stats
  const stats = {
    total: filteredCustomers.length,
    active: filteredCustomers.filter(customer => customer.isActive).length,
    family: filteredCustomers.filter(customer => customer.category === 'family').length,
    friends: filteredCustomers.filter(customer => customer.category === 'friend').length,
    vip: filteredCustomers.filter(customer => customer.category === 'vip').length,
    withDiscount: filteredCustomers.filter(customer => customer.discountPercentage > 0).length
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
                Manage customer details and discount preferences
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
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.active}</h3>
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
                    <p className="text-sm font-medium text-muted-foreground">Family</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.family}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faHeart} className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Friends</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.friends}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserFriends} className="h-6 w-6 text-blue-600" />
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
                      placeholder="Search by name, phone, email, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="discount">With Discount</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">All Categories</option>
                  <option value="regular">Regular</option>
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="vip">VIP</option>
                </select>

                {(selectedFilter || searchQuery || categoryFilter) && (
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
                      <TableHead>Category</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
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
                            {getCategoryBadge(customer.category)}
                          </TableCell>
                          <TableCell>
                            {customer.discountPercentage > 0 ? (
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPercent} className="h-3 w-3 text-green-600" />
                                <span className="font-semibold text-green-600">{customer.discountPercentage}%</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No discount</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(customer)}
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
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No customers found</p>
                            {(selectedFilter || searchQuery || categoryFilter) && (
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
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <div className="mt-1">{getCategoryBadge(selectedCustomer.category)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Discount</p>
                  <p className="text-sm font-semibold">
                    {selectedCustomer.discountPercentage > 0 ? `${selectedCustomer.discountPercentage}%` : "No discount"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(selectedCustomer)}</div>
              </div>
              {selectedCustomer.birthday && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Birthday</p>
                  <p className="text-sm">{selectedCustomer.birthday}</p>
                </div>
              )}
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
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={customerForm.category}
                  onValueChange={(value) => setCustomerForm({...customerForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customerForm.discountPercentage}
                  onChange={(e) => setCustomerForm({...customerForm, discountPercentage: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={customerForm.birthday}
                  onChange={(e) => setCustomerForm({...customerForm, birthday: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="isActive"
                  checked={customerForm.isActive}
                  onCheckedChange={(checked) => setCustomerForm({...customerForm, isActive: checked})}
                />
                <Label htmlFor="isActive">Active Customer</Label>
              </div>
            </div>

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
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={customerForm.category}
                  onValueChange={(value) => setCustomerForm({...customerForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-discountPercentage">Discount (%)</Label>
                <Input
                  id="edit-discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customerForm.discountPercentage}
                  onChange={(e) => setCustomerForm({...customerForm, discountPercentage: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-birthday">Birthday</Label>
                <Input
                  id="edit-birthday"
                  type="date"
                  value={customerForm.birthday}
                  onChange={(e) => setCustomerForm({...customerForm, birthday: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="edit-isActive"
                  checked={customerForm.isActive}
                  onCheckedChange={(checked) => setCustomerForm({...customerForm, isActive: checked})}
                />
                <Label htmlFor="edit-isActive">Active Customer</Label>
              </div>
            </div>

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