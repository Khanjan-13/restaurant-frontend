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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faPlus,
  faPenToSquare,
  faTrash,
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
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setCategory({ ...category, [name]: value });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      // Retrieve the authentication token from localStorage
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.", {
          style: {
            marginTop: "40px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          },
        });
        return;
      }

      // Validate the category object
      if (!category || Object.keys(category).length === 0) {
        toast.error(
          "Category data is missing. Please fill in the required fields."
        );
        return;
      }

      // Send the POST request to add the category
      const response = await axios.post(
        `${BASE_URL}/dashboard/menu/category`,
        category,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Display a success toast
      toast.success(response.data.message, {
        style: {
          marginTop: "40px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        },
      });

      // Call the category addition handler
      handleAddCategory();
    } catch (error) {
      // Handle specific HTTP errors
      if (error.response) {
        // If the server responded with a status code outside the 2xx range
        const { status, data } = error.response;
        if (status === 401) {
          toast.error("Your session has expired. Please log in again.");
        } else if (status === 400) {
          toast.error(data.message || "Invalid data. Please check your input.");
        } else {
          toast.error(
            data.message || "An error occurred while adding the category."
          );
        }
      } else if (error.request) {
        // If the request was made but no response was received
        toast.error("No response from the server. Please try again later.");
      } else {
        // If something else caused the error
        toast.error("An unexpected error occurred.");
      }

      console.error("Error adding category:", error);
    }
  };

  // Categories View, Edit & Delete Section
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // Retrieve the authentication token from localStorage
        const token = localStorage.getItem("token");

        // Check if the token is missing
        if (!token) {
          toast.error("Authentication token is missing. Please log in again.");
          return;
        }
        const response = await axios.get(
          `${BASE_URL}/dashboard/menu/category`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCategories(response.data);
      } catch (error) {
        console.log("Error fetching category");
      }
    };
    fetchCategory();
  }, []);

  const updateInputHandler = (e) => {
    const { name, value } = e.target;
    setUpdateCategory({ ...updateCategory, [name]: value });
  };

  const handleCategoryEdit = async (id) => {
    try {
      // Retrieve the authentication token from localStorage
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      // Make the API request
      const response = await axios.get(
        `${BASE_URL}/dashboard/menu/category/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state with the response data
      setUpdateCategory(response.data);
      setIsDialogOpen(true);
    } catch (error) {
      // Handle errors
      console.error("Error fetching category:", error);
      toast.error("Failed to fetch category. Please try again later.");
    }
  };

  const submitUpdateForm = async (e) => {
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
        `${BASE_URL}/dashboard/menu/category/${updateCategory._id}`,
        updateCategory,
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
      handleAddCategory(); // Fetch updated categories
      setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      // Retrieve the authentication token from localStorage
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }
      const response = await axios.delete(
        `${BASE_URL}/dashboard/menu/category/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat._id !== categoryId)
      );
      toast.success(response.data.message, {
        style: {
          marginTop: "40px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddCategory = async () => {
    try {
      // Retrieve the authentication token from localStorage
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }
      const response = await axios.get(
      `${BASE_URL}/dashboard/menu/category`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data);
      setCategory({ categoryName: "" });
    } catch (error) {
      console.log("Error fetching updated categories");
    }
  };

  const handleCategorySelect = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);

    // Initialize menuItems for the selected category if not already initialized
    if (!menuItems[selected]) {
      setMenuItems((prevItems) => ({
        ...prevItems,
        [selected]: [{ name: "", price: "" }],
      }));
    }
  };

  const handleAddItemField = () => {
    if (selectedCategory) {
      setMenuItems({
        ...menuItems,
        [selectedCategory]: [
          ...(menuItems[selectedCategory] || []),
          { name: "", price: "" },
        ],
      });
    }
  };

  const handleSubItemField = (index) => {
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
    return lastItem.name && lastItem.price;
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

    const payload = {
      categoryId: selectedCategoryId,
      items: menuItems[selectedCategory],
    };

    try {
      const token = localStorage.getItem("token");

      // Check if the token is missing
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.", {
          style: {
            marginTop: "40px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          },
        });
        return;
      }
      const response = await axios.post(
        `${BASE_URL}/dashboard/menu/item`,
        payload,
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

      // Clear the items after successful submission
      setMenuItems((prevItems) => ({
        ...prevItems,
        [selectedCategory]: [{ name: "", price: "" }],
      }));
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit menu items.");
    }
  };

  return (
    <div>
      <div className="flex ml-56 min-h-screen flex-col bg-muted/40 pt-5">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid grid-cols-1 mx-20 md:mx-40 gap-3 pb-4">
            <Card className="rounded-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">
                  Add Menu Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitForm}>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Eg. South Indian"
                      name="categoryName"
                      value={category.categoryName}
                      onChange={inputHandler}
                      className="w-full"
                    />
                    <Button
                      type="submit"
                      className="bg-[#4caf50] hover:bg-[#419844]"
                    >
                      Add Category
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">
                  Add Menu Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitMenuItem}>
                  <div className="flex gap-2 mb-4">
                    <select
                      value={selectedCategory}
                      onChange={handleCategorySelect}
                      className="w-full p-2 border rounded"
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categories.map((cat) => (
                        <option
                          key={cat._id}
                          value={cat.categoryName}
                          name="categoryId"
                        >
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCategory && menuItems[selectedCategory] && (
                    <div className="space-y-2">
                      {menuItems[selectedCategory]?.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="text"
                            placeholder={`Add item to ${selectedCategory}`}
                            className="w-full"
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(index, "name", e.target.value)
                            }
                          />
                          <Input
                            type="number"
                            placeholder="₹0.00"
                            className="w-full"
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(index, "price", e.target.value)
                            }
                          />
                          <Button
                            type="button"
                            className="bg-[#f44336] hover:bg-[#da190b] px-4"
                            disabled={menuItems[selectedCategory].length === 1}
                            onClick={() => handleSubItemField(index)}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          className="bg-[#4caf50] hover:bg-[#419844] px-4"
                          disabled={!canAddNewItem(menuItems[selectedCategory])}
                          onClick={handleAddItemField}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#4caf50] hover:bg-[#419844]"
                        >
                          Submit Items
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-base text-left font-medium">
                  Manage Menu Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Sr. No.</TableHead>
                      <TableHead className="text-center">Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category, index) => (
                      <TableRow key={category._id}>
                        <TableCell className="p-2">{index + 1}</TableCell>
                        <TableCell className="p-2">
                          {category.categoryName}
                        </TableCell>
                        <TableCell className="text-right space-x-2 p-2">
                          <Button
                            className="bg-[#4caf50] hover:bg-[#419844] px-2"
                            onClick={() => handleCategoryEdit(category._id)}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </Button>
                          <Button
                            className="bg-[#f44336] hover:bg-[#da190b] px-2"
                            onClick={() => deleteCategory(category._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Dialog for Editing Category */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitUpdateForm}>
            <Input
              type="text"
              placeholder="Edit category name"
              name="categoryName"
              value={updateCategory.categoryName}
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

export default DashboardMenu;
