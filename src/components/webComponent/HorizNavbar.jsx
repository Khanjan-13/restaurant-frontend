import React, { useState, useEffect } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserCircle,
  faFileLines,
  faChartLine,
  faSignOutAlt,
  faKey,
  faEdit,
  faBars,
  faUtensils,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function HorizNavbar() {
  const navigate = useNavigate();
  const [ownerName, setOwnerName] = useState("");
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOwnerName = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/signup/getUser`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOwnerName(response.data.user.ownerName);
      } catch (err) {
        console.error("Error fetching owner name:", err);
        setError("Failed to fetch owner name.");
      }
    };

    fetchOwnerName();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Menubar className="justify-between w-full fixed top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Brand Section */}
          <div className="flex items-center gap-4 px-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Table No. 21</h1>
                <p className="text-xs text-muted-foreground">Dining Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <MenubarMenu>
              <NavLink to="/" className={navLinkClass}>
                <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
                Home
              </NavLink>
            </MenubarMenu>

            <MenubarMenu>
              <NavLink to="/orders" className={navLinkClass}>
                <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4" />
                Orders
              </NavLink>
            </MenubarMenu>

            <MenubarMenu>
              <NavLink to="/dashboard" className={navLinkClass}>
                <FontAwesomeIcon icon={faChartLine} className="h-4 w-4" />
                Dashboard
              </NavLink>
            </MenubarMenu>

            {/* User Menu */}
            <MenubarMenu>
              <MenubarTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserCircle} className="h-4 w-4 text-primary" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">
                    {error ? "Error" : ownerName || "Loading..."}
                  </p>
                  <p className="text-xs text-muted-foreground">Restaurant Owner</p>
                </div>
              </MenubarTrigger>
              <MenubarContent align="end" className="w-56">
                <MenubarItem className="font-medium">
                  <FontAwesomeIcon icon={faUserCircle} className="h-4 w-4 mr-2" />
                  Hello, {error ? "User" : ownerName || "Loading..."}!
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                  <FontAwesomeIcon icon={faKey} className="h-4 w-4 mr-2" />
                  Change Password
                </MenubarItem>
                <MenubarItem>
                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4 mr-2" />
                  Edit Profile
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 mr-2" />
                  Logout
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </div>
        </Menubar>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">Table No. 21</h1>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-10 w-10 p-0"
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)} />
        )}

        {/* Mobile Menu Drawer */}
        <div className={`fixed top-0 right-0 z-50 h-full w-80 bg-background border-l transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserCircle} className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{error ? "Error" : ownerName || "Loading..."}</p>
                  <p className="text-sm text-muted-foreground">Restaurant Owner</p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex-1 px-4 py-6 space-y-2">
              <NavLink 
                to="/" 
                className={mobileNavLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faHome} className="h-5 w-5" />
                Home
              </NavLink>
              
              <NavLink 
                to="/orders" 
                className={mobileNavLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
                Orders
              </NavLink>
              
              <NavLink 
                to="/dashboard" 
                className={mobileNavLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
                Dashboard
              </NavLink>
            </div>

            {/* Mobile Menu Footer */}
            <div className="border-t p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <FontAwesomeIcon icon={faKey} className="h-4 w-4" />
                Change Password
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HorizNavbar;
