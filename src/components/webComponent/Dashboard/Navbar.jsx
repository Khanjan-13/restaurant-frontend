import React, { useState } from "react";
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
  faBoxes
} from "@fortawesome/free-solid-svg-icons";

function Navbar() {
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
    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    } ${!isExpanded ? "justify-center px-2" : ""}`;

  const menuHeaderClass = `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 text-primary cursor-pointer hover:bg-accent/50 ${!isExpanded ? "justify-center px-2" : ""}`;

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
        className={`fixed left-0 top-0 z-50 h-full border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-72" : "w-16"
        } ${isExpanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
          {isExpanded && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T21</span>
              </div>
              <div>
                <h1 className="font-semibold text-lg">Table No. 21</h1>
                <p className="text-xs text-muted-foreground">Dining Management</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 lg:flex hidden"
          >
            <FontAwesomeIcon icon={isExpanded ? faX : faBars} className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-6">
          <nav className="space-y-2 px-3">
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

            <Separator className="my-4" />

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

            <Separator className="my-4" />

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
                  <NavLink to="/dashboard/staff" className={navLinkClass}>
                    <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4 shrink-0" />
                    <span>Add Staff</span>
                  </NavLink>
                  <NavLink to="/attendance" className={navLinkClass}>
                    <FontAwesomeIcon icon={faPencil} className="h-4 w-4 shrink-0" />
                    <span>Attendance</span>
                  </NavLink>
                  <NavLink to="/salary" className={navLinkClass}>
                    <FontAwesomeIcon icon={faMoneyBill} className="h-4 w-4 shrink-0" />
                    <span>Salary</span>
                  </NavLink>
                </div>
              )}
            </div>

            <Separator className="my-4" />

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
                  <NavLink to="/inventory-manage" className={navLinkClass}>
                    <FontAwesomeIcon icon={faPlus} className="h-4 w-4 shrink-0" />
                    <span>Manage</span>
                  </NavLink>
                  <NavLink to="/inventory-attendance" className={navLinkClass}>
                    <FontAwesomeIcon icon={faPencil} className="h-4 w-4 shrink-0" />
                    <span>Reports</span>
                  </NavLink>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* System */}
            <div className="space-y-1">
              <NavLink to="/backup" className={navLinkClass}>
                <FontAwesomeIcon icon={faDatabase} className="h-4 w-4 shrink-0" />
                {isExpanded && <span>Backup & Restore</span>}
              </NavLink>
            </div>
          </nav>
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="border-t border-border/40 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-semibold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@tableno21.com</p>
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
        className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10 p-0"
      >
        <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
      </Button>
    </>
  );
}

export default Navbar;
