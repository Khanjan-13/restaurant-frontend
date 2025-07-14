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

  const updateAvailability = async (id, available) => {
    console.log("Switch clicked:", { id, available }); // Log the click action

    try {
      const token = localStorage.getItem("token"); // Retrieve token for authentication

      // Send the request to update item availability
      const response = await axios.put(
        `http://localhost:8000/dashboard/menu/itemSwitchUpdate/${id}`,
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
        const response = await axios.get(
          "http://localhost:8000/dashboard/menu/itemall",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMenuItems(response.data);
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
        `http://localhost:8000/dashboard/menu/item/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state with the fetched data
      setupdateMenuItem(response.data);
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
        `http://localhost:8000/dashboard/menu/itemupdate/${updateMenuItem._id}`,
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
            "http://localhost:8000/dashboard/menu/itemall",
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
        `http://localhost:8000/dashboard/menu/itemdelete/${id}`,
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
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex justify-between items-center text-sm font-medium w-full">
                <div>Menu Management</div>
                <div>
                  <select
                    className="p-1.5 border border-gray-300 rounded-md text-sm"
                    aria-label="Filter by category"
                    value={selectedCategory}
                    onChange={handleFilterChange}
                  >
                    <option value="">Filter by</option>
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
                  <TableRow>
                    <TableHead className="text-center p-2">Sr. No.</TableHead>
                    <TableHead className="text-center p-2">Item</TableHead>
                    <TableHead className="text-center p-2">Category</TableHead>
                    <TableHead className="text-center p-2">Price</TableHead>
                    <TableHead className="text-center p-2">Available</TableHead>
                    <TableHead className="text-center p-2">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <TableRow key={item._id}>
                      {/* Serial Number */}
                      <TableCell className="text-center p-2">
                        {index + 1}
                      </TableCell>

                      {/* Item Name */}
                      <TableCell className="font-medium p-2">
                        {item.name}
                      </TableCell>

                      {/* Category Name */}
                      <TableCell className="p-2">
                        {item.categoryId?.categoryName}
                      </TableCell>

                      {/* Item Price */}
                      <TableCell className="p-2">{item.price}</TableCell>

                      {/* Availability Switch */}
                      <TableCell className="p-2">
                        <Switch
                          checked={item.available} // Bind the Switch state to the item's `available` property
                          onClick={() =>
                            updateAvailability(item._id, item.available)
                          } // Call the handler with item ID and state
                          style={{
                            backgroundColor: item.available ? "#4caf50" : "", // Green for true, gray for false
                          }}
                        />
                      </TableCell>

                      {/* Edit and Delete Buttons */}
                      <TableCell className="p-2 flex gap-2 justify-center">
                        {/* Edit Button */}
                        <button
                          className="bg-green-600 hover:bg-green-700 p-1.5 text-white rounded transition duration-200 ease-in-out"
                          onClick={() => handleItemEdit(item._id)}
                        >
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="h-4 w-4"
                          />
                        </button>

                        {/* Delete Button */}
                        <button
                          className="bg-red-600 hover:bg-red-700 p-1.5 text-white rounded transition duration-200 ease-in-out"
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                        </button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Make changes to the item below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitItemForm} className="flex flex-col gap-2">
            <select
              name="categoryId"
              value={updateMenuItem.categoryId || ""}
              onChange={updateInputHandler}
              className="w-full p-2 border rounded"
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
            <Input
              type="text"
              placeholder="Edit item name"
              name="name"
              value={updateMenuItem.name || ""}
              onChange={updateInputHandler}
            />
            <Input
              type="number"
              placeholder="Edit price"
              name="price"
              value={updateMenuItem.price || ""}
              onChange={updateInputHandler}
            />
            <div className="mt-4">
              <Button type="submit" className="bg-[#4caf50] hover:bg-[#419844]">
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
