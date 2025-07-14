import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import KotNavbar from "./KotNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

function Kot() {
  const [kotItems, setKotItems] = useState([]);
  const [timers, setTimers] = useState({}); // To store elapsed time for each KOT
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchKotItems = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/home/getallkot`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      // Grouping items by tokenNumber
      const groupedItems = data.reduce((acc, item) => {
        if (!acc[item.tokenNumber]) {
          acc[item.tokenNumber] = [];
        }
        acc[item.tokenNumber].push(item);
        return acc;
      }, {});

      setKotItems(groupedItems);

      // Initialize timers for newly fetched items
      const initialTimers = {};
      data.forEach((item) => {
        initialTimers[item.tokenNumber] =
          Date.now() - new Date(item.createdAt).getTime();
      });
      setTimers(initialTimers);
    } catch (error) {
      console.log("Error fetching KOT items:", error);
    }
  };

  const handleDeleteItem = async (tokenNumber) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.delete(`${BASE_URL}/home/deleteKot`, {
        data: { tokenNumber }, // ✅ Sending tokenNumber to backend
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message);
      fetchKotItems();

      // ✅ Remove from kotItems state
      setKotItems((prevKotItems) => {
        const updatedKotItems = { ...prevKotItems };
        delete updatedKotItems[tokenNumber];
        return updatedKotItems;
      });

      // ✅ Remove from timers state
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        delete updatedTimers[tokenNumber];
        return updatedTimers;
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item.");
    }
  };

  useEffect(() => {
    fetchKotItems();

    // Optional: Set up periodic updates (e.g., every 30 seconds)
    const interval = setInterval(fetchKotItems, 30000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Timer update logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        for (const tokenNumber in updatedTimers) {
          updatedTimers[tokenNumber] += 1000; // Increment elapsed time by 1 second
        }
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} m : ${seconds} s`;
  };

  return (
    <div className="pt-12 flex flex-1 flex-col">
      <KotNavbar />
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5 p-5 ml-32">
        {Object.entries(kotItems).map(([tokenNumber, items]) => (
          <Card key={tokenNumber}>
            <CardHeader className="bg-[#4caf50] flex flex-col">
              <CardTitle className="text-white">
                {items[0]?.tableNumber === "PICK UP"
                  ? "PICK UP"
                  : `Table No. ${items[0]?.tableNumber}`}
              </CardTitle>
              <CardTitle className="text-white flex justify-between items-center">
                {formatTime(timers[tokenNumber] || 0)}
                <button
                  className="text-red-500 rounded transition duration-200 ease-in-out"
                  onClick={() => handleDeleteItem(tokenNumber)} // ✅ Pass tokenNumber
                >
                  <FontAwesomeIcon icon={faCircleXmark} className="text-2xl" />
                </button>
              </CardTitle>
            </CardHeader>

            <div className="bg-[#ededed]">
              <CardDescription className="font-medium">
                Token No. {tokenNumber}
              </CardDescription>
            </div>

            <CardContent>
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="text-gray-500">Qty</span>
              </div>
              <Separator />
              {items.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span className="font-medium">{item.itemName}</span>
                    <span className="font-medium">{item.itemQuantity}</span>
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Kot;
