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
import ProfileEdit from "./Profile/ProfileEdit";

function HorizNavbar() {
  const navigate = useNavigate();
  const [ownerName, setOwnerName] = useState("");
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
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

  const handleProfileUpdate = (newOwnerName) => {
    setOwnerName(newOwnerName);
    setIsProfileEditOpen(false);
  };

  const handleEditProfile = () => {
    setIsProfileEditOpen(true);
  };

  const handleChangePassword = () => {
    setIsProfileEditOpen(true);
  };

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25"
        : "text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:text-green-700 hover:shadow-sm"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
        : "text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:text-green-700"
    }`;

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Menubar className="justify-between w-full fixed top-0 z-50 h-16 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-lg">
          {/* Brand Section */}
          <div className="flex items-center gap-4 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faUtensils} className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Table No 21
                </h1>
                <p className="text-xs text-gray-600">Restaurant Management System</p>
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
              <MenubarTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-green-50 hover:text-green-700 transition-all">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-sm">
                  <FontAwesomeIcon icon={faUserCircle} className="h-4 w-4 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {error ? "Error" : ownerName || "Loading..."}
                  </p>
                  <p className="text-xs text-gray-600">Restaurant Owner</p>
                </div>
              </MenubarTrigger>
              <MenubarContent align="end" className="w-56 bg-white border border-gray-200 shadow-xl rounded-lg">
                <MenubarItem className="font-semibold text-green-700 hover:bg-green-50">
                  <FontAwesomeIcon icon={faUserCircle} className="h-4 w-4 mr-2" />
                  Hello, {error ? "User" : ownerName || "Loading..."}!
                </MenubarItem>
                <MenubarSeparator className="bg-gray-200" />
                <MenubarItem 
                  onClick={handleChangePassword}
                  className="hover:bg-green-50 text-gray-700 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faKey} className="h-4 w-4 mr-2" />
                  Change Password
                </MenubarItem>
                <MenubarItem 
                  onClick={handleEditProfile}
                  className="hover:bg-green-50 text-gray-700 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4 mr-2" />
                  Edit Profile
                </MenubarItem>
                <MenubarSeparator className="bg-gray-200" />
                <MenubarItem 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-md">
                <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Table No 21
                </h1>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-10 w-10 p-0 hover:bg-green-50 hover:text-green-700 transition-all"
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
        <div className={`fixed top-0 right-0 z-50 h-full w-80 bg-white border-l border-gray-200 shadow-xl transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-sm">
                  <FontAwesomeIcon icon={faUserCircle} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{error ? "Error" : ownerName || "Loading..."}</p>
                  <p className="text-sm text-gray-600">Restaurant Owner</p>
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
            <div className="border-t border-gray-200 p-4 space-y-2 bg-gradient-to-r from-green-50 to-green-100/30">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover:bg-green-100 hover:text-green-700 transition-all"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleChangePassword();
                }}
              >
                <FontAwesomeIcon icon={faKey} className="h-4 w-4" />
                Change Password
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover:bg-green-100 hover:text-green-700 transition-all"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleEditProfile();
                }}
              >
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
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

      {/* Profile Edit Dialog */}
      <ProfileEdit
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        onUpdate={handleProfileUpdate}
      />
    </>
  );
}

export default HorizNavbar;
