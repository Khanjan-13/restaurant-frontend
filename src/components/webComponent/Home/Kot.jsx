import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import KotNavbar from "./KotNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCircleXmark, 
  faClock, 
  faUtensils, 
  faShoppingBag, 
  faRefresh, 
  faFilter,
  faSearch,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

function Kot() {
  const [kotItems, setKotItems] = useState([]);
  const [timers, setTimers] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("time"); // time, table
  const [filterStatus, setFilterStatus] = useState("all"); // all, pickup, dinein
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchKotItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/home/getallkot`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      // Grouping items by tokenNumber
      const groupedItems = data.reduce((acc, item) => {
        if (!acc[item.tokenNumber]) {
          acc[item.tokenNumber] = [];
        }
        acc[item.tokenNumber].push(item);
        return acc;
      }, {});

      setKotItems(groupedItems);

      // Initialize timers for newly fetched items
      const initialTimers = {};
      data.forEach((item) => {
        initialTimers[item.tokenNumber] =
          Date.now() - new Date(item.createdAt).getTime();
      });
      setTimers(initialTimers);
    } catch (error) {
      console.log("Error fetching KOT items:", error);
      toast.error("Failed to fetch kitchen orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (tokenNumber) => {
    if (!window.confirm("Are you sure you want to complete this order?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.delete(`${BASE_URL}/home/deleteKot`, {
        data: { tokenNumber },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message || "Order completed successfully!");
      fetchKotItems();

      // Remove from kotItems state
      setKotItems((prevKotItems) => {
        const updatedKotItems = { ...prevKotItems };
        delete updatedKotItems[tokenNumber];
        return updatedKotItems;
      });

      // Remove from timers state
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        delete updatedTimers[tokenNumber];
        return updatedTimers;
      });
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Error completing order.");
    }
  };

  useEffect(() => {
    fetchKotItems();

    // Set up periodic updates (every 30 seconds)
    const interval = setInterval(fetchKotItems, 30000);

    return () => clearInterval(interval);
  }, []);

  // Timer update logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        for (const tokenNumber in updatedTimers) {
          updatedTimers[tokenNumber] += 1000;
        }
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes < 5) return "text-green-600";
    if (minutes < 10) return "text-yellow-600";
    return "text-red-600";
  };

  // Filter and sort KOT items
  const getFilteredAndSortedItems = () => {
    let filtered = Object.entries(kotItems)
      .filter(([_, items]) => items.some((item) => item.isKot)); // Show items that ARE KOT (kitchen orders)

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(([tokenNumber, items]) =>
        tokenNumber.includes(searchQuery) ||
        items[0]?.tableNumber?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(([_, items]) => {
        const isPickup = items[0]?.tableNumber === "PICK UP";
        return filterStatus === "pickup" ? isPickup : !isPickup;
      });
    }

    // Sort items
    if (sortBy === "time") {
      filtered.sort(([tokenA], [tokenB]) => {
        return (timers[tokenB] || 0) - (timers[tokenA] || 0);
      });
    } else if (sortBy === "table") {
      filtered.sort(([_, itemsA], [__, itemsB]) => {
        const tableA = itemsA[0]?.tableNumber || "";
        const tableB = itemsB[0]?.tableNumber || "";
        return tableA.localeCompare(tableB);
      });
    }

    return filtered;
  };

  const filteredItems = getFilteredAndSortedItems();
  const totalOrders = filteredItems.length;
  const avgTime = totalOrders > 0
    ? Object.values(timers).reduce((sum, time) => sum + time, 0) / totalOrders / 60000
    : 0;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
  };

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-16">
      <KotNavbar />
      
      {/* Header */}
      <div className="bg-background border-b">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faClock} className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pending Orders</p>
                  <p className="text-xl font-bold">{totalOrders}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUtensils} className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Avg Time</p>
                  <p className="text-xl font-bold">{Math.round(avgTime)}m</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faShoppingBag} className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Items Count</p>
                  <p className="text-xl font-bold">
                    {filteredItems.reduce((sum, [_, items]) => 
                      sum + items.filter(item => item.isKot).length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline" 
                size="sm"
                onClick={fetchKotItems}
                disabled={loading}
                className="gap-2"
              >
                <FontAwesomeIcon 
                  icon={faRefresh} 
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-t bg-muted/20">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                />
                <Input
                  placeholder="Search by token or table number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
              >
                <option value="time">Sort by Time</option>
                <option value="table">Sort by Table</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
              >
                <option value="all">All Orders</option>
                <option value="dinein">Dine In</option>
                <option value="pickup">Pick Up</option>
              </select>

              {(searchQuery || filterStatus !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KOT Cards */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FontAwesomeIcon icon={faClock} className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Loading kitchen orders...</p>
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(([tokenNumber, items]) => {
              const isPickup = items[0]?.tableNumber === "PICK UP";
              const elapsedTime = timers[tokenNumber] || 0;
              
              return (
                <Card key={tokenNumber} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className={`${
                    isPickup ? "bg-blue-600" : "bg-primary"
                  } text-white rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {isPickup ? "PICK UP" : `Table ${items[0]?.tableNumber}`}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Token #{tokenNumber}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 hover:text-white"
                        onClick={() => handleDeleteItem(tokenNumber)}
                      >
                        <FontAwesomeIcon icon={faCircleXmark} className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className={`text-2xl font-bold ${getTimerColor(elapsedTime)} bg-white/10 rounded px-2 py-1 text-center`}>
                      <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-2" />
                      {formatTime(elapsedTime)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Items</span>
                        <span className="text-muted-foreground">Qty</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {items
                          .filter((item) => item.isKot)
                          .map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-1">
                              <span className="font-medium text-sm">{item.itemName}</span>
                              <Badge variant="outline" className="ml-2">
                                {item.itemQuantity}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button 
                      onClick={() => handleDeleteItem(tokenNumber)}
                      className="w-full gap-2"
                      variant={elapsedTime > 600000 ? "destructive" : "default"}
                    >
                      <FontAwesomeIcon icon={faCircleXmark} className="h-4 w-4" />
                      Mark Complete
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon icon={faClock} className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Orders</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || filterStatus !== "all"
                ? "No orders match your current filters."
                : "All kitchen orders have been completed. Great job!"
              }
            </p>
            {(searchQuery || filterStatus !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Kot;
