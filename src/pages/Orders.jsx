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
} from "@fortawesome/free-solid-svg-icons";

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
    <div className="min-h-screen bg-background pt-16 md:pt-16">
      {/* Sidebar */}
      <div className={`fixed left-0 top-16 z-40 h-full w-80 bg-background border-r transition-transform duration-300 ${
        showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faUtensils} className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Menu Categories</h3>
                <p className="text-sm text-muted-foreground">Choose your favorites</p>
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
        <div className="flex-1 overflow-auto p-4">
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
                  className={`w-full justify-start gap-3 h-auto p-4 ${
                    !selectedCategoryId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedCategoryId(null)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUtensils} className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">All Items</p>
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
                      className={`w-full justify-start gap-3 h-auto p-4 ${
                        selectedCategoryId === category._id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => setSelectedCategoryId(category._id)}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faLeaf} className="h-4 w-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium">{category.categoryName}</p>
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
      <div className="lg:ml-80">
        {/* Header */}
        <div className="sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-6 py-4">
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
                <h1 className="text-xl font-semibold">
                  {selectedCategoryId
                    ? uniqueCategories.find(c => c._id === selectedCategoryId)?.categoryName
                    : "All Menu Items"
                  }
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredDishes.length} available dishes
                </p>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="hidden md:flex items-center gap-4">
              {totalItems > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                  <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{totalItems} items</span>
                  <span className="text-sm font-bold">₹{totalAmount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-3 border-t bg-muted/20">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                  />
                  <Input
                    type="search"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
                >
                  <option value="all">All Items</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="popular">Popular</option>
                </select>

                {(searchQuery || selectedFilter !== "all") && (
                  <Button variant="outline" size="sm" onClick={() => {
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
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading menu items...</p>
                </div>
              </div>
            ) : filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDishes.map((dish) => (
                  <Card
                    key={dish._id}
                    className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm"
                    onClick={() => handleAddToOrder(dish)}
                  >
                    <CardContent className="p-0">
                      {/* Dish Image Placeholder */}
                      <div className="h-48 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground" />
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {dish.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            {dish.isVeg !== undefined && (
                              <div className={`w-3 h-3 rounded-sm ${
                                dish.isVeg ? "bg-green-500" : "bg-red-500"
                              }`} />
                            )}
                            {dish.isPopular && (
                              <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-primary">₹{dish.price}</p>
                            {dish.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {dish.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Available
                          </Badge>
                          <Button 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToOrder(dish);
                            }}
                          >
                            Add to Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FontAwesomeIcon icon={faSearch} className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No dishes found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Billing */}
          <div className="hidden lg:block w-96 border-l">
            <OrdersBilling orderItems={orderItems} setOrderItems={setOrderItems} />
          </div>
        </div>
      </div>

      {/* Mobile Billing */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        {totalItems > 0 && (
          <div className="px-4 py-2 bg-primary/10">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{totalItems} items</span>
              <span className="font-bold">₹{totalAmount}</span>
            </div>
          </div>
        )}
        
        <button
          className="w-full bg-primary text-primary-foreground py-3 flex justify-center items-center gap-2"
          onClick={() => setShowBillingMobile((prev) => !prev)}
        >
          {showBillingMobile ? (
            <>
              <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" /> 
              Hide Cart
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" /> 
              View Cart {totalItems > 0 && `(${totalItems})`}
            </>
          )}
        </button>

        {showBillingMobile && (
          <div className="max-h-[80vh] overflow-auto bg-background">
            <OrdersBilling orderItems={orderItems} setOrderItems={setOrderItems} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
