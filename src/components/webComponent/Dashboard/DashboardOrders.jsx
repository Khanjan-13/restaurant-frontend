import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import axios from "axios";
import toast from "react-hot-toast";

import { NavLink } from "react-router-dom";

function DashboardOrders() {
  const [orders, setOrders] = useState([]); // State to store fetched orders
  const [filteredOrders, setFilteredOrders] = useState([]); // State for filtered orders
  const [error, setError] = useState(""); // State for error message
  const [selectedFilter, setSelectedFilter] = useState(""); // State for filter
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming you have a token in localStorage
        if (!token) {
          throw new Error(
            "Authentication token is missing. Please log in again."
          );
        }

        const response = await axios.get(
          `${BASE_URL}/dashboard/orderFetch`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Fetched Orders:", response.data);

        if (response.data) {
          setOrders(response.data); // Set the orders directly if it's already an array
          setFilteredOrders(response.data); // Initialize filtered orders
        } else {
          setOrders([]);
          setFilteredOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders. Please try again.");
      }
    };

    fetchOrders();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Filter logic
  const handleFilterChange = (event) => {
    const filter = event.target.value;
    setSelectedFilter(filter);

    if (filter) {
      const filtered = orders.filter(
        (order) => order.paymentMethod?.toLowerCase() === filter.toLowerCase()
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders); // Reset to all orders if no filter is selected
    }
  };

  return (
    <div>
      <div className="flex ml-56 min-h-screen flex-col bg-muted/40 pt-5">
        <main className="grid flex-1 items-start mx-10 md:mx-30 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex justify-between items-center text-md font-medium w-full">
                <div>Orders History</div>
                <div>
                  <select
                    className="p-1.5 border border-gray-300 rounded-md text-sm"
                    aria-label="Filter by category"
                    value={selectedFilter}
                    onChange={handleFilterChange}
                  >
                    <option value="">Filter by Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="text-red-500">{error}</div>}{" "}
              {/* Display error message if any */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center p-2">Order No.</TableHead>
                    <TableHead className="text-center p-2">
                      Order Type
                    </TableHead>
                    <TableHead className="text-center p-2">
                      Customer Name
                    </TableHead>
                    <TableHead className="text-center p-2">
                      Customer Phone
                    </TableHead>
                    <TableHead className="text-center p-2">
                      Payment Mode
                    </TableHead>
                    <TableHead className="text-center p-2">Total</TableHead>
                    <TableHead className="text-center p-2">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center p-2">
                          {order.tokenNumber || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium p-2">
                          <div>
                            {order.tableNumber === "PICK UP"
                              ? "PICK UP"
                              : `Dine in : ${
                                  order.tableNumber || "N/A"
                                }`}{" "}
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          {order.customerName || ""}
                        </TableCell>
                        <TableCell className="p-2">
                          {order.customerPhone || ""}
                        </TableCell>
                        <TableCell className="p-2">
                          {order.paymentMethod || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium p-2">
                          {order.totalAmount || 0}
                        </TableCell>
                        <TableCell className="p-2">
                          {new Date(order.createdAt).toLocaleString() || "N/A"}
                        </TableCell>
                        <TableCell className="p-2 font-semibold">
                          <NavLink
                            to={`/dashboard/view-orders/${order._id}`}
                            className="text-blue-500 mx-1"
                          >
                            View
                          </NavLink>{" "}
                          |
                          <NavLink className="text-green-500 mx-1">
                            Reprint
                          </NavLink>{" "}
                          |
                          <NavLink className="text-red-500 mx-1">
                            Cancel
                          </NavLink>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="8" className="text-center p-2">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default DashboardOrders;
