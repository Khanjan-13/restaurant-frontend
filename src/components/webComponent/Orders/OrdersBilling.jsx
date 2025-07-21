import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrash, 
  faPlus, 
  faMinus, 
  faUtensils, 
  faShoppingBag, 
  faCreditCard,
  faMoneyBill,
  faMobileAlt,
  faPrint,
  faReceipt,
  faCalculator,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { printKot, printOrderReceipt } from "@/utils/printUtils";

function OrdersBilling({ orderItems, setOrderItems }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { tableId } = location.state || {};

  const [diningMode, setDiningMode] = useState(tableId ? "DINE IN" : "PICK UP");
  const [tableOrders, setTableOrders] = useState([]);
  const [paymentMode, setPaymentMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTableOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Authentication token is missing. Please log in again.");
          return;
        }

        if (tableId) {
          const response = await axios.get(
            `${BASE_URL}/orders/order-status/${tableId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setTableOrders(response.data);
        }
      } catch (error) {
        console.error("Error fetching table orders:", error);
        toast.error("Failed to fetch table orders");
      } finally {
        setLoading(false);
      }
    };

    fetchTableOrders();
  }, [tableId]);

  useEffect(() => {
    if (tableId) {
      setDiningMode("DINE IN");
    }
  }, [tableId]);

  useEffect(() => {
    if (!location.state || !location.state.tableId) {
      setDiningMode("PICK UP");
    }
  }, [location]);

  const handleDiningModeChange = (mode) => {
    if (mode === "DINE IN" && !tableId) {
      navigate("/");
    } else {
      setDiningMode(mode);
    }
  };

  const handleIncrement = (index, isTableOrder = false) => {
    if (isTableOrder) {
      const updatedTableOrders = [...tableOrders];
      updatedTableOrders[index].itemQuantity += 1;
      setTableOrders(updatedTableOrders);
    } else {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[index].quantity += 1;
      setOrderItems(updatedOrderItems);
    }
  };

  const handleDecrement = (index, isTableOrder = false) => {
    if (isTableOrder) {
      const updatedTableOrders = [...tableOrders];
      if (updatedTableOrders[index].itemQuantity > 1) {
        updatedTableOrders[index].itemQuantity -= 1;
        setTableOrders(updatedTableOrders);
      }
    } else {
      const updatedOrderItems = [...orderItems];
      if (updatedOrderItems[index].quantity > 1) {
        updatedOrderItems[index].quantity -= 1;
        setOrderItems(updatedOrderItems);
      }
    }
  };

  const handleRemove = (index, isTableOrder = false) => {
    if (isTableOrder) {
      const updatedTableOrders = [...tableOrders];
      updatedTableOrders.splice(index, 1);
      setTableOrders(updatedTableOrders);
    } else {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems.splice(index, 1);
      setOrderItems(updatedOrderItems);
    }
  };

  const handleDeleteRemove = async (index, isTableOrder = false, itemId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(`${BASE_URL}/home/deleteSingleKot`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          itemId,
        },
      });

      console.log("Delete API response:", response.data);
      toast.success("Item removed successfully");

      if (isTableOrder) {
        const updatedTableOrders = [...tableOrders];
        updatedTableOrders.splice(index, 1);
        setTableOrders(updatedTableOrders);
      } else {
        const updatedOrderItems = [...orderItems];
        updatedOrderItems.splice(index, 1);
        setOrderItems(updatedOrderItems);
      }
    } catch (error) {
      console.error("Error deleting KOT item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleQuantityChange = (index, value, isTableOrder = false) => {
    const quantity = Math.max(1, Number(value));
    if (isTableOrder) {
      const updatedTableOrders = [...tableOrders];
      updatedTableOrders[index].itemQuantity = quantity;
      setTableOrders(updatedTableOrders);
    } else {
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[index].quantity = quantity;
      setOrderItems(updatedOrderItems);
    }
  };

  // Calculate subtotal, tax, and total
  const subtotal =
    (Array.isArray(tableOrders)
      ? tableOrders.reduce(
          (acc, item) => acc + item.itemPrice * item.itemQuantity,
          0
        )
      : 0) +
    (Array.isArray(orderItems)
      ? orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
      : 0);

  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleSubmitKot = async (action) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/home/getLatestKot`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const latestToken = response.data?.latestToken ?? 0;
      const newTokenNumber = latestToken + 1;

      const kotItems = orderItems.map((item) => ({
        itemName: item.name,
        itemPrice: item.price,
        itemQuantity: item.quantity,
        itemCategory: item.category,
        tableNumber: diningMode === "PICK UP" ? "PICK UP" : tableId,
        orderStatus: true,
      }));

      await axios.post(
        `${BASE_URL}/home/kot`,
        {
          tokenNumber: newTokenNumber,
          items: kotItems,
          totalAmount: total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`KOT submitted successfully! Token #${newTokenNumber}`);

      if (action === "print") {
        printKot(newTokenNumber, kotItems, total, diningMode, tableId);
      }
    } catch (error) {
      console.error("Error submitting KOT:", error);
      toast.error("Failed to submit KOT");
    } finally {
      setLoading(false);
    }
    navigate("/");
  };

  const handleSaveOrder = async (action) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      if (!paymentMode) {
        toast.error("Please select a payment mode.");
        return;
      }

      const pickupTableNumber = "PICK UP";

      const kotApiUrl = `${BASE_URL}/home/getKotByTableNumber/${
        tableId ?? pickupTableNumber
      }`;
      const kotResponse = await axios.get(kotApiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const kotData = kotResponse?.data?.aggregatedItems;

      if (!kotData || !Array.isArray(kotData) || kotData.length === 0) {
        toast.error("No items found for this table.");
        return;
      }

      const orderItemsData = kotData.map((item) => ({
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQuantity: item.itemQuantity,
        itemCategory: item.itemCategory || "",
        itemDescription: item.itemDescription || "",
      }));

      const currentDate = new Date();
      const datePrefix =
        currentDate.getDate().toString().padStart(2, "0") +
        (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const dailyCounterKey = `dailyCounter_${datePrefix}`;

      let dailyCounter = parseInt(
        localStorage.getItem(dailyCounterKey) || "1",
        10
      );
      const tokenNumber = `${datePrefix}${dailyCounter}`;
      localStorage.setItem(dailyCounterKey, (dailyCounter + 1).toString());

      const payload = {
        tokenNumber,
        items: orderItemsData,
        totalAmount: total,
        paymentMethod: paymentMode,
        tableNumber: diningMode === "PICK UP" ? "PICK UP" : tableId,
      };

      const orderSaveUrl = `${BASE_URL}/dashboard/orderSave`;
      await axios.post(orderSaveUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updateKotUrl = `${BASE_URL}/home/updateKot`;
      await axios.put(
        updateKotUrl,
        { tableNumber: payload.tableNumber, orderStatus: false },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const deleteKotUrl = `${BASE_URL}/home/deleteKot`;
      await axios.delete(deleteKotUrl, {
        data: { tableNumber: payload.tableNumber },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order saved successfully!");

      if (action === "print") {
        printOrderReceipt(payload);
      }
      navigate("/");
    } catch (error) {
      console.error("Error saving the order or deleting the KOT:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.errorMessage || "An error occurred.");
      } else {
        toast.error(
          "Failed to save the order. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const allItems = [...tableOrders, ...orderItems];
  const hasItems = allItems.length > 0;

  const paymentMethods = [
    { id: "Cash", label: "Cash", icon: faMoneyBill, color: "text-green-600" },
    { id: "UPI", label: "UPI", icon: faMobileAlt, color: "text-blue-600" },
    { id: "Card", label: "Card", icon: faCreditCard, color: "text-purple-600" },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <Card className="border-b border-0 shadow-sm rounded-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faShoppingBag} className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Order Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {diningMode === "DINE IN" ? `Table ${tableId}` : "Pickup Order"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              <FontAwesomeIcon 
                icon={diningMode === "PICK UP" ? faShoppingBag : faLocationDot} 
                className="h-3 w-3 mr-1" 
              />
              {diningMode}
            </Badge>
          </div>
          
          {/* Dining Mode Toggle */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={diningMode === "DINE IN" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => handleDiningModeChange("DINE IN")}
            >
              <FontAwesomeIcon icon={faUtensils} className="h-4 w-4" />
              DINE IN
            </Button>
            <Button
              variant={diningMode === "PICK UP" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => handleDiningModeChange("PICK UP")}
            >
              <FontAwesomeIcon icon={faShoppingBag} className="h-4 w-4" />
              PICK UP
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Items List */}
      <div className="flex-1 overflow-auto">
        <Card className="border-0 shadow-none rounded-none">
          <CardHeader className="pb-3">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-1"></div>
              <div className="col-span-5">Item</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Price</div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {loading && (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faUtensils} className="h-6 w-6 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground mt-2">Loading items...</p>
              </div>
            )}

            {/* Table Orders */}
            {tableOrders.map((item, index) => (
              <div key={`table-order-${index}`} className="p-3 rounded-lg bg-muted/30 border">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Remove Button */}
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={() => handleDeleteRemove(index, true, item._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Item Name */}
                  <div className="col-span-5">
                    <p className="font-medium text-sm">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">₹{item.itemPrice} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDecrement(index, true)}
                      >
                        <FontAwesomeIcon icon={faMinus} className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.itemQuantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value, true)}
                        className="w-16 h-8 text-center text-sm"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleIncrement(index, true)}
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="col-span-3 text-right">
                    <p className="font-semibold">₹{(item.itemPrice * item.itemQuantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* New Order Items */}
            {orderItems.map((item, index) => (
              <div key={`order-item-${index}`} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Remove Button */}
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={() => handleRemove(index, false)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Item Name */}
                  <div className="col-span-5">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDecrement(index, false)}
                      >
                        <FontAwesomeIcon icon={faMinus} className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value, false)}
                        className="w-16 h-8 text-center text-sm"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleIncrement(index, false)}
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="col-span-3 text-right">
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

            {!hasItems && !loading && (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No items in cart</p>
                <p className="text-sm text-muted-foreground">Add items from the menu to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Billing Summary */}
      {hasItems && (
        <Card className="border-0 border-t shadow-sm rounded-none">
          <CardContent className="pt-4">
            {/* Bill Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Tax (5%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalculator} className="h-4 w-4" />
                  Total:
                </span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-3">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={paymentMode === method.id ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setPaymentMode(method.id)}
                  >
                    <FontAwesomeIcon 
                      icon={method.icon} 
                      className={`h-3 w-3 ${paymentMode === method.id ? '' : method.color}`} 
                    />
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                onClick={() => handleSubmitKot()}
                disabled={!hasItems || loading}
                className="gap-2"
                variant="outline"
              >
                <FontAwesomeIcon icon={faReceipt} className="h-4 w-4" />
                <span className="hidden sm:inline">KOT</span>
              </Button>
              
              <Button
                onClick={() => handleSubmitKot("print")}
                disabled={!hasItems || loading}
                className="gap-2"
                variant="outline"
              >
                <FontAwesomeIcon icon={faPrint} className="h-4 w-4" />
                <span className="hidden sm:inline">KOT & Print</span>
              </Button>
              
              <Button
                onClick={() => handleSaveOrder()}
                disabled={!hasItems || !paymentMode || loading}
                className="gap-2"
              >
                <FontAwesomeIcon icon={faReceipt} className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              
              <Button
                onClick={() => handleSaveOrder("print")}
                disabled={!hasItems || !paymentMode || loading}
                className="gap-2"
              >
                <FontAwesomeIcon icon={faPrint} className="h-4 w-4" />
                <span className="hidden sm:inline">Save & Print</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OrdersBilling;
