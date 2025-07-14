import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
function DashboardOrdersView() {
  const { id } = useParams(); // Retrieve the order ID from the route
  const [order, setOrder] = useState(null); // State to store the order details
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  console.log("Order ID:", id);

  useEffect(() => {
    const fetchOrderDetails = async (orderId) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "Authentication token is missing. Please log in again."
          );
        }

        const response = await axios.get(
          `${BASE_URL}/dashboard/orderFetchById/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Order Details:", response.data);
        if (response.data) {
          setOrder(response.data); // Store the order details
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        // setError(err.message || "Failed to fetch order details.");
      }
    };

    if (id) {
      fetchOrderDetails(id); // Pass the ID to the function
    }
  }, [id]); // Dependency array ensures it runs when `id` changes




  if (!order) {
    return <div className="text-center">No order details found.</div>;
  }

  return (
    <div>
      <div className="flex ml-56 min-h-screen flex-col bg-muted/40 pt-5">
        <main className="grid flex-1 items-start mx-10 md:mx-30 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card className="rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Orders Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center p-2">Item Name</TableHead>
                    <TableHead className="text-center p-2">Quantity</TableHead>
                    <TableHead className="text-center p-2">Price</TableHead>
                    <TableHead className="text-center p-2">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.length > 0 ? (
                    order.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center border border-gray-300 p-2">
                          {item.itemName}
                        </TableCell>
                        <TableCell className="text-center border border-gray-300 p-2">
                          {item.itemQuantity || 0}
                        </TableCell>
                        <TableCell className="text-center border border-gray-300 p-2">
                          ₹{item.itemPrice?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-center border border-gray-300 p-2">
                          ₹
                          {(item.itemQuantity * item.itemPrice || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center border border-gray-300 p-2"
                      >
                        No items in this order.
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Subtotal Row */}
                  <TableRow className="bg-green-100">
                    <TableCell
                      className="text-right border border-green-500  font-semibold p-2"
                      colSpan={3}
                    >
                      Subtotal:
                    </TableCell>
                    <TableCell className="text-center border border-green-500  p-2">
                      {/* ₹ */}
                      {/* {order.items
                        ?.reduce(
                          (acc, item) =>
                            acc + (item.itemQuantity * item.itemPrice || 0),
                          0
                        )
                        .toFixed(2) || "0.00"} */}
                    </TableCell>
                  </TableRow>

                  {/* Tax Row */}
                  <TableRow className="bg-green-100">
                    <TableCell
                      className="text-right border border-green-500 font-semibold p-2"
                      colSpan={3}
                    >
                      Tax (10%):
                    </TableCell>
                    <TableCell className="text-center border border-green-500  p-2">
                      {/* ₹
                      {order.items?.reduce(
                        (acc, item) =>
                          acc + (item.itemQuantity * item.itemPrice || 0),
                        0
                      ) * 0.1 || "0.00"} */}
                    </TableCell>
                  </TableRow>

                  {/* Discount Row */}
                  <TableRow className="bg-green-100">
                    <TableCell
                      className="text-right border border-green-500  font-semibold p-2"
                      colSpan={3}
                    >
                      Discount:
                    </TableCell>
                    <TableCell className="text-center border border-green-500  p-2">
                      {/* Add discount logic here, if applicable */}
                      {/* -₹{discount?.toFixed(2) || "0.00"} */}
                    </TableCell>
                  </TableRow>

                  {/* Final Total Row (using totalAmount from API response) */}
                  <TableRow className="bg-green-300">
                    <TableCell
                      className="text-right border border-green-500 font-bold p-2"
                      colSpan={3}
                    >
                      Final Total:
                    </TableCell>
                    <TableCell className="text-center border border-green-500 font-bold p-2">
                      ₹{order.totalAmount?.toFixed(2) || "0.00"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default DashboardOrdersView;
