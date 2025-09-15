import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

function OrdersBillingStaff({ orderItems, setOrderItems }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { tableId } = location.state || {}; // Retrieve tableId from location.state

    const [diningMode, setDiningMode] = useState(tableId ? "DINE IN" : "PICK UP");
    const [tableOrders, setTableOrders] = useState([]);
    const [paymentMode, setPaymentMode] = useState(null); // State to track payment mode
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const printKot = (tokenNumber, kotItems, totalAmount, diningMode) => {
        const printWindow = window.open("", "_blank");
        const currentDateTime = new Date().toLocaleString();

        const kotHTML = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              font-size: 14px;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
            }
            .kot-details {
              margin-bottom: 20px;
            }
            .kot-details p {
              margin: 5px 0;
            }
            .kot-items {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .kot-items th,
            .kot-items td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .kot-items th {
              background-color: #f4f4f4;
            }
            .total {
              font-weight: bold;
              text-align: right;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              border-top: 1px solid #ddd;
              padding-top: 10px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Restaurant Name</h1>
            <p>123 Food Street, City Name</p>
            <p>${currentDateTime}</p>
          </div>
          <div class="kot-details">
            <p><strong>Token Number:</strong> ${tokenNumber}</p>
            <p><strong>Dining Mode:</strong> ${diningMode}</p>
          </div>
          <table class="kot-items">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${kotItems
                .map(
                    (item) => `
                  <tr>
                    <td>${item.itemName}</td>
                    <td>${item.itemQuantity}</td>
                    <td>${item.itemPrice.toFixed(2)}</td>
                    <td>${item.itemCategory}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            <p>Total Amount: ₹${totalAmount.toFixed(2)}</p>
          </div>
          <div class="footer">
            <p>Thank you for your order!</p>
          </div>
        </body>
      </html>
    `;

        printWindow.document.write(kotHTML);
        printWindow.document.close();
        printWindow.print();
    };

    // Function to handle printing the order
    const printOrder = (orderDetails) => {
        const printWindow = window.open("", "_blank");
        const { tokenNumber, items, totalAmount, paymentMethod, tableNumber } =
            orderDetails;

        const orderHtml = `
    <html>
    <head>
      <title>Order Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .total { font-weight: bold; text-align: right; }
      </style>
    </head>
    <body>
      <h1>Order Receipt</h1>
      <p><strong>Token Number:</strong> ${tokenNumber}</p>
      <p><strong>Table Number:</strong> ${tableNumber}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items
                .map(
                    (item) => `
            <tr>
              <td>${item.itemName}</td>
              <td>${item.itemPrice}</td>
              <td>${item.itemQuantity}</td>
              <td>${item.itemPrice * item.itemQuantity}</td>
            </tr>
          `
                )
                .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="total">Grand Total:</td>
            <td class="total">${totalAmount}</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;

        printWindow.document.write(orderHtml);
        printWindow.document.close();
        printWindow.print();
    };

    useEffect(() => {
        const fetchTableOrders = async () => {
            try {
                const token = localStorage.getItem("token");

                // Check if the token is missing
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
                    setTableOrders(response.data); // Set fetched orders to state
                }
            } catch (error) {
                console.error("Error fetching table orders:", error);
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

            // 1️⃣ Call the deleteSingleKot API first
            const response = await axios.delete(`${BASE_URL}/home/deleteSingleKot`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    itemId, // send the _id of the item to delete
                },
            });

            console.log("Delete API response:", response.data);

            // 2️⃣ Now update state (remove from UI)
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
            alert("Failed to delete item. Please try again.");
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

    // console.log("Subtotal:", subtotal);
    // console.log("Tax:", tax);
    // console.log("Total:", total);

    const handleSubmitKot = async (action) => {
        try {
            const token = localStorage.getItem("token");

            // Check if the token is missing
            if (!token) {
                toast.error("Authentication token is missing. Please log in again.");
                return;
            }

            // Fetch the latest token number from the backend
            const response = await axios.get(`${BASE_URL}/home/getLatestKot`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Extract the latest token number, default to 0 if no tokens exist
            const latestToken = response.data?.latestToken ?? 0;
            const newTokenNumber = latestToken + 1;

            // Prepare the KOT items for submission
            const kotItems = orderItems.map((item) => ({
                itemName: item.name,
                itemPrice: item.price,
                itemQuantity: item.quantity,
                itemCategory: item.category,
                tableNumber: diningMode === "PICK UP" ? "PICK UP" : tableId,
                orderStatus: true,
            }));

            // Submit the KOT with the incremented token number
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

            // Show success message
            toast.success(`KOT submitted successfully! Token #${newTokenNumber}`);

            // Check if the action is "print"
            if (action === "print") {
                printKot(newTokenNumber, kotItems, total, diningMode);
            }
        } catch (error) {
            console.error("Error submitting KOT:", error);
            toast.error("Failed to submit KOT");
        }
        navigate("/staff/table");
    };

    return (
        <div className="bg-background shadow-lg rounded-none px-4 py-4 flex flex-col md:w-[32rem] w-full border border-border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className={`px-4 py-2 transition-colors duration-200 ${
                            diningMode === "DINE IN"
                                ? "bg-[#4caf50] text-white border-[#4caf50] hover:bg-[#419844]"
                                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        }`}
                        onClick={() => handleDiningModeChange("DINE IN")}
                    >
                        DINE IN
                    </Button>
                </div>
                <div className="flex flex-col">
                    {diningMode === "DINE IN" ? (
                        <span className="text-base font-semibold text-foreground">
                            Table No. {tableId || "PICK UP"}
                        </span>
                    ) : (
                        <span className="text-base font-semibold text-foreground">PICK UP</span>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <div className="w-[50%] flex justify-center">
                    <h3 className="text-sm font-semibold text-foreground">Items</h3>
                </div>
                <div className="w-[30%] flex justify-center">
                    <h3 className="text-sm font-semibold text-foreground">Quantity</h3>
                </div>
                <div className="w-[20%] hidden md:flex justify-center">
                    <h3 className="text-sm font-semibold text-foreground">Price</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 border border-border rounded-md px-3 py-3 h-96 overflow-y-auto scrollbar-thin bg-muted/20">
                {tableOrders.length > 0 ? (
                    tableOrders.map((item, index) => (
                        <div key={`table-order-${index}`}>
                            <div className="flex items-center justify-between">
                                {/* Remove Button */}
                                <div className="flex w-[10%] justify-center items-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="px-2 border-red-200 hover:bg-red-50 hover:border-red-300"
                                        onClick={() => handleDeleteRemove(index, true, item._id)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className="h-3 w-3 text-red-500"
                                        />
                                    </Button>
                                </div>
                                {/* Item Name */}
                                <div className="flex w-[50%] justify-center items-center gap-2">
                                    <h3 className="text-sm font-medium text-foreground">{item.itemName}</h3>
                                </div>
                                {/* Quantity Controls */}
                                <div className="flex items-center w-[30%] justify-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="px-2 border-border hover:bg-muted"
                                        onClick={() => handleDecrement(index, true)}
                                    >
                                        -
                                    </Button>
                                    <input
                                        type="number"
                                        value={item.itemQuantity}
                                        onChange={(e) => handleQuantityChange(index, e.target.value, true)}
                                        onFocus={(e) => e.target.select()}
                                        className="text-sm font-medium w-12 text-center border border-border rounded bg-background focus:border-[#4caf50] focus:ring-[#4caf50]"
                                        min="1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="px-2 border-border hover:bg-muted"
                                        onClick={() => handleIncrement(index, true)}
                                    >
                                        +
                                    </Button>
                                </div>
                                {/* Total Price */}
                                <div className="hidden md:flex w-[20%] justify-center items-center">
                                    <h3 className="text-sm font-semibold text-[#4caf50]">
                                        ₹{(item.itemPrice * item.itemQuantity).toFixed(2)}
                                    </h3>
                                </div>
                            </div>
                            <Separator className="mt-1" />
                        </div>
                    ))
                ) : (
                    <p></p>
                )}
                {orderItems.map((item, index) => (
                    <div key={`order-item-${index}`}>
                        <div className="flex items-center justify-between">
                            {/* Remove Button */}
                            <div className="flex w-[10%] justify-center items-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-2 border-red-200 hover:bg-red-50 hover:border-red-300"
                                    onClick={() => handleRemove(index, false)}
                                >
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="h-3 w-3 text-red-500"
                                    />
                                </Button>
                            </div>
                            {/* Item Name */}
                            <div className="flex w-[50%] justify-center items-center gap-2">
                                <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                            </div>
                            {/* Quantity Controls */}
                            <div className="flex items-center w-[30%] justify-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-2 border-border hover:bg-muted"
                                    onClick={() => handleDecrement(index, false)}
                                >
                                    -
                                </Button>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(index, e.target.value, false)}
                                    onFocus={(e) => e.target.select()}
                                    className="text-sm font-medium w-12 text-center border border-border rounded bg-background focus:border-[#4caf50] focus:ring-[#4caf50]"
                                    min="1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-2 border-border hover:bg-muted"
                                    onClick={() => handleIncrement(index, false)}
                                >
                                    +
                                </Button>
                            </div>
                            {/* Total Price */}
                            <div className="hidden md:flex w-[20%] justify-center items-center">
                                <h3 className="text-sm font-semibold text-[#4caf50]">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </h3>
                            </div>
                        </div>
                        <Separator className="mt-1" />
                    </div>
                ))}
            </div>

            <Separator className="my-4" />
            <div className="hidden md:grid gap-3 bg-muted/30 p-4 rounded-md">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Subtotal:</span>
                    <span className="text-sm font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Tax (5%):</span>
                    <span className="text-sm font-semibold text-foreground">₹{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground">Total Payable Amount:</span>
                    <span className="text-lg font-bold text-[#4caf50]">₹{total.toFixed(2)}</span>
                </div>

                <div className="flex bg-muted py-3 justify-evenly rounded-md">
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="cash"
                            name="payment"
                            value="Cash"
                            className="h-4 w-4 text-[#4caf50] focus:ring-[#4caf50]"
                            onChange={(e) => setPaymentMode(e.target.value)}
                        />
                        <label htmlFor="cash" className="text-sm font-medium text-foreground">
                            Cash
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="upi"
                            name="payment"
                            value="UPI"
                            className="h-4 w-4 text-[#4caf50] focus:ring-[#4caf50]"
                            onChange={(e) => setPaymentMode(e.target.value)}
                        />
                        <label htmlFor="upi" className="text-sm font-medium text-foreground">
                            UPI
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="card"
                            name="payment"
                            value="Card"
                            className="h-4 w-4 text-[#4caf50] focus:ring-[#4caf50]"
                            onChange={(e) => setPaymentMode(e.target.value)}
                        />
                        <label htmlFor="card" className="text-sm font-medium text-foreground">
                            Card
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-between gap-3">
                <Button
                    className="md:w-1/2 w-full bg-[#4caf50] hover:bg-[#419844] text-white font-semibold py-2 transition-colors duration-200"
                    onClick={() => handleSubmitKot()}
                    data-kot="running"
                >
                    KOT
                </Button>
                <Button
                    className="md:w-1/2 w-full bg-[#4caf50] hover:bg-[#419844] text-white font-semibold py-2 transition-colors duration-200"
                    onClick={() => handleSubmitKot("print")}
                    data-kot="running"
                >
                    KOT & Print
                </Button>
            </div>
        </div>
    );
}

export default OrdersBillingStaff;