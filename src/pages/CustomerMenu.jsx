import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, History, Sparkles, Clock, Search, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  getActiveCart, 
  addToCart as addToSessionCart, 
  updateCartItemQuantity, 
  getSessionStats,
  initSession 
} from "@/services/customer/customerSessionService";
import CustomerBottomNav from "@/components/webComponent/Customer/CustomerBottomNav";

const CustomerMenu = () => {
  const { tableId: paramTableId } = useParams();
  const [searchParams] = useSearchParams();
  const tableIdFromQuery = searchParams.get('tableId');
  const tableId = tableIdFromQuery || paramTableId;
  
  const navigate = useNavigate();
  const [tableInfo, setTableInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionStats, setSessionStats] = useState(null);
  const categoryScrollRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!tableId) {
      toast.error("Invalid table ID");
      navigate("/");
      return;
    }
    
    // Initialize session
    initSession(tableId);
    
    // Load cart from localStorage first (for persistence), fallback to session
    const localStorageCart = localStorage.getItem(`customerCart_${tableId}`);
    if (localStorageCart) {
      try {
        const parsedCart = JSON.parse(localStorageCart);
        setCart(parsedCart);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        // Fallback to session cart
        const sessionCart = getActiveCart(tableId);
        setCart(sessionCart);
      }
    } else {
      // Load cart from session
      const sessionCart = getActiveCart(tableId);
      setCart(sessionCart);
    }
    
    // Load session stats
    const stats = getSessionStats(tableId);
    setSessionStats(stats);
    
    fetchTableInfo();
    fetchMenuItems();
  }, [tableId]);

  const fetchTableInfo = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customer/table/${tableId}`);
      setTableInfo(response.data);
      localStorage.setItem("customerTableId", tableId);
      localStorage.setItem("customerTableInfo", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching table info:", error);
      toast.error("Failed to load table information");
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dashboard/menu/itemall-public`);
      
      console.log("Menu Items Response:", response.data);
      
      if (response.data && response.data.length > 0) {
        setMenuItems(response.data);
        
        // Extract unique categories from populated categoryId
        const uniqueCategories = [...new Set(
          response.data
            .filter(item => item.categoryId && item.categoryId.categoryName)
            .map(item => item.categoryId.categoryName)
        )];
        
        setCategories(["All", ...uniqueCategories]);
      } else {
        toast.error("No menu items available");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setLoading(false);
      toast.error("Failed to load menu items");
    }
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const addToCart = (item) => {
    if (item.qty === 0) {
      toast.error("Item is out of stock");
      return;
    }
    
    const cartItem = {
      _id: item._id,
      itemName: item.name,
      itemPrice: item.price,
      itemCategory: item.categoryId?.categoryName || "",
      itemDescription: "",
      name: item.name, // For compatibility
      price: item.price,
    };

    // Add to session storage
    const updatedCart = addToSessionCart(tableId, cartItem);
    setCart(updatedCart);
    
    // Also save to localStorage for persistence across page refreshes
    localStorage.setItem(`customerCart_${tableId}`, JSON.stringify(updatedCart));
    
    // Update session stats
    const stats = getSessionStats(tableId);
    setSessionStats(stats);
    
    toast.success(
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        <span>{item.name} added to cart</span>
      </div>,
      {
        duration: 2000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      }
    );
  };

  const updateQuantity = (itemId, change) => {
    const item = cart.find((c) => c._id === itemId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    // Update in session storage
    const updatedCart = updateCartItemQuantity(tableId, itemId, newQuantity);
    setCart(updatedCart);
    
    // Also save to localStorage for persistence
    localStorage.setItem(`customerCart_${tableId}`, JSON.stringify(updatedCart));
    
    // Update session stats
    const stats = getSessionStats(tableId);
    setSessionStats(stats);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.itemPrice * item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    localStorage.setItem("customerCart", JSON.stringify(cart));
    navigate(`/customer/checkout?tableId=${tableId}`);
  };
  
  const goToOrderHistory = () => {
    navigate(`/customer/order-history?tableId=${tableId}`);
  };

  const filteredItems = selectedCategory === "All"
    ? menuItems
    : menuItems.filter(item => item.categoryId?.categoryName === selectedCategory);

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.categoryId?.categoryName || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-green-700 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-24">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-2xl font-bold">Our Menu</h1>
              <p className="text-sm text-green-100">Table {tableInfo?.tableNumber} • {tableInfo?.section}</p>
              {sessionStats && sessionStats.totalOrders > 0 && (
                <p className="text-xs text-green-100 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {sessionStats.totalOrders} order{sessionStats.totalOrders !== 1 ? 's' : ''} placed today
                </p>
              )}
            </div>
          </div>

          {/* Horizontal Category Scroll */}
          <div className="relative">
            <button
              onClick={() => scrollCategories("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 text-green-600 rounded-full p-1 shadow-md hover:bg-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                    selectedCategory === category
                      ? "bg-white text-green-600 shadow-lg scale-105"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollCategories("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 text-green-600 rounded-full p-1 shadow-md hover:bg-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="border-l-4 border-orange-600 pl-3">{category}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const cartItem = cart.find((c) => c._id === item._id);
                const inCart = !!cartItem;
                const quantity = cartItem?.quantity || 0;
                
                return (
                  <Card 
                    key={item._id} 
                    className={`hover:shadow-xl transition-all duration-300 border-2 ${
                      inCart ? 'border-orange-400 bg-orange-50' : 'border-transparent hover:border-orange-200'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-lg font-semibold text-gray-800">{item.name}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-orange-600">₹{item.price}</span>
                          {item.qty === 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-orange-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="bg-white text-orange-600 p-1.5 rounded hover:bg-orange-200 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-bold text-orange-600">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="bg-orange-600 text-white p-1.5 rounded hover:bg-orange-700 transition-colors"
                              disabled={item.qty === 0}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(item)}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
                            disabled={item.qty === 0}
                            size="sm"
                          >
                            <Plus size={16} className="mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found in this category</p>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      {tableId && <CustomerBottomNav tableId={tableId} />}
    </div>
  );
};

export default CustomerMenu;
