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
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
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

function DashboardMenuManage() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [updateMenuItem, setupdateMenuItem] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const updateAvailability = async (id, available) => {
    console.log("Switch clicked:", { id, available }); // Log the click action

    try {
      const token = localStorage.getItem("token"); // Retrieve token for authentication

      // Send the request to update item availability
      const response = await axios.put(
        `${BASE_URL}/dashboard/menu/itemSwitchUpdate/${id}`,
        { available: !available }, // Send the toggled value
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the headers
          },
        }
      );

      // Log the successful API response
      console.log("API Response:", response.data);

      // Update the local state to reflect the new availability
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? { ...item, available: !available } : item
        )
      );
    } catch (error) {
      // Log the error if the API call fails
      console.error("Error updating availability:", error);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/dashboard/menu/itemall`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMenuItems(response.data);
        console.log(response.data)
      } catch (error) {
        console.log("Error fetching menu items: ", error);
        toast.error("Error fetching menu items.");
      }
    };

    fetchItems();
  }, []); // Empty dependency array to fetch items once on mount

  const updateInputHandler = (e) => {
    const { name, value } = e.target;
    setupdateMenuItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Derive unique categories from the menu items
  const uniqueCategories = Array.from(
    new Set(menuItems.map((item) => item.categoryId?.categoryName)) // Added optional chaining for safety
  );

  // Filter items based on the selected category
  const filteredItems = selectedCategory
    ? menuItems.filter(
      (item) => item.categoryId?.categoryName === selectedCategory
    )
    : menuItems;
  const handleItemEdit = async (id) => {
    try {
      // Retrieve the authentication token from localStorage
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }
      // Fetch item details from the server
      const response = await axios.get(
        `${BASE_URL}/dashboard/menu/item/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state with the fetched data
      setupdateMenuItem(response.data);
      console.log(response.data)
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching item details:", error);
      toast.error("Failed to fetch item details. Please try again.");
    }
  };

  const submitItemForm = async (e) => {
    e.preventDefault();
    try {
      // Retrieve the authentication token from localStorage
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }
      const response = await axios.put(
        `${BASE_URL}/dashboard/menu/itemupdate/${updateMenuItem._id}`,
        updateMenuItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message, {
        style: {
          marginTop: "40px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        },
      });
      // Fetch updated items
      const fetchItem = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/dashboard/menu/itemall`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setMenuItems(response.data);
        } catch (error) {
          console.log("Error Fetching: ", error);
          toast.error("Error fetching menu items.");
        }
      };
      fetchItem();
      setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Error updating item.");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      // Retrieve the authentication token from localStorage
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }
      const response = await axios.delete(
        `${BASE_URL}/dashboard/menu/itemdelete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message, {
        style: {
          marginTop: "40px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        },
      });
      setMenuItems(menuItems.filter((item) => item._id !== id)); // Update state after deletion
    } catch (error) {
      console.log("Error deleting item");
      toast.error("Error deleting item.");
    }
  };

  return (
    <div>
      <div className="flex ml-56 min-h-screen flex-col bg-muted/40 pt-5">
        <main className="grid flex-1 items-start mx-20 md:mx-30 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card className="rounded-none border-border shadow-lg">
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-center p-3 font-semibold text-foreground">Sr. No.</TableHead>
                    <TableHead className="text-center p-3 font-semibold text-foreground">Item</TableHead>
                    <TableHead className="text-center p-3 font-semibold text-foreground">Category</TableHead>
                    <TableHead className="text-center p-3 font-semibold text-foreground">Price</TableHead>
                    <TableHead className="text-center p-3 font-semibold text-foreground">Qty</TableHead>
                    <TableHead className="text-center p-3 font-semibold text-foreground">Available</TableHead>
                    <TableHead className="text-center p-3 font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <TableRow key={item._id} className="hover:bg-muted/30 transition-colors duration-200">
                      {/* Serial Number */}
                      <TableCell className="text-center p-3 text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {/* Item Name */}
                      <TableCell className="font-semibold p-3 text-foreground">
                        {item.name}
                      </TableCell>

                      {/* Category Name */}
                      <TableCell className="p-3 text-muted-foreground">
                        {item.categoryId?.categoryName}
                      </TableCell>

                      {/* Item Price */}
                      <TableCell className="p-3 font-semibold text-[#4caf50]">₹{item.price}</TableCell>
                      <TableCell className="p-3 text-center text-foreground">{item.qty}</TableCell>

                      {/* Availability Switch */}
                      <TableCell className="p-3 text-center">
                        <Switch
                          checked={item.available}
                          onClick={() => updateAvailability(item._id, item.available)}
                          className="data-[state=checked]:bg-[#4caf50]"
                        />
                      </TableCell>

                      {/* Edit and Delete Buttons */}
                      <TableCell className="p-3">
                        <div className="flex gap-2 justify-center">
                          {/* Edit Button */}
                          <button
                            className="bg-[#4caf50] hover:bg-[#419844] p-2 text-white rounded-md transition-colors duration-200 shadow-sm"
                            onClick={() => handleItemEdit(item._id)}
                            title="Edit Item"
                          >
                            <FontAwesomeIcon
                              icon={faPenToSquare}
                              className="h-4 w-4"
                            />
                          </button>

                          {/* Delete Button */}
                          <button
                            className="bg-red-500 hover:bg-red-600 p-2 text-white rounded-md transition-colors duration-200 shadow-sm"
                            onClick={() => handleDeleteItem(item._id)}
                            title="Delete Item"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
      {/* Dialog for Editing Menu Items */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  const category = menuItems.find(
                    (item) => item.categoryId.categoryName === categoryName
                  );
                  return (
                    <option
                      key={category.categoryId._id}
                      value={category.categoryId._id}
                    >
                      {category.categoryId.categoryName}
                    </option>
                  );
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
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[#4caf50] hover:bg-[#419844] text-white font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardMenuManage;