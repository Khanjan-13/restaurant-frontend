import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faPlus,
  faPenToSquare,
  faTrash,
  faUtensils,
  faListDots,
  faCookie,
  faSearch,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";

function DashboardMenu() {
  const [updateCategory, setUpdateCategory] = useState({ categoryName: "" });
  const [category, setCategory] = useState({ categoryName: "" });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [menuItems, setMenuItems] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/dashboard/menu/category`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const submitCategoryForm = async (e) => {
    e.preventDefault();
    if (!category.categoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/dashboard/menu/category`,
        category,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message || "Category added successfully");
      setCategory({ categoryName: "" });
      fetchCategories();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid data. Please check your input.");
      } else {
        toast.error(error.response?.data.message || "An error occurred while adding the category.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/dashboard/menu/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUpdateCategory(response.data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Failed to fetch category details.");
    }
  };

  const submitUpdateForm = async (e) => {
    e.preventDefault();
    if (!updateCategory.categoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.put(
        `${BASE_URL}/dashboard/menu/category/${updateCategory._id}`,
        updateCategory,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message || "Category updated successfully");
      fetchCategories();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This will also delete all menu items in this category.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.delete(`${BASE_URL}/dashboard/menu/category/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat._id !== categoryId)
      );
      toast.success(response.data.message || "Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleCategorySelect = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);

    if (!menuItems[selected]) {
      setMenuItems((prevItems) => ({
        ...prevItems,
        [selected]: [{ name: "", quantity: "", price: "" }],
      }));
    }
  };

  const handleAddItemField = () => {
    if (selectedCategory) {
      setMenuItems({
        ...menuItems,
        [selectedCategory]: [
          ...(menuItems[selectedCategory] || []),
          { name: "", quantity: "", price: "" },
        ],
      });
    }
  };

  const handleRemoveItemField = (index) => {
    const updatedItems = [...menuItems[selectedCategory]];
    updatedItems.splice(index, 1);
    setMenuItems({
      ...menuItems,
      [selectedCategory]: updatedItems,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...menuItems[selectedCategory]];
    updatedItems[index][field] = value;
    setMenuItems({ ...menuItems, [selectedCategory]: updatedItems });
  };

  const canAddNewItem = (items) => {
    if (!items || items.length === 0) return false;
    const lastItem = items[items.length - 1];
    return Boolean(lastItem.name && lastItem.price);
  };

  const submitMenuItem = async (e) => {
    e.preventDefault();
    const selectedCategoryId = categories.find(
      (cat) => cat.categoryName === selectedCategory
    )?._id;

    if (!selectedCategoryId) {
      toast.error("Selected category not found.");
      return;
    }

    const validItems = menuItems[selectedCategory].filter(
      item => item.name?.trim() && item.price?.trim()
    ).map(item => ({
      name: item.name.trim(),
      quantity: (item.quantity && String(item.quantity).trim()) ? String(item.quantity).trim() : "1",
      price: String(item.price).trim(),
    }));

    if (validItems.length === 0) {
      toast.error("Please add at least one valid menu item.");
      return;
    }

    const payload = {
      categoryId: selectedCategoryId,
      items: validItems,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.post(`${BASE_URL}/dashboard/menu/item`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message || "Menu items added successfully");
      setMenuItems((prevItems) => ({
        ...prevItems,
        [selectedCategory]: [{ name: "", quantity: "", price: "" }],
      }));
    } catch (error) {
      console.error("Error adding menu items:", error);
      toast.error("Failed to add menu items.");
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalCategories: categories.length,
    activeItems: 0, // This would need to come from API
    pendingItems: selectedCategory ? (menuItems[selectedCategory]?.length || 0) : 0,
    recentlyAdded: 5, // Mock data
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-bold text-[#4caf50]">Menu Management</h1>
              <p className="text-sm text-muted-foreground">
                Create and organize your restaurant menu categories and items
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categories</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.totalCategories}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTag} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Items</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.activeItems}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUtensils} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Items</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.pendingItems}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCookie} className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recently Added</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.recentlyAdded}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faListDots} className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Category Form */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Add Menu Category</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create categories like Appetizers, Main Course, Beverages, Desserts, etc.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitCategoryForm} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="e.g., South Indian, North Indian, Beverages, Desserts"
                    name="categoryName"
                    value={category.categoryName}
                    onChange={(e) => setCategory({ ...category, [e.target.name]: e.target.value })}
                    disabled={loading}
                    className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                  />
                </div>
                <Button type="submit" disabled={loading} className="gap-2 bg-[#4caf50] hover:bg-[#419844]">
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                  Add Category
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Menu Items Form */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Add Menu Items</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add items to your categories with names, quantities, and prices
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={submitMenuItem}>
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Category</label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategorySelect}
                    className="w-full p-3 border rounded-lg bg-background border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                    required
                  >
                    <option value="" disabled>
                      Choose a category to add items
                    </option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.categoryName} name="categoryId">
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Menu Items Fields */}
                {selectedCategory && menuItems[selectedCategory] && (
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Menu Items</label>
                    <div className="space-y-3">
                      {menuItems[selectedCategory]?.map((item, index) => (
                        <div key={index} className="flex gap-3 items-center p-4 border rounded-lg bg-muted/20">
                          <div className="flex-1">
                            <Input
                              type="text"
                              placeholder={`Add item to ${selectedCategory}`}
                              value={item.name}
                              onChange={(e) =>
                                handleItemChange(index, "name", e.target.value)
                              }
                              className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                            />
                          </div>
                          {/* <div className="w-32">
                            <Input
                              type="text"
                              placeholder={`Quantity`}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, "quantity", e.target.value)
                              }
                              className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                            />
                          </div> */}
                          <div className="w-32">
                            <Input
                              type="number"
                              placeholder="Price"
                              value={item.price}
                              onChange={(e) =>
                                handleItemChange(index, "price", e.target.value)
                              }
                              className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={menuItems[selectedCategory].length === 1}
                            onClick={() => handleRemoveItemField(index)}
                          >
                            <FontAwesomeIcon icon={faMinus} className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!canAddNewItem(menuItems[selectedCategory])}
                        onClick={handleAddItemField}
                        className="gap-2"
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                        Add Another Item
                      </Button>
                      <Button type="submit" disabled={loading} className="gap-2 bg-[#4caf50] hover:bg-[#419844]">
                        <FontAwesomeIcon icon={faUtensils} className="h-4 w-4" />
                        Save Items
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Manage Categories */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Manage Categories</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    View, edit, and delete your menu categories
                  </p>
                </div>
                <div className="relative min-w-[250px]">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                  />
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                  <p className="text-muted-foreground">Loading categories...</p>
                </div>
              ) : filteredCategories.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead className="text-center">Items Count</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category, index) => (
                        <TableRow key={category._id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {category.categoryName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {category.categoryName}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">0 items</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCategoryEdit(category._id)}
                              >
                                <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteCategory(category._id)}
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
                  <FontAwesomeIcon icon={faTag} className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No categories match your search"
                      : "No categories found. Add your first category above."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitUpdateForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category Name</label>
              <Input
                type="text"
                placeholder="Edit category name"
                name="categoryName"
                value={updateCategory.categoryName}
                onChange={(e) => setUpdateCategory({ ...updateCategory, [e.target.name]: e.target.value })}
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

export default DashboardMenu;

