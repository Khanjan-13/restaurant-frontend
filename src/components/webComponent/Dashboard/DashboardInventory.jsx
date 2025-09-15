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
import { Switch } from "@/components/ui/switch";
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
  faPenToSquare,
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updateMenuItem, setupdateMenuItem] = useState({});
  
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
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/dashboard/menu/itemall`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const normalized = Array.isArray(response.data)
          ? response.data.map((item) => ({
              ...item,
              currentStock: Number(item.currentStock ?? item.qty ?? 0),
              costPerUnit: Number(item.costPerUnit ?? item.price ?? 0),
            }))
          : [];
        setInventoryItems(normalized);
        setFilteredItems(normalized);
      } else {
        setInventoryItems([]);
        setFilteredItems([]);
      }
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || "Failed to fetch inventory items";
      console.error("Error fetching inventory items:", { status, message, error: err });
      setError(message);
      if (status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (status === 404) {
        toast.error("Endpoint not found. Check VITE_API_BASE_URL and API paths.");
      } else {
        toast.error(message);
      }
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

      const response = await axios.get(`${BASE_URL}/dashboard/menu/category`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Derived unique categories from menu items
  const uniqueCategories = Array.from(
    new Set(
      filteredItems.map((item) => item.categoryId?.categoryName).filter(Boolean)
    )
  );

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (!value) {
      setFilteredItems(inventoryItems);
      return;
    }
    const next = inventoryItems.filter(
      (it) => it.categoryId?.categoryName === value
    );
    setFilteredItems(next);
  };

  const updateAvailability = async (id, available) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/dashboard/menu/itemSwitchUpdate/${id}`,
        { available: !available },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFilteredItems((prev) =>
        prev.map((it) => (it._id === id ? { ...it, available: !available } : it))
      );
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleItemEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/dashboard/menu/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setupdateMenuItem(res.data);
      setIsEditDialogOpen(true);
    } catch (error) {
      toast.error("Failed to fetch item");
    }
  };

  const updateInputHandler = (e) => {
    const { name, value } = e.target;
    setupdateMenuItem((prev) => ({ ...prev, [name]: value }));
  };

  const submitItemForm = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/dashboard/menu/itemupdate/${updateMenuItem._id}`,
        updateMenuItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Item updated");
      setIsEditDialogOpen(false);
      fetchInventoryItems();
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/dashboard/menu/itemdelete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item deleted");
      setFilteredItems((prev) => prev.filter((it) => it._id !== id));
    } catch (error) {
      toast.error("Failed to delete item");
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

      const response = await axios.post(`${BASE_URL}/dashboard/menu/itemall`, itemData, {
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

      const response = await axios.put(`${BASE_URL}/dashboard/menu/itemall/${itemId}/stock`, {
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

      const response = await axios.delete(`${BASE_URL}/dashboard/menu/itemall/${itemId}`, {
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
      filtered = filtered.filter(item => {
        const nameFromId = item.categoryId?.categoryName;
        const nameFromCategory = item.category?.categoryName;
        const name = nameFromId || nameFromCategory || item.categoryName;
        return name === categoryFilter;
      });
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
    lowStock: filteredItems.filter(item => (item.currentStock ?? item.qty ?? 0) <= (item.minStockLevel ?? 0) && (item.currentStock ?? item.qty ?? 0) > 0).length,
    outOfStock: filteredItems.filter(item => (item.currentStock ?? item.qty ?? 0) === 0).length,
    totalValue: filteredItems.reduce((sum, item) => {
      const qty = Number(item.currentStock ?? item.qty ?? 0);
      const price = Number(item.costPerUnit ?? item.price ?? 0);
      return sum + (qty * price);
    }, 0),
    categories: [...new Set(filteredItems.map(item => item.categoryId?.categoryName || item.category?.categoryName || item.categoryName))].length
  };

  // GST reference data for display
  const gstRules = [
    { context: "Food orders (dine-in / takeaway / delivery)", total: 5, cgst: 2.5, sgst: 2.5, note: "Standard non-alcoholic food service" },
    { context: "Restaurants serving alcohol", total: 18, cgst: 9, sgst: 9, note: "Alcohol service attracts higher GST" },
    { context: "Outdoor catering / banquet", total: 18, cgst: 9, sgst: 9, note: "Catering services" },
    { context: "Packaged food: Cold drink", total: 18, cgst: 9, sgst: 9, note: "Example item rate" },
    { context: "Packaged food: Packaged snacks", total: 12, cgst: 6, sgst: 6, note: "Example item rate" },
    { context: "Unbranded essentials", total: 0, cgst: 0, sgst: 0, note: "No GST" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
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

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
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

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
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

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
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

            <Card className="border shadow-sm bg-gradient-to-br from-background to-muted/20">
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
                  {Array.isArray(categories) && categories.map((category) => {
                    const name = category.categoryName || category.name || category;
                    return (
                      <option key={category._id || name} value={name}>
                        {name}
                    </option>
                    );
                  })}
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

          {/* Inventory Items Table - Menu Management styled */}
          <div>
            <div className="ml-56 pt-5">
              <main className="mx-6 sm:mx-8">
                <Card className="border-border shadow-lg rounded-lg overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="flex justify-between items-center text-lg font-bold w-full">
                      <div className="text-[#4caf50]">Menu Management</div>
                      <div>
                        <select
                          className="p-2 border border-border rounded-md text-sm bg-background focus:border-[#4caf50] focus:ring-[#4caf50]"
                          aria-label="Filter by category"
                          value={selectedCategory}
                          onChange={handleFilterChange}
                        >
                          <option value="">Filter by Category</option>
                          {uniqueCategories.map((categoryName) => (
                            <option key={categoryName} value={categoryName}>
                              {categoryName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[920px] max-h-[70vh] overflow-y-auto">
                        <Table className="text-sm">
                          <TableHeader>
                            <TableRow className="bg-muted/60 sticky top-0 z-10 shadow-sm border-b">
                              <TableHead className="text-center px-4 py-3 font-semibold text-foreground uppercase tracking-wide w-20">Sr. No.</TableHead>
                              <TableHead className="px-4 py-3 font-semibold text-foreground uppercase tracking-wide">Item</TableHead>
                              <TableHead className="px-4 py-3 font-semibold text-foreground uppercase tracking-wide">Category</TableHead>
                              <TableHead className="px-4 py-3 font-semibold text-foreground uppercase tracking-wide text-right">Price</TableHead>
                              <TableHead className="text-center px-4 py-3 font-semibold text-foreground uppercase tracking-wide">Qty</TableHead>
                              <TableHead className="text-center px-4 py-3 font-semibold text-foreground uppercase tracking-wide">Available</TableHead>
                              <TableHead className="text-center px-4 py-3 font-semibold text-foreground uppercase tracking-wide w-40">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loading && (
                              <TableRow>
                                <TableCell colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Loading items...</TableCell>
                              </TableRow>
                            )}
                            {!loading && filteredItems.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No items found.</TableCell>
                              </TableRow>
                            )}
                            {!loading && filteredItems.map((item, index) => {
                              const price = Number(item.price ?? item.costPerUnit ?? 0);
                              const quantity = item.qty ?? item.currentStock ?? 0;
                              return (
                                <TableRow key={item._id} className="hover:bg-muted/40 transition-colors duration-200 even:bg-muted/20 border-b">
                                  <TableCell className="text-center px-4 py-3 text-muted-foreground align-middle">{index + 1}</TableCell>
                                  <TableCell className="px-4 py-3 text-foreground font-medium align-middle">{item.name}</TableCell>
                                  <TableCell className="px-4 py-3 text-muted-foreground align-middle">{item.categoryId?.categoryName}</TableCell>
                                  <TableCell className="px-4 py-3 text-right font-semibold text-[#4caf50] align-middle">₹{price.toLocaleString()}</TableCell>
                                  <TableCell className="text-center px-4 py-3 text-foreground align-middle">{quantity}</TableCell>
                                  <TableCell className="text-center px-4 py-3 align-middle">
                                    <Switch
                                      checked={!!item.available}
                                      onClick={() => updateAvailability(item._id, item.available)}
                                      className="data-[state=checked]:bg-[#4caf50]"
                                    />
                                  </TableCell>
                                  <TableCell className="px-4 py-3 align-middle">
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        className="bg-[#4caf50] hover:bg-[#419844] px-3 py-2 text-white rounded-md transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4caf50]"
                                        onClick={() => handleItemEdit(item._id)}
                                        title="Edit Item"
                                      >
                                        <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                                      </button>
                                      <button
                                        className="bg-red-500 hover:bg-red-600 px-3 py-2 text-white rounded-md transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        onClick={() => handleDeleteMenuItem(item._id)}
                                        title="Delete Item"
                                      >
                                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </main>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[#4caf50] font-bold">Edit Menu Item</DialogTitle>
                  <DialogDescription>
                    Make changes to the menu item below and save your updates.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={submitItemForm} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-foreground">
                      Category
                    </label>
                    <select
                      id="category"
                      name="categoryId"
                      value={updateMenuItem.categoryId || ""}
                      onChange={updateInputHandler}
                      className="w-full p-3 border border-border rounded-md bg-background focus:border-[#4caf50] focus:ring-[#4caf50]"
                    >
                      {uniqueCategories.map((categoryName) => {
                        const category = filteredItems.find(
                          (it) => it.categoryId?.categoryName === categoryName
                        );
                        return category ? (
                          <option
                            key={category.categoryId._id}
                            value={category.categoryId._id}
                          >
                            {category.categoryId.categoryName}
                          </option>
                        ) : null;
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Item Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter item name"
                      name="name"
                      value={updateMenuItem.name || ""}
                      onChange={updateInputHandler}
                      className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium text-foreground">
                      Price (₹)
                    </label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price"
                      name="price"
                      value={updateMenuItem.price || ""}
                      onChange={updateInputHandler}
                      className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="qty" className="text-sm font-medium text-foreground">
                      Quantity
                    </label>
                    <Input
                      id="qty"
                      type="number"
                      placeholder="Enter quantity"
                      name="qty"
                      value={updateMenuItem.qty || 0}
                      onChange={updateInputHandler}
                      className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#4caf50] hover:bg-[#419844] text-white font-semibold">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Custom GST Table */}
          <div className="mt-6">
            <Card className="border-border shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex justify-between items-center text-lg font-bold w-full">
                  <div className="text-[#4caf50]">GST Split Reference</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[720px]">
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow className="bg-muted/60">
                          <TableHead className="px-4 py-3 font-semibold text-foreground uppercase tracking-wide">Context</TableHead>
                          <TableHead className="text-right px-4 py-3 font-semibold text-foreground uppercase tracking-wide">Total GST</TableHead>
                          <TableHead className="text-right px-4 py-3 font-semibold text-foreground uppercase tracking-wide">CGST</TableHead>
                          <TableHead className="text-right px-4 py-3 font-semibold text-foreground uppercase tracking-wide">SGST</TableHead>
                          <TableHead className="px-4 py-3 font-semibold text-foreground uppercase tracking-wide">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gstRules.map((row, idx) => (
                          <TableRow key={idx} className="even:bg-muted/20 border-b">
                            <TableCell className="px-4 py-3 text-foreground">{row.context}</TableCell>
                            <TableCell className="px-4 py-3 text-right text-foreground">{row.total}%</TableCell>
                            <TableCell className="px-4 py-3 text-right text-foreground">{row.cgst}%</TableCell>
                            <TableCell className="px-4 py-3 text-right text-foreground">{row.sgst}%</TableCell>
                            <TableCell className="px-4 py-3 text-muted-foreground">{row.note}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
    </div>
  );
}

export default DashboardInventory;
