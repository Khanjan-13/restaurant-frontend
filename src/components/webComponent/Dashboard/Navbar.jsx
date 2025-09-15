import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faHome,
  faListDots,
  faMoneyBill,
  faPencil,
  faPenToSquare,
  faPlus,
  faUserPlus,
  faUtensils,
  faBars,
  faX,
  faChevronDown,
  faUsers,
  faBoxes,
  faUserFriends
} from "@fortawesome/free-solid-svg-icons";

function Navbar() {
  const currentUser = useMemo(() => {
    const token = localStorage.getItem("token");
    const parseJwt = (tkn) => {
      try {
        const base64Url = tkn.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(jsonPayload);
      } catch {
        return {};
      }
    };
    const userObj = (() => {
      try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
    })();
    const decoded = token ? parseJwt(token) : {};
    return {
      id: decoded?.id || decoded?._id || decoded?.adminId || userObj?._id || userObj?.id || null,
      name: userObj?.name || decoded?.name || decoded?.username || "",
      email: userObj?.email || decoded?.email || "",
    };
  }, []);
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    menu: false,
    staff: false,
    inventory: false
  });

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    // Close all expanded menus when collapsing sidebar
    if (isExpanded) {
      setExpandedMenus({ menu: false, staff: false, inventory: false });
    }
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25"
        : "text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:text-green-700 hover:shadow-sm"
    } ${!isExpanded ? "justify-center px-2" : ""}`;

  const menuHeaderClass = `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 text-green-700 cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 ${!isExpanded ? "justify-center px-2" : ""}`;

  return (
    <>
      {/* Mobile Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside 
        className={`fixed left-0 top-0 z-50 h-full border-r border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-xl transition-all duration-300 ease-in-out ${
          isExpanded ? "w-72" : "w-16"
        } ${isExpanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100/30 px-4">
          {isExpanded && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Table No 21
                </h1>
                <p className="text-xs text-gray-600">Restaurant Management</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 lg:flex hidden hover:bg-green-100 hover:text-green-700 transition-all"
          >
            <FontAwesomeIcon icon={isExpanded ? faX : faBars} className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-6">
          <nav className="space-y-3 px-3">
            {/* Main Navigation */}
            <div className="space-y-1">
              <NavLink to="/dashboard" end className={navLinkClass}>
                <FontAwesomeIcon icon={faHome} className="h-4 w-4 shrink-0" />
                {isExpanded && <span>Dashboard</span>}
              </NavLink>
              
              <NavLink to="/dashboard/orders" className={navLinkClass}>
                <FontAwesomeIcon icon={faListDots} className="h-4 w-4 shrink-0" />
                {isExpanded && <span>Orders</span>}
              </NavLink>
              
              <NavLink to="/dashboard/tables" className={navLinkClass}>
                <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 shrink-0" />
                {isExpanded && <span>Tables</span>}
              </NavLink>
            </div>

            <Separator className="my-4 bg-gradient-to-r from-transparent via-green-200 to-transparent" />

            {/* Menu Management */}
            <div className="space-y-1">
              <div
                className={menuHeaderClass}
                onClick={() => isExpanded && toggleMenu('menu')}
              >
                <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 shrink-0" />
                {isExpanded && (
                  <>
                    <span className="flex-1">Menu</span>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`h-3 w-3 transition-transform ${expandedMenus.menu ? 'rotate-180' : ''}`} 
                    />
                  </>
                )}
              </div>
              
              {(expandedMenus.menu && isExpanded) && (
                <div className="ml-6 space-y-1">
                  <NavLink to="/dashboard/menu" className={navLinkClass}>
                    <FontAwesomeIcon icon={faPlus} className="h-4 w-4 shrink-0" />
                    <span>Add Menu</span>
                  </NavLink>
                  <NavLink to="/dashboard/menu-manage" className={navLinkClass}>
                    <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4 shrink-0" />
                    <span>Manage</span>
                  </NavLink>
                </div>
              )}
            </div>

            <Separator className="my-4 bg-gradient-to-r from-transparent via-green-200 to-transparent" />

            {/* Staff Management */}
            <div className="space-y-1">
              <div
                className={menuHeaderClass}
                onClick={() => isExpanded && toggleMenu('staff')}
              >
                <FontAwesomeIcon icon={faUsers} className="h-4 w-4 shrink-0" />
                {isExpanded && (
                  <>
                    <span className="flex-1">Staff</span>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`h-3 w-3 transition-transform ${expandedMenus.staff ? 'rotate-180' : ''}`} 
                    />
                  </>
                )}
              </div>
              
              {(expandedMenus.staff && isExpanded) && (
                <div className="ml-6 space-y-1">
                  <NavLink to="/dashboard/staff" end className={navLinkClass}>
                    <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4 shrink-0" />
                    <span>Add Staff</span>
                  </NavLink>
                  <NavLink to="/dashboard/staff/attendance" className={navLinkClass}>
                    <FontAwesomeIcon icon={faPencil} className="h-4 w-4 shrink-0" />
                    <span>Attendance</span>
                  </NavLink>
                  <NavLink to="/dashboard/staff/salary" className={navLinkClass}>
                    <FontAwesomeIcon icon={faMoneyBill} className="h-4 w-4 shrink-0" />
                    <span>Salary</span>
                  </NavLink>
                </div>
              )}
            </div>

            <Separator className="my-4 bg-gradient-to-r from-transparent via-green-200 to-transparent" />

            {/* Inventory Management */}
            <div className="space-y-1">
              <div
                className={menuHeaderClass}
                onClick={() => isExpanded && toggleMenu('inventory')}
              >
                <FontAwesomeIcon icon={faBoxes} className="h-4 w-4 shrink-0" />
                {isExpanded && (
                  <>
                    <span className="flex-1">Inventory</span>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`h-3 w-3 transition-transform ${expandedMenus.inventory ? 'rotate-180' : ''}`} 
                    />
                  </>
                )}
              </div>
              
              {(expandedMenus.inventory && isExpanded) && (
                <div className="ml-6 space-y-1">
                  <NavLink to="/dashboard/inventory-manage" className={navLinkClass}>
                    <FontAwesomeIcon icon={faPlus} className="h-4 w-4 shrink-0" />
                    <span>Manage</span>
                  </NavLink>
                  <NavLink to="/dashboard/inventory-report" className={navLinkClass}>
                    <FontAwesomeIcon icon={faPencil} className="h-4 w-4 shrink-0" />
                    <span>Reports</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* <Separator className="my-4 bg-gradient-to-r from-transparent via-green-200 to-transparent" /> */}

            {/* Customer Management */}
            <div className="space-y-1">
              <NavLink to="/dashboard/customers" className={navLinkClass}>
                <FontAwesomeIcon icon={faUserFriends} className="h-4 w-4 shrink-0" />
                {isExpanded && <span>Customers</span>}
              </NavLink>
            </div>

            <Separator className="my-4 bg-gradient-to-r from-transparent via-green-200 to-transparent" />

            {/* System */}
            <div className="space-y-1">
              <NavLink to="/dashboard/backup" className={navLinkClass}>
                <FontAwesomeIcon icon={faDatabase} className="h-4 w-4 shrink-0" />
                {isExpanded && <span>Backup & Restore</span>}
              </NavLink>
            </div>
          </nav>
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-green-50 to-green-100/30">
            <div className="flex items-center gap-3 rounded-lg bg-white/80 backdrop-blur-sm p-3 shadow-sm border border-green-200/50">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-semibold">
                  {(currentUser?.name || currentUser?.email || "?").slice(0,1).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-gray-800">{currentUser?.name || "User"}</p>
                <p className="text-xs text-gray-600 truncate">{currentUser?.email || ""}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10 p-0 bg-white border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 shadow-lg transition-all"
      >
        <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
      </Button>
    </>
  );
}

export default Navbar;
