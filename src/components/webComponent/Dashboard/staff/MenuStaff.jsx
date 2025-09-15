import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import OrdersBilling from "@/components/webComponent/Orders/OrdersBilling";
import axios from "axios";
import OrdersBillingStaff from "./OrderBillingStaff";

function MenuStaff() {
  const [dishTypes, setDishTypes] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBillingMobile, setShowBillingMobile] = useState(false); // Toggle for mobile
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/dashboard/menu/itemall`,
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
    <div className="flex flex-1 flex-col">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col border-r p-4 sm:flex bg-background min-h-screen fixed">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4caf50]">Menu Categories</h3>
        </div>
        <nav className="flex flex-col gap-2">
          {uniqueCategories.map((category) => (
            <React.Fragment key={category._id}>
              <Button
                variant="ghost"
                className={`justify-start text-left text-foreground transition-colors duration-200 ${
                  selectedCategoryId === category._id
                    ? "border-l-2 rounded-none border-[#4caf50] bg-muted text-[#4caf50] font-semibold"
                    : "hover:bg-muted hover:text-[#4caf50]"
                }`}
                onClick={() => setSelectedCategoryId(category._id)}
              >
                {category.categoryName}
              </Button>
              <hr className="border-border" />
            </React.Fragment>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="md:ml-56 flex justify-between bg-muted/40 min-h-screen">
        <div className="overflow-y-auto h-[93vh] bg-muted/40 w-full">
          {/* Search bar */}
          <div className="border-b bg-background shadow-sm">
            <form className="mx-auto p-4">
              <div className="relative flex items-center max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                />
              </div>
            </form>
          </div>

          {/* Dish Cards */}
          <main className="flex-1 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#4caf50] mb-2">Menu Items</h2>
              <p className="text-muted-foreground">Click on items to add to order</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredDishes.map((dish) => (
                <Card
                  key={dish._id}
                  className="bg-background hover:bg-[#4caf50]/10 border-l-4 border-l-[#4caf50] cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                  onClick={() => handleAddToOrder(dish)}
                >
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-foreground mb-2">{dish.name}</h3>
                    <p className="text-lg font-semibold text-[#4caf50]">₹{dish.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredDishes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-lg font-medium text-muted-foreground">
                  No menu items found.
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Desktop Billing */}
        <div className="md:flex hidden">
          <OrdersBillingStaff orderItems={orderItems} setOrderItems={setOrderItems}/>
        </div>
      </div>

      {/* Mobile Toggle Billing Drawer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <button
          className="w-full bg-[#4caf50] hover:bg-[#419844] text-white py-3 flex justify-center items-center transition-colors duration-200 shadow-lg"
          onClick={() => setShowBillingMobile((prev) => !prev)}
        >
          {showBillingMobile ? (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> Hide Billing
            </>
          ) : (
            <>
              <ChevronUp className="mr-2 h-4 w-4" /> Show Billing
            </>
          )}
        </button>
        {showBillingMobile && (
          <div className="bg-background border-t border-border max-h-[80vh] shadow-lg">
            <OrdersBillingStaff orderItems={orderItems} setOrderItems={setOrderItems} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuStaff;