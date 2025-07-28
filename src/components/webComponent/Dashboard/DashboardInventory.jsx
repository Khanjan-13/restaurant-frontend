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
  faDownload,
  faRefresh,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faXmark,
  faBoxes,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faWarehouse,
  faChartLine,
  faArrowUp,
  faArrowDown,
  faMinus,
  faPlus as faPlusIcon,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";

function DashboardInventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Form states for adding new inventory item
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    currentStock: "",
    minStockLevel: "",
    unit: "",
    costPerUnit: "",
    supplier: "",
    description: ""
  });
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchInventoryItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterItems();
  }, [inventoryItems, selectedFilter, searchQuery, categoryFilter]);

  const fetchInventoryItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/inventory/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setInventoryItems(response.data);
        setFilteredItems(response.data);
      } else {
        setInventoryItems([]);
        setFilteredItems([]);
      }
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      setError(err.message || "Failed to fetch inventory items. Please try again.");
      toast.error("Failed to fetch inventory items");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/inventory/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const itemData = {
        ...newItem,
        currentStock: parseInt(newItem.currentStock),
        minStockLevel: parseInt(newItem.minStockLevel),
        costPerUnit: parseFloat(newItem.costPerUnit)
      };

      const response = await axios.post(`${BASE_URL}/inventory/items`, itemData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Inventory item added successfully!");
        setIsAddDialogOpen(false);
        setNewItem({
          name: "",
          category: "",
          currentStock: "",
          minStockLevel: "",
          unit: "",
          costPerUnit: "",
          supplier: "",
          description: ""
        });
        fetchInventoryItems();
      }
    } catch (err) {
      console.error("Error adding inventory item:", err);
      toast.error("Failed to add inventory item. Please try again.");
    }
  };

  const handleUpdateStock = async (itemId, newStock, action) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.put(`${BASE_URL}/inventory/items/${itemId}/stock`, {
        newStock: newStock,
        action: action // "add" or "subtract"
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success(`Stock ${action === "add" ? "added" : "subtracted"} successfully!`);
        fetchInventoryItems();
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      toast.error("Failed to update stock. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.delete(`${BASE_URL}/inventory/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Inventory item deleted successfully!");
        fetchInventoryItems();
      }
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      toast.error("Failed to delete inventory item. Please try again.");
    }
  };

  const filterItems = () => {
    let filtered = [...inventoryItems];

    // Filter by stock status
    if (selectedFilter) {
      switch (selectedFilter) {
        case "low":
          filtered = filtered.filter(item => item.currentStock <= item.minStockLevel);
          break;
        case "out":
          filtered = filtered.filter(item => item.currentStock === 0);
          break;
        case "normal":
          filtered = filtered.filter(item => item.currentStock > item.minStockLevel);
          break;
      }
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const clearFilters = () => {
    setSelectedFilter("");
    setSearchQuery("");
    setCategoryFilter("");
  };

  const getStockStatusBadge = (item) => {
    if (item.currentStock === 0) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3 mr-1" />
          Out of Stock
        </Badge>
      );
    } else if (item.currentStock <= item.minStockLevel) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3 mr-1" />
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
          In Stock
        </Badge>
      );
    }
  };

  const getStockTrend = (item) => {
    // Mock trend calculation - in real app this would come from historical data
    const trend = Math.random() > 0.5 ? "up" : "down";
    return (
      <div className="flex items-center gap-1">
        <FontAwesomeIcon 
          icon={trend === "up" ? faArrowUp : faArrowDown} 
          className={`h-3 w-3 ${trend === "up" ? "text-green-600" : "text-red-600"}`} 
        />
        <span className="text-xs text-muted-foreground">
          {trend === "up" ? "+5%" : "-3%"}
        </span>
      </div>
    );
  };

  // Calculate stats
  const stats = {
    total: filteredItems.length,
    lowStock: filteredItems.filter(item => item.currentStock <= item.minStockLevel && item.currentStock > 0).length,
    outOfStock: filteredItems.filter(item => item.currentStock === 0).length,
    totalValue: filteredItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0),
    categories: [...new Set(filteredItems.map(item => item.category))].length
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Inventory Management</h1>
              <p className="text-sm text-muted-foreground">
                Track and manage restaurant inventory
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInventoryItems}
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
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.total}</h3>
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
                    <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.lowStock}</h3>
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
                    <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.outOfStock}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTimesCircle} className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <h3 className="text-2xl font-bold mt-2">₹{stats.totalValue.toLocaleString()}</h3>
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
                    <h3 className="text-2xl font-bold mt-2">{stats.categories}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faWarehouse} className="h-6 w-6 text-purple-600" />
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
                      placeholder="Search by item name, category, or supplier..."
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
                  <option value="">All Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                  <option value="normal">Normal Stock</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
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

          {/* Inventory Items Table */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Inventory Items</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredItems.length} of {inventoryItems.length} items
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
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Level</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Cost/Unit</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faRefresh} className="h-4 w-4 animate-spin" />
                            Loading inventory items...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => (
                        <TableRow key={item._id || index} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {item.currentStock}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.minStockLevel}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.unit}
                          </TableCell>
                          <TableCell className="text-sm">
                            ₹{item.costPerUnit}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{(item.currentStock * item.costPerUnit).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getStockStatusBadge(item)}
                          </TableCell>
                          <TableCell>
                            {getStockTrend(item)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStock(item._id, 1, "add")}
                                className="hover:bg-green-50 hover:text-green-600"
                              >
                                <FontAwesomeIcon icon={faPlusIcon} className="h-3 w-3 mr-1" />
                                +1
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStock(item._id, 1, "subtract")}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <FontAwesomeIcon icon={faMinus} className="h-3 w-3 mr-1" />
                                -1
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FontAwesomeIcon icon={faBoxes} className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No inventory items found</p>
                            {(selectedFilter || searchQuery || categoryFilter) && (
                              <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear filters to see all items
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

      {/* Item Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
            <DialogDescription>
              Complete information about this inventory item.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Item Name</p>
                <p className="font-medium">{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-sm capitalize">{selectedItem.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{selectedItem.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                  <p className="text-sm font-medium">{selectedItem.currentStock} {selectedItem.unit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Min Stock Level</p>
                  <p className="text-sm">{selectedItem.minStockLevel} {selectedItem.unit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cost per Unit</p>
                  <p className="text-sm">₹{selectedItem.costPerUnit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-sm font-semibold">₹{(selectedItem.currentStock * selectedItem.costPerUnit).toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                <p className="text-sm">{selectedItem.supplier || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStockStatusBadge(selectedItem)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new item to the inventory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="Enter item name"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                placeholder="Enter category"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Enter description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Current Stock *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={newItem.currentStock}
                  onChange={(e) => setNewItem({...newItem, currentStock: e.target.value})}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="minStockLevel">Min Stock Level *</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={newItem.minStockLevel}
                  onChange={(e) => setNewItem({...newItem, minStockLevel: e.target.value})}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  placeholder="kg, pcs, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="costPerUnit">Cost per Unit *</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  value={newItem.costPerUnit}
                  onChange={(e) => setNewItem({...newItem, costPerUnit: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={newItem.supplier}
                onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Add Item
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
    </div>
  );
}

export default DashboardInventory;
