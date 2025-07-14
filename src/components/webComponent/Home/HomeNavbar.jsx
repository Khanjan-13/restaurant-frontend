import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHourglass2,
  faPlus,
  faCircle,
  faCodeFork,
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
  return (
    <div>
      <div className=" flex justify-between items-center gap-2 ">
        <div className="flex items-center ml-5 gap-3">
          <NavLink to="/"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center  text-[#333] p-2 px-4 ${
                isActive
                  ? "border-b-4  font-medium border-[#4caf50] text-[#4caf50] bg-gray-100"
                  : "hover:text-[#4caf50] hover:border-b-2 border-[#4caf50] "
              }`
            }
          >
            <img src="Home/dinein.png" className="w-10 h-10" /> DINE IN
          </NavLink>
          <NavLink to="/pickup"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center  text-[#333] p-2 ${
                isActive
                  ? "border-b-2 rounded-none font-medium border-[#4caf50] text-[#4caf50] "
                  : "hover:text-[#4caf50] hover:border-b-2 border-[#4caf50] "
              }`
            }
          >
            <img src="Home/parcel.png" className="w-10 h-10" /> PICK UP
          </NavLink>
          <NavLink to="/delivery"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center text-[#333] p-2 ${
                isActive
                  ? "border-b-2 rounded-none font-medium border-[#4caf50] text-[#4caf50] "
                  : "hover:text-[#4caf50] hover:border-b-2 border-[#4caf50] "
              }`
            }
          >
            <img src="Home/delivery.png" className="w-10 h-10" /> DELIVERY
          </NavLink>
        </div>
        <div className="flex gap-2 mr-3">
          <NavLink
            to="/kot"
            className="text-white p-2 rounded-md font-medium bg-[#4caf50] hover:bg-[#419844]"
          >
            <FontAwesomeIcon icon={faHourglass2} className="h-4 w-4 mr-1" />
            KOT
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default HomeNavbar;
