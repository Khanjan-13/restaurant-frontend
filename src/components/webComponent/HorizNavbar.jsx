import React, { useState, useEffect } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserCircle,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function HorizNavbar() {
  const navigate = useNavigate();
  const [ownerName, setOwnerName] = useState(""); // State to store the owner name
  const [error, setError] = useState(null); // State to handle errors
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOwnerName = async () => {
      try {
        const token = localStorage.getItem("token"); // Fetch token if required for authentication

        // Make the API call to get user data
        const response = await axios.get(`${BASE_URL}/signup/getUser`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers if required
          },
        });

        // Extract ownerName from the response and update state
        setOwnerName(response.data.user.ownerName);
        // console.log(response.data.user.ownerName);
      } catch (err) {
        console.error("Error fetching owner name:", err);
        setError("Failed to fetch owner name."); // Set error state if the API call fails
      }
    };

    fetchOwnerName();
  }, []); // Empty dependency array ensures this runs only once on mount
  const handleLogout = () => {
    // Remove login status
    localStorage.removeItem("token");
    // window.location.reload();
    // Navigate to the login page
    navigate("/login");
  };

  return (
    <>
      <Menubar className="hidden md:flex justify-between w-full fixed h-12 z-10">
        <div className="text-xl font-extrabold ml-3 text-[#43a047]">
          Table No. 21
        </div>
        <div className="flex gap-1">
          <MenubarMenu>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `justify-start text-left text-[#333] p-2 ${
                  isActive
                    ? "border-b-2 rounded-none font-medium border-[#4caf50] text-[#4caf50] "
                    : "hover:text-[#4caf50] hover:border-b-2 border-[#4caf50] "
                }`
              }
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Home
            </NavLink>
          </MenubarMenu>{" "}
          <MenubarMenu>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `justify-start text-left text-[#333] p-2 ${
                  isActive
                    ? "border-b-2 rounded-none font-medium border-[#4caf50] text-[#4caf50] "
                    : "hover:text-[#4caf50] hover:border-b-2 border-[#4caf50] "
                }`
              }
            >
              <FontAwesomeIcon icon={faFileLines} className="mr-2" />
              Orders
            </NavLink>
          </MenubarMenu>
          <MenubarMenu>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `justify-start text-left text-[#333] p-2 ${
                  isActive
                    ? "border-b-2 rounded-none font-medium border-[#4caf50] text-[#4caf50] "
                    : "hover:text-[#4caf50] hover:border-b-2 border-[#4caf50] "
                }`
              }
            >
              {/* <FontAwesomeIcon icon={faDashcube}  className="mr-2" />              */}
              Dashboard
            </NavLink>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem inset className="font-medium ">
                Hello!{" "}
                <span className="ml-1 uppercase">
                  {error ? "Error" : ownerName}{" "}
                </span>
                {/* Show name, error, or loading */}{" "}
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem inset>Change Password</MenubarItem>
              <MenubarItem inset>Edit Info</MenubarItem>
              <MenubarSeparator />
              <MenubarItem inset onClick={handleLogout}>
                Logout
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </div>
      </Menubar>
    </>
  );
}

export default HorizNavbar;
