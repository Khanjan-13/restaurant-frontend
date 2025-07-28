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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPenToSquare, 
  faTrash, 
  faSearch,
  faFilter,
  faUtensils,
  faListDots,
  faCookie,
  faEye,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

function DashboardMenuManage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updateMenuItem, setupdateMenuItem] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, selectedCategory, searchQuery, availabilityFilter]);

  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/dashboard/menu/itemall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Error fetching menu items.");
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...menuItems];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.categoryId?.categoryName === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryId?.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by availability
    if (availabilityFilter !== "all") {
      const isAvailable = availabilityFilter === "available";
      filtered = filtered.filter((item) => item.available === isAvailable);
    }

    setFilteredItems(filtered);
  };

  const updateAvailability = async (id, available) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/dashboard/menu/itemSwitchUpdate/${id}`,
        { available: !available },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? { ...item, available: !available } : item
        )
      );

      toast.success(`Item ${!available ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update item availability");
    }
  };

  const handleItemEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/dashboard/menu/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setupdateMenuItem(response.data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching item details:", error);
      toast.error("Failed to fetch item details. Please try again.");
    }
  };

  const submitItemForm = async (e) => {
    e.preventDefault();
    if (!updateMenuItem.name?.trim()) {
      toast.error("Item name cannot be empty.");
      return;
    }
    if (!updateMenuItem.price || updateMenuItem.price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.put(
        `${BASE_URL}/dashboard/menu/itemupdate/${updateMenuItem._id}`,
        updateMenuItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message || "Item updated successfully");
      fetchItems();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Error updating item.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.delete(`${BASE_URL}/dashboard/menu/itemdelete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message || "Item deleted successfully");
      setMenuItems(menuItems.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item.");
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setAvailabilityFilter("all");
  };

  // Get unique categories
  const uniqueCategories = Array.from(
    new Set(menuItems.map((item) => item.categoryId?.categoryName))
  ).filter(Boolean);

  // Calculate stats
  const stats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.available).length,
    unavailableItems: menuItems.filter(item => !item.available).length,
    categories: uniqueCategories.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Menu Items Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage your restaurant's menu items and availability
              </p>
            </div>
            <Button onClick={fetchItems} variant="outline" disabled={loading}>
              <FontAwesomeIcon icon={faUtensils} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.totalItems}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUtensils} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.availableItems}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faToggleOn} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unavailable</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.unavailableItems}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faToggleOff} className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categories</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.categories}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faListDots} className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
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
                      placeholder="Search by item name or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[150px]"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map((categoryName) => (
                    <option key={categoryName} value={categoryName}>
                      {categoryName}
                    </option>
                  ))}
                </select>

                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[130px]"
                >
                  <option value="all">All Items</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable Only</option>
                </select>

                {(selectedCategory || searchQuery || availabilityFilter !== "all") && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Menu Items Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Menu Items</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredItems.length} of {menuItems.length} items
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                  <p className="text-muted-foreground">Loading menu items...</p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Available</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item, index) => (
                        <TableRow key={item._id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center relative">
                            <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 text-muted-foreground" />
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                                  {index + 1}
                            </span>

                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">#{index + 1}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {item.categoryId?.categoryName}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{item.price}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={item.available}
                                onCheckedChange={() =>
                                  updateAvailability(item._id, item.available)
                                }
                                className="data-[state=checked]:bg-green-500"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleItemEdit(item._id)}
                              >
                                <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteItem(item._id)}
                              >
                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faCookie} className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory || availabilityFilter !== "all"
                      ? "No items match your filters"
                      : "No menu items found. Add some items to get started."
                    }
                  </p>
                  {(searchQuery || selectedCategory || availabilityFilter !== "all") && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={clearFilters}>
                      Clear filters to see all items
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the item details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitItemForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                name="categoryId"
                value={updateMenuItem.categoryId || ""}
                onChange={(e) => setupdateMenuItem({ ...updateMenuItem, categoryId: e.target.value })}
                className="w-full p-3 border rounded-lg bg-background"
                required
              >
                <option value="">Select Category</option>
                {uniqueCategories.map((categoryName) => {
                  const category = menuItems.find(
                    (item) => item.categoryId?.categoryName === categoryName
                  );
                  return (
                    <option
                      key={category?.categoryId?._id}
                      value={category?.categoryId?._id}
                    >
                      {category?.categoryId?.categoryName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Item Name</label>
              <Input
                type="text"
                placeholder="Enter item name"
                name="name"
                value={updateMenuItem.name || ""}
                onChange={(e) => setupdateMenuItem({ ...updateMenuItem, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price (₹)</label>
              <Input
                type="number"
                placeholder="Enter price"
                name="price"
                min="1"
                step="0.01"
                value={updateMenuItem.price || ""}
                onChange={(e) => setupdateMenuItem({ ...updateMenuItem, price: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardMenuManage;
