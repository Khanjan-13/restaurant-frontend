import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import OrdersBilling from "@/components/webComponent/Orders/OrdersBilling";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faBars,
  faX,
  faUtensils,
  faLeaf,
  faStar,
  faFire,
  faShoppingCart, 
  faChevronLeft,
  faChevronRight,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

function Orders() {
  const [dishTypes, setDishTypes] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBillingMobile, setShowBillingMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, veg, non-veg, popular
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getAvailableQty = (dish) => {
    const raw = (
      dish?.quantity ??
      dish?.availableQuantity ??
      dish?.quantityAvailable ??
      dish?.availableQty ??
      dish?.stock ??
      dish?.stockQty ??
      dish?.currentStock ??
      dish?.itemQuantity ??
      dish?.qty ??
      dish?.remaining ??
      dish?.balance ??
      null
    );
    if (raw === null || raw === undefined) return null;
    const num = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
    return Number.isFinite(num) ? num : null;
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, []);

  // Poll for latest quantities at regular intervals
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${BASE_URL}/dashboard/menu/itemall`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDishTypes(response.data);
      } catch (err) {
        // Silently ignore transient polling errors
        // console.warn("Polling error (menu items):", err);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [BASE_URL]);

  const handleAddToOrder = (dish) => {
    const available = getAvailableQty(dish);
    if (available !== null && available <= 0) {
      return;
    }
    setOrderItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item._id === dish._id);
      if (existingItemIndex >= 0) {
        const existing = prevItems[existingItemIndex];
        const currentQty = existing.quantity || 0;
        if (available !== null && currentQty >= available) {
          toast.error(`Only ${available} in stock`);
          return prevItems;
        }
        return prevItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: currentQty + 1 } : item
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

    // Apply additional filters
    let matchesFilter = true;
    if (selectedFilter === "veg") {
      matchesFilter = dish.isVeg === true; // assuming there's an isVeg field
    } else if (selectedFilter === "non-veg") {
      matchesFilter = dish.isVeg === false;
    } else if (selectedFilter === "popular") {
      matchesFilter = dish.isPopular === true; // assuming there's an isPopular field
    }

    if (searchQuery) {
      return matchesSearchQuery && isAvailable && matchesFilter;
    }

    return (!selectedCategoryId || dish.categoryId?._id === selectedCategoryId) && isAvailable && matchesFilter;
  });

  // Calculate totals for billing
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-16">
      {/* Sidebar */}
      <div className={`fixed left-0 top-16 z-40 h-full w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ${
        showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Menu Categories</h3>
                <p className="text-xs text-muted-foreground">Choose your favorites</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowSidebar(false)}
            >
              <FontAwesomeIcon icon={faX} className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex-1 overflow-auto p-3">
          <nav className="space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <FontAwesomeIcon icon={faUtensils} className="h-6 w-6 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground mt-2">Loading categories...</p>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 h-auto p-3 ${
                    !selectedCategoryId
                      ? "bg-green-700 text-white shadow-sm"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setSelectedCategoryId(null)}
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUtensils} className="h-3 w-3" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">All Items</p>
                    <p className="text-xs opacity-75">{dishTypes.length} dishes</p>
                  </div>
                </Button>

                <Separator />

                {uniqueCategories.map((category) => {
                  const categoryDishes = dishTypes.filter(dish => dish.categoryId?._id === category._id);
                  return (
                    <Button
                      key={category._id}
                      variant="ghost"
                      className={`w-full justify-start gap-2 h-auto p-3 ${
                        selectedCategoryId === category._id
                          ? "bg-green-700 text-white shadow-sm"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setSelectedCategoryId(category._id)}
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faLeaf} className="h-3 w-3" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-sm">{category.categoryName}</p>
                        <p className="text-xs opacity-75">{categoryDishes.length} dishes</p>
                      </div>
                    </Button>
                  );
                })}
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="sticky top-16 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowSidebar(true)}
              >
                <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
              </Button>
              
              <div>
                <h1 className="text-lg md:text-xl font-semibold">
                  {selectedCategoryId
                    ? uniqueCategories.find(c => c._id === selectedCategoryId)?.categoryName
                    : "All Menu Items"
                  }
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {filteredDishes.length} available dishes
                </p>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="hidden md:flex items-center gap-4">
              {totalItems > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-green-700" />
                  <span className="text-sm font-medium text-gray-700">{totalItems} items</span>
                  <span className="text-sm font-bold text-green-700">₹{totalAmount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-3 py-2 md:px-6 md:py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 md:h-4 md:w-4" 
                  />
                  <Input
                    type="search"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 md:pl-10 text-sm md:text-base h-8 md:h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm min-w-[100px] md:min-w-[120px] text-gray-700 h-8 md:h-10"
                >
                  <option value="all">All Items</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="popular">Popular</option>
                </select>

                {(searchQuery || selectedFilter !== "all") && (
                  <Button variant="outline" size="sm" className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3" onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex">
          <div className="flex-1 p-2 md:p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading menu items...</p>
                </div>
              </div>
            ) : filteredDishes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                {filteredDishes.map((dish) => (
                 <Card
                 key={dish._id}
                 className={`group relative cursor-pointer rounded-2xl overflow-hidden border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${
                   (getAvailableQty(dish) !== null && getAvailableQty(dish) <= 0) ? "opacity-60 cursor-not-allowed hover:scale-100" : ""
                 }`}
                 onClick={() => {
                   const qty = getAvailableQty(dish);
                   if (qty === null || qty > 0) handleAddToOrder(dish);
                 }}
               >
                 <CardContent className="p-4 md:p-5">
                   {/* Top row with name + badges */}
                   <div className="flex items-start justify-between mb-3">
                     <h3 className="font-semibold text-base md:text-lg text-gray-800 group-hover:text-green-700 transition-colors">
                       {dish.name}
                     </h3>
               
                     <div className="flex gap-2 items-center">
                       {dish.isPopular && (
                         <span className="px-2 py-0.5 text-[10px] md:text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium shadow-sm" onClick={(e) => e.stopPropagation()}>
                           ⭐ Popular
                         </span>
                       )}
                       {dish.isVeg !== undefined && (
                         <span
                           className={`px-2 py-0.5 text-[10px] md:text-xs rounded-full font-medium shadow-sm ${
                             dish.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                           }`} onClick={(e) => e.stopPropagation()}
                         >
                           {dish.isVeg ? "Veg" : "Non-Veg"}
                         </span>
                       )}
                       {(() => {
                         const qty = getAvailableQty(dish);
                         const inStock = qty === null ? null : qty > 0;
                         return (
                           <span className={`px-2 py-0.5 text-[10px] md:text-xs rounded-full font-medium shadow-sm ${
                             inStock === null ? "bg-gray-100 text-gray-600" : inStock ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                           }`} onClick={(e) => e.stopPropagation()}>
                             Qty: {qty === null ? "-" : qty}
                           </span>
                         );
                       })()}
                     </div>
                   </div>
               
                   {/* Price + qty */}
                   <div className="flex items-center justify-between">
                     <p className="text-sm md:text-base font-bold text-green-700">₹{dish.price}</p>
                   </div>
               
                   {dish.description && (
                     <p className="text-xs md:text-sm text-gray-500 mt-2 line-clamp-2">
                       {dish.description}
                     </p>
                   )}
                 </CardContent>
               
                 {/* Floating + button */}
                 <button
                   disabled={getAvailableQty(dish) !== null && getAvailableQty(dish) <= 0}
                   className={`absolute bottom-3 right-3 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                     (getAvailableQty(dish) !== null && getAvailableQty(dish) <= 0)
                       ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                       : "bg-green-600 text-white hover:bg-green-700"
                   }`}
                 >
                   <FontAwesomeIcon icon={faPlus} className="h-3 w-3 md:h-4 md:w-4" />
                 </button>
               </Card>
               
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FontAwesomeIcon icon={faSearch} className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-800">No dishes found</h3>
                <p className="text-gray-500 text-center">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Billing */}
          <div className="hidden lg:block w-[28rem] border-l border-gray-200 bg-white">
            <OrdersBilling orderItems={orderItems} setOrderItems={setOrderItems} />
          </div>
        </div>
      </div>

      {/* Mobile Billing */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        {totalItems > 0 && (
          <div className="px-3 py-1 md:px-4 md:py-2 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="font-medium text-gray-700">{totalItems} items</span>
              <span className="font-bold text-green-700">₹{totalAmount}</span>
            </div>
          </div>
        )}
        
        <button
          className="w-full bg-green-700 hover:bg-green-800 text-white py-2 md:py-3 flex justify-center items-center gap-2 transition-colors text-sm md:text-base"
          onClick={() => setShowBillingMobile((prev) => !prev)}
        >
          {showBillingMobile ? (
            <>
              <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3 md:h-4 md:w-4" /> 
              Hide Cart
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3 md:h-4 md:w-4" /> 
              View Cart {totalItems > 0 && `(${totalItems})`}
            </>
          )}
        </button>

        {showBillingMobile && (
          <div className="max-h-[80vh] overflow-auto bg-white">
            <OrdersBilling orderItems={orderItems} setOrderItems={setOrderItems} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
