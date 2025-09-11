import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { Switch } from "@/components/ui/switch";

function KotStaff() {
    const [kotItems, setKotItems] = useState([]);
    const [timers, setTimers] = useState({});
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // ✅ Load saved states from localStorage
    const getSavedState = (itemId) => {
        const saved = localStorage.getItem(`kot_item_${itemId}`);
        return saved === "true";
    };

    // ✅ Toggle state and persist in localStorage
    const toggleCompleted = (itemId) => {
        const current = getSavedState(itemId);
        console.log(`Toggling item ${itemId} to ${!current}`);
        localStorage.setItem(`kot_item_${itemId}`, !current);
    };

    const fetchKotItems = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Authentication token is missing. Please log in again.");
                return;
            }

            const response = await axios.get(`${BASE_URL}/home/getallkot`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = response.data;

            // Group items by tokenNumber
            const groupedItems = data.reduce((acc, item) => {
                if (!acc[item.tokenNumber]) acc[item.tokenNumber] = [];
                acc[item.tokenNumber].push(item);
                return acc;
            }, {});

            setKotItems(groupedItems);

            // Initialize timers
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
                data: { tokenNumber },
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success(response.data.message);
            fetchKotItems();

            // Remove from kotItems
            setKotItems((prev) => {
                const updated = { ...prev };
                delete updated[tokenNumber];
                return updated;
            });

            // Remove from timers
            setTimers((prev) => {
                const updated = { ...prev };
                delete updated[tokenNumber];
                return updated;
            });

            // ✅ Clear related localStorage switches
            Object.values(kotItems[tokenNumber] || []).forEach((item) => {
                const itemId = item._id || item.id;
                localStorage.removeItem(`kot_item_${itemId}`);
            });

        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Error deleting item.");
        }
    };

    useEffect(() => {
        fetchKotItems();
        const interval = setInterval(fetchKotItems, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimers((prev) => {
                const updated = { ...prev };
                for (const token in updated) {
                    updated[token] += 1000;
                }
                return updated;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes} m : ${seconds} s`;
    };

    return (
        <div className="pt-12 flex flex-1 flex-col">
            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5 p-5 ml-32">
                {Object.entries(kotItems)
                    .filter(([_, items]) => items.some((item) => item.isKot))
                    .map(([tokenNumber, items]) => (
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
                                        onClick={() => handleDeleteItem(tokenNumber)}
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
                                    <span className="text-gray-500">Done</span>
                                </div>
                                <Separator />
                                {items
                                    .filter((item) => item.isKot)
                                    .map((item) => {
                                        const itemId = item._id || item.id; // ✅ fallback for safety
                                        const isCompleted = getSavedState(itemId);
                                        return (
                                            <div key={itemId}>
                                                <div className="flex justify-between items-center">
                                                        <span
                                                            className={`font-medium ${isCompleted ? "line-through text-gray-400" : ""
                                                                }`}
                                                        >
                                                            {item.itemName}
                                                        </span>
                                                    <span className="font-medium"> {item.itemQuantity}</span>
                                                    <Switch
                                                        checked={isCompleted}
                                                        onCheckedChange={() => toggleCompleted(itemId)}
                                                    />
                                                </div>
                                                <Separator />
                                            </div>
                                        );
                                    })}

                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    );
}

export default KotStaff;
