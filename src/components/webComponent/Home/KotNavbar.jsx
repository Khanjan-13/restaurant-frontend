import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faUtensils,
  faArrowLeft,
  faRefresh,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

function KotNavbar() {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <NavLink to="/" className="gap-2">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </NavLink>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Kitchen Orders</h1>
              <p className="text-sm text-muted-foreground">Manage pending orders</p>
            </div>
          </div>
        </div>

        {/* Right Section - Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">&lt; 5 min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-muted-foreground">5-10 min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">&gt; 10 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KotNavbar;
