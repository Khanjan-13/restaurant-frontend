import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUserFriends,
  faUser,
  faHeart,
  faCrown,
  faPercent,
  faCheck,
  faTimes,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

function CustomerSelector({ onCustomerSelect, selectedCustomer, onClearSelection }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (isDialogOpen) {
      fetchCustomers();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery, categoryFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        // Only show active customers with discounts
        const activeCustomers = response.data.filter(
          customer => customer.isActive && customer.discountPercentage > 0
        );
        setCustomers(activeCustomers);
        setFilteredCustomers(activeCustomers);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(customer => customer.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone?.includes(searchQuery) ||
          customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setIsDialogOpen(false);
    setSearchQuery("");
    setCategoryFilter("");
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      regular: { label: "Regular", icon: faUser, color: "bg-gray-100 text-gray-800" },
      family: { label: "Family", icon: faHeart, color: "bg-red-100 text-red-800" },
      friend: { label: "Friend", icon: faUserFriends, color: "bg-blue-100 text-blue-800" },
      vip: { label: "VIP", icon: faCrown, color: "bg-purple-100 text-purple-800" }
    };

    const config = categoryConfig[category] || categoryConfig.regular;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 text-xs`}>
        <FontAwesomeIcon icon={config.icon} className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const clearSelection = () => {
    onClearSelection();
  };

  return (
    <div className="space-y-4">
      {/* Customer Selection Display */}
      {selectedCustomer ? (
        <div className="p-4 border rounded-lg bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-green-800">{selectedCustomer.name}</h4>
                  {getCategoryBadge(selectedCustomer.category)}
                </div>
                <p className="text-sm text-green-600">
                  Discount: {selectedCustomer.discountPercentage}% applied
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <FontAwesomeIcon icon={faPercent} className="h-3 w-3 mr-1" />
                -{selectedCustomer.discountPercentage}%
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="text-red-600 hover:text-red-700"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">No Customer Selected</h4>
                <p className="text-sm text-gray-600">Select a customer to apply discount</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <FontAwesomeIcon icon={faUserFriends} className="h-4 w-4 mr-2" />
              Select Customer
            </Button>
          </div>
        </div>
      )}

      {/* Customer Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Choose a customer to apply automatic discount to this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
                />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSearch} className="h-4 w-4 animate-spin" />
                    Loading customers...
                  </div>
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer._id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{customer.name}</h4>
                          {getCategoryBadge(customer.category)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{customer.phone}</span>
                          {customer.email && <span>{customer.email}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <FontAwesomeIcon icon={faPercent} className="h-3 w-3 mr-1" />
                          {customer.discountPercentage}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUserFriends} className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No customers found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Only active customers with discounts are shown
                  </p>
                </div>
              )}
            </div>

            {/* Add New Customer Link */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsDialogOpen(false);
                  // You can add navigation to customer management here
                  window.open('/dashboard/customers', '_blank');
                }}
              >
                <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomerSelector; 