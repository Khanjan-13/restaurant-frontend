import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import OrdersBilling from "@/components/webComponent/Orders/OrdersBilling";
import axios from "axios";

function Orders() {
  const [dishTypes, setDishTypes] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBillingMobile, setShowBillingMobile] = useState(false); // Toggle for mobile

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/dashboard/menu/itemall",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDishTypes(response.data);

        const uniqueCategories = [
          ...new Map(response.data.map((dish) => [dish.categoryId._id, dish.categoryId])).values(),
        ];
        if (uniqueCategories.length > 0) {
          setSelectedCategoryId(uniqueCategories[0]._id);
        }
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    };

    fetchCategory();
  }, []);

  const handleAddToOrder = (dish) => {
    setOrderItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item._id === dish._id);
      if (existingItemIndex >= 0) {
        return prevItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...dish, quantity: 1 }];
      }
    });
  };

  const uniqueCategories = [
    ...new Map(dishTypes.map((dish) => [dish.categoryId._id, dish.categoryId])).values(),
  ];

  const filteredDishes = dishTypes.filter((dish) => {
    const matchesSearchQuery = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isAvailable = dish.available;

    if (searchQuery) {
      return matchesSearchQuery && isAvailable;
    }

    return (!selectedCategoryId || dish.categoryId?._id === selectedCategoryId) && isAvailable;
  });

  return (
    <div className="flex flex-1 pt-12 flex-col">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col border-r p-4 sm:flex dark:bg-[#1a1a1a] min-h-screen fixed">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4caf50]">Menu</h3>
        </div>
        <nav className="flex flex-col gap-2">
          {uniqueCategories.map((category) => (
            <React.Fragment key={category._id}>
              <Button
                variant="ghost"
                className={`justify-start text-left text-[#333] ${
                  selectedCategoryId === category._id
                    ? "border-l-2 rounded-none border-[#4caf50] bg-[#e0e0e0] dark:text-[#ccc]"
                    : "hover:bg-[#e0e0e0] dark:text-[#ccc] dark:hover:bg-[#333]"
                }`}
                onClick={() => setSelectedCategoryId(category._id)}
              >
                {category.categoryName}
              </Button>
              <hr />
            </React.Fragment>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="md:ml-56 flex justify-between bg-[#f0f0f0]">
        <div className="overflow-y-auto h-[93vh] bg-[#f0f0f0] w-full">
          {/* Search bar */}
          <div className="border-b-2">
            <form className="mx-auto p-2">
              <div className="relative flex items-center">
                <Search className="absolute left-1.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:w-1/2 appearance-none bg-background pl-8 shadow-none"
                />
              </div>
            </form>
          </div>

          {/* Dish Cards */}
          <main className="flex-1 p-4 relative sm:p-6 dark:bg-[#1a1a1a]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredDishes.map((dish) => (
                <Card
                  key={dish._id}
                  className="bg-white dark:bg-[#333] hover:bg-[#7ad27d]  border-l-2 rounded-none border-l-[#4caf50] cursor-pointer"
                  onClick={() => handleAddToOrder(dish)}
                >
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold ">{dish.name}</h3>
                    <p className="text-sm text-muted-foreground">₹{dish.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>

        {/* Desktop Billing */}
        <div className="md:flex hidden">
          <OrdersBilling orderItems={orderItems} setOrderItems={setOrderItems} />
        </div>
      </div>

      {/* Mobile Toggle Billing Drawer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <button
          className="w-full bg-[#4caf50] text-white py-2 flex justify-center items-center"
          onClick={() => setShowBillingMobile((prev) => !prev)}
        >
          {showBillingMobile ? (
            <>
              <ChevronDown className="mr-1" /> Hide Billing
            </>
          ) : (
            <>
              <ChevronUp className="mr-1" /> Show Billing
            </>
          )}
        </button>
        {showBillingMobile && (
          <div className="bg-white dark:bg-[#1a1a1a] border-t border-gray-300 max-h-[80vh] ">
            <OrdersBilling orderItems={orderItems} setOrderItems={setOrderItems} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
