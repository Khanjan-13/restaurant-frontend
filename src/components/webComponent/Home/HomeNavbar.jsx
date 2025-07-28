import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHourglass2,
  faPlus,
  faCircle,
  faCodeFork,
  faUtensils,
  faTruck,
  faShoppingBag,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

function HomeNavbar() {
  const [kotCount, setKotCount] = useState(0);

  // Fetch real KOT count from API
  useEffect(() => {
    const fetchKotCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setKotCount(0);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/home/getallkot`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        // Count unique tokenNumbers where isKot is true
        const kotTokens = new Set(
          data.filter(item => item.isKot).map(item => item.tokenNumber)
        );
        setKotCount(kotTokens.size);
      } catch (error) {
        console.error("Error fetching KOT count:", error);
        setKotCount(0);
      }
    };

    fetchKotCount();
  }, []);

  const orderTypes = [
    {
      name: "DINE IN",
      path: "/",
      icon: faUtensils,
      image: "Home/dinein.png",
      description: "Table service",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      activeColor: "bg-blue-600 text-white"
    },
    {
      name: "PICK UP",
      path: "/pickup",
      icon: faShoppingBag,
      image: "Home/parcel.png", 
      description: "Customer pickup",
      color: "bg-green-50 text-green-700 border-green-200",
      activeColor: "bg-green-600 text-white"
    },
    {
      name: "DELIVERY",
      path: "/delivery",
      icon: faTruck,
      image: "Home/delivery.png",
      description: "Home delivery",
      color: "bg-orange-50 text-orange-700 border-orange-200", 
      activeColor: "bg-orange-600 text-white"
    }
  ];

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Order Type Navigation */}
        <div className="flex items-center gap-2">
          {orderTypes.map((type) => (
            <NavLink
              key={type.name}
              to={type.path}
              className={({ isActive }) =>
                `group relative flex flex-col items-center gap-2 rounded-xl px-6 py-4 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? `${type.activeColor} shadow-lg transform scale-105`
                    : `${type.color} border hover:shadow-md`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <img 
                        src={type.image} 
                        alt={type.name}
                        className={`w-8 h-8 transition-all duration-200 ${
                          isActive ? 'brightness-0 invert' : ''
                        }`}
                      />
                    </div>
                    <span className="font-semibold">{type.name}</span>
                    {!isActive && (
                      <span className="text-xs opacity-75">{type.description}</span>
                    )}
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* KOT Button */}
          <NavLink to="/kot">
            <Button className="relative gap-2 bg-primary hover:bg-primary/90 shadow-md">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
              <span className="font-medium">Kitchen Orders</span>
              {kotCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs border-2 border-background"
                >
                  {kotCount}
                </Badge>
              )}
            </Button>
          </NavLink>

          {/* Additional Actions - could be added later */}
          <Button variant="outline" size="sm" className="gap-2">
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </Button>
        </div>
      </div>

      {/* Optional: Order Type Info Bar (can be shown conditionally) */}
      <div className="px-6 py-2 bg-muted/20 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Active Service:</span>
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faUtensils} className="h-3 w-3 text-primary" />
              <span className="font-medium">Dine In Service</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Available Tables</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Occupied Tables</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeNavbar;
