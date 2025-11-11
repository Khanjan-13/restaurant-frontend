import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Coffee, UtensilsCrossed, Home } from "lucide-react";

const CustomerOrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchOrderStatus();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrderStatus, 10000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customer/order-status/${orderId}`);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order status:", error);
      setLoading(false);
      toast.error("Failed to load order status");
    }
  };

  const getStatusIcon = (orderType) => {
    // Since we removed orderStatus, show icon based on order type
    return <CheckCircle className="text-green-500" size={24} />;
  };

  const getStatusColor = (orderType) => {
    // Show as confirmed for all QR orders
    return "bg-green-100 text-green-800";
  };

  const statusSteps = [
    { status: "RECEIVED", label: "Order Received" },
    { status: "CONFIRMED", label: "Confirmed" },
    { status: "PREPARING", label: "Being Prepared" },
  ];

  const getCurrentStepIndex = () => {
    // All QR orders are at least confirmed
    return 1; // Show as confirmed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Order not found</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Order #{order.tokenNumber}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Table {order.tableNumber}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.orderType)} px-4 py-2 text-sm font-semibold`}>
                Order Confirmed
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6">Order Progress</h3>
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const currentIndex = getCurrentStepIndex();
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={step.status} className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      } ${isCurrent ? "ring-4 ring-green-200" : ""}`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={24} />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          isCompleted ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-green-600">In progress...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-3 last:border-b-0"
                >
                  <div>
                    <p className="font-semibold">{item.itemName}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.itemQuantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹{item.itemPrice * item.itemQuantity}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        {order.customer && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-semibold">Name:</span> {order.customer.name}</p>
                <p><span className="font-semibold">Phone:</span> {order.customer.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate(`/customer/menu/${localStorage.getItem("customerTableId")}`)}
            variant="outline"
            className="flex-1"
          >
            <Home className="mr-2" size={16} />
            Back to Menu
          </Button>
          <Button onClick={fetchOrderStatus} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderStatus;
