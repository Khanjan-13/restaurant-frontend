import React from 'react'
import { NavLink } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleLeft,
  faDatabase,
  faHome,
  faListDots,
  faMoneyBill,
  faPencil,
  faPenToSquare,
  faPlus,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
function KotNavbar() {
  return (
    <div>
       <aside className="hidden w-32 flex-col border-r p-4 sm:flex dark:bg-[#1a1a1a]  fixed overflow-y-auto h-[90vh] scrollbar-thin">
        <nav className="flex flex-col gap-2  ">
          <NavLink
            to="/"
            end
            className={
              `justify-start text-left text-[#333] p-2 border-l-2 rounded-none font-medium border-[#4caf50] bg-[#e0e0e0] dark:text-[#ccc]`
            }
          >
            <FontAwesomeIcon icon={faCircleLeft} className="h-4 w-4 mx-2" />
            Back
          </NavLink>
          {/* <NavLink
            to="/dashboard/orders"
            className={({ isActive }) =>
              `justify-start text-left text-[#333] p-2 ${
                isActive
                  ? "border-l-2 rounded-none border-[#4caf50] bg-[#e0e0e0] dark:text-[#ccc]"
                  : "hover:bg-[#e0e0e0] dark:text-[#ccc] dark:hover:bg-[#333]"
              }`
            }
          >
            <FontAwesomeIcon icon={faListDots} className="h-4 w-4 mx-2" />
            Orders
          </NavLink>{" "}
      
          <Separator />
          <div className="justify-start text-left font-bold pl-2  text-[#4caf50]">
            MENU
          </div>
          <NavLink
            to="/dashboard/menu"
            className={({ isActive }) =>
              `justify-start text-left text-[#333] p-2 ${
                isActive
                  ? "border-l-2 rounded-none border-[#4caf50] bg-[#e0e0e0] dark:text-[#ccc]"
                  : "hover:bg-[#e0e0e0] dark:text-[#ccc] dark:hover:bg-[#333]"
              }`
            }
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mx-2" />
            Add Menu
          </NavLink>
          <NavLink
            to="/dashboard/menu-manage"
            className={({ isActive }) =>
              `justify-start text-left text-[#333] p-2 ${
                isActive
                  ? "border-l-2 rounded-none border-[#4caf50] bg-[#e0e0e0] dark:text-[#ccc]"
                  : "hover:bg-[#e0e0e0] dark:text-[#ccc] dark:hover:bg-[#333]"
              }`
            }
          >
            <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4 mx-2" />
            Manage
          </NavLink>
          <Separator />
          <div className="justify-start text-left font-bold pl-2  text-[#4caf50]">
            STAFF
          </div>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `justify-start text-left text-[#333] p-2 ${
                isActive
                  ? "border-l-2 rounded-none border-[#4caf50] bg-[#e0e0e0] dark:text-[#ccc]"
                  : "hover:bg-[#e0e0e0] dark:text-[#ccc] dark:hover:bg-[#333]"
              }`
            }
          >
            <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4 mx-2" />
            Add Staff
          </NavLink>{" "}
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `justify-start text-left text-[#333] p-2 ${
                isActive
                  ? "border-l-2 rounded-none border-[#4caf50] bg-[#e0e0e0] dark:text-[#ccc]"
                  : "hover:bg-[#e0e0e0] dark:text-[#ccc] dark:hover:bg-[#333]"
              }`
            }
          >
            <FontAwesomeIcon icon={faPencil} className="h-4 w-4 mx-2" />
            Attendence
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `justify-start text-left text-[#333] p-2 ${
                isActive
                  ? "border-l-2 rounded-none border-[#4caf50] bg-[#e0e0e0] dark:text-[#ccc]"
                  : "hover:bg-[#e0e0e0] dark:text-[#ccc] dark:hover:bg-[#333]"
              }`
            }
          >
            <FontAwesomeIcon icon={faMoneyBill} className="h-4 w-4 mx-2" />
            Salary
          </NavLink> */}
          <Separator />
         
        </nav>
      </aside>
    </div>
  )
}

export default KotNavbar
