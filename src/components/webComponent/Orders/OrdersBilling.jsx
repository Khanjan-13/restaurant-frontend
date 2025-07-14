import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

function OrdersBilling({ orderItems, setOrderItems }) {
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
    navigate("/");
  };

  const handleSaveOrder = async (action) => {
    try {
      // Step 1: Check for authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      // Step 2: Validate payment mode
      if (!paymentMode) {
        toast.error("Please select a payment mode.");
        return;
      }

      const pickupTableNumber = "PICK UP";

      // Step 3: Fetch order items from the KOT API
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

      // Step 4: Generate token number based on today's date
      const currentDate = new Date();
      const datePrefix =
        currentDate.getDate().toString().padStart(2, "0") +
        (currentDate.getMonth() + 1).toString().padStart(2, "0"); // DDMM format
      const dailyCounterKey = `dailyCounter_${datePrefix}`;

      let dailyCounter = parseInt(
        localStorage.getItem(dailyCounterKey) || "1",
        10
      );
      const tokenNumber = `${datePrefix}${dailyCounter}`;
      localStorage.setItem(dailyCounterKey, (dailyCounter + 1).toString());

      // Step 5: Prepare the payload
      const payload = {
        tokenNumber, // Use the generated token number
        items: orderItemsData,
        totalAmount: total, // Ensure `total` is calculated and passed correctly
        paymentMethod: paymentMode,
        tableNumber: diningMode === "PICK UP" ? "PICK UP" : tableId,
      };

      // Step 6: Submit the order
      const orderSaveUrl = `${BASE_URL}/dashboard/orderSave`;
      await axios.post(orderSaveUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Step 7: Update the table's order status
      const updateKotUrl = `${BASE_URL}/home/updateKot`;
      await axios.put(
        updateKotUrl,
        { tableNumber: payload.tableNumber, orderStatus: false },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Step 8: Delete the KOT record
      const deleteKotUrl = `${BASE_URL}/home/deleteKot`;
      await axios.delete(deleteKotUrl, {
        data: { tableNumber: payload.tableNumber },
        headers: { Authorization: `Bearer ${token}` },
      });

      // Step 9: Show success message
      toast.success("Order saved and KOT deleted successfully!", {
        style: {
          marginTop: "40px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        },
      });

      // Step 10: Print the order if action === "print"
      if (action === "print") {
        printOrder(payload);
      }
      navigate("/");
    } catch (error) {
      console.error("Error saving the order or deleting the KOT:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.errorMessage || "An error occurred.");
      } else {
        toast.error(
          "Failed to save the order or delete the KOT. Please try again."
        );
      }
    }
  };

  return (
    <div className="bg-background shadow-lg rounded-none px-2 py-2 flex flex-col md:w-[32rem] h-[93vh] w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className={`px-2 ${
              diningMode === "DINE IN"
                ? "bg-[#4caf50] text-white"
                : "bg-gray-200 text-black"
            }`}
            onClick={() => handleDiningModeChange("DINE IN")}
          >
            DINE IN
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`px-2 ${
              diningMode === "PICK UP"
                ? "bg-[#4caf50] text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleDiningModeChange("PICK UP")}
          >
            PICK UP
          </Button>
        </div>
        <div className="flex flex-col">
          {diningMode === "DINE IN" ? (
            <span className="text-base">
              Table No. {tableId || "PICK UP"} {/* Display tableId */}
            </span>
          ) : (
            <span className="text-base">PICK UP</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between bg-[#d7d7d7]">
        <div className="w-[50%] flex justify-center">
          <h3 className="text-base font-medium">Items</h3>
        </div>
        <div className="w-[30%] flex justify-center">
          <h3 className="text-base font-medium">Quantity</h3>
        </div>
        <div className="w-[20%] hidden md:flex justify-center">
          <h3 className="text-base font-medium">Price</h3>
        </div>
      </div>

      <div className="flex flex-col space-y-4 border-2 px-2 py-2 h-96 overflow-y-auto scrollbar-thin">
        {tableOrders.length > 0 ? (
          tableOrders.map((item, index) => (
            <div key={`table-order-${index}`}>
              <div className="flex items-center justify-between">
                {/* Remove Button */}
                <div className="flex w-[10%] justify-center items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2"
                    onClick={() => handleDeleteRemove(index, true, item._id)} // Pass true for tableOrders
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="h-3 w-3 text-[#4caf50]"
                    />
                  </Button>
                </div>
                {/* Item Name */}
                <div className="flex w-[50%] justify-center items-center gap-2">
                  <h3 className="text-sm font-medium">{item.itemName}</h3>
                </div>
                {/* Quantity Controls */}
                <div className="flex items-center w-[30%] justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2 "
                    onClick={() => handleDecrement(index, true)} // Pass true for tableOrders
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    value={item.itemQuantity}
                    onChange={
                      (e) => handleQuantityChange(index, e.target.value, true) // Pass true for tableOrders
                    }
                    onFocus={(e) => e.target.select()}
                    className="text-base font-medium w-12 text-center border border-gray-300 rounded"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2"
                    onClick={() => handleIncrement(index, true)} // Pass true for tableOrders
                  >
                    +
                  </Button>
                </div>
                {/* Total Price */}
                <div className="hidden md:flex w-[20%] justify-center items-center">
                  <h3 className="text-sm font-medium">
                    {(item.itemPrice * item.itemQuantity).toFixed(2)}₹
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
                  className="px-2"
                  onClick={() => handleRemove(index, false)} // Pass false for orderItems
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="h-3 w-3 text-[#4caf50]"
                  />
                </Button>
              </div>
              {/* Item Name */}
              <div className="flex w-[50%] justify-center items-center gap-2">
                <h3 className="text-sm font-medium">{item.name}</h3>
              </div>
              {/* Quantity Controls */}
              <div className="flex items-center w-[30%] justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={() => handleDecrement(index, false)} // Pass false for orderItems
                >
                  -
                </Button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(index, e.target.value, false)
                  } // Pass false for orderItems
                  onFocus={(e) => e.target.select()}
                  className="text-base font-medium w-12 text-center border border-gray-300 rounded"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={() => handleIncrement(index, false)} // Pass false for orderItems
                >
                  +
                </Button>
              </div>
              {/* Total Price */}
              <div className="hidden md:flex w-[20%] justify-center items-center">
                <h3 className="text-sm font-medium">
                  {(item.price * item.quantity).toFixed(2)}₹
                </h3>
              </div>
            </div>
            <Separator className="mt-1" />
          </div>
        ))}
      </div>

      <Separator className="my-2" />
      <div className="hidden md:grid gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Subtotal:</span>
          <span className="text-sm font-medium">{subtotal.toFixed(2)}₹</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tax:</span>
          <span className="text-sm font-medium">{tax.toFixed(2)}₹</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-medium">Total Payable Amount:</span>
          <span className="text-base font-medium">{total.toFixed(2)}₹</span>
        </div>

        <div className="flex bg-[#f0f0f0] py-2 justify-evenly">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="cash"
              name="payment"
              value="Cash"
              className="form-radio h-4 w-4 text-blue-600"
              onChange={(e) => setPaymentMode(e.target.value)} // Set payment mode on change
            />
            <label htmlFor="cash" className="text-sm font-medium">
              Cash
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="upi"
              name="payment"
              value="UPI"
              className="form-radio h-4 w-4 text-blue-600"
              onChange={(e) => setPaymentMode(e.target.value)} // Set payment mode on change
            />
            <label htmlFor="upi" className="text-sm font-medium">
              UPI
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="card"
              name="payment"
              value="Card"
              className="form-radio h-4 w-4 text-blue-600"
              onChange={(e) => setPaymentMode(e.target.value)} // Set payment mode on change
            />
            <label htmlFor="card" className="text-sm font-medium">
              Card
            </label>
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between gap-2">
        <Button
          className="md:w-1/4 w-full bg-[#4caf50] hover:bg-[#419844]"
          onClick={() => handleSubmitKot()}
          data-kot="running"
        >
          KOT
        </Button>
        <Button
          className="md:w-1/4 w-full bg-[#4caf50] hover:bg-[#419844]"
          onClick={() => handleSubmitKot("print")}
          data-kot="running"
        >
          KOT & Print
        </Button>
        <Button
          className="hidden md:block w-1/4 bg-[#4caf50] hover:bg-[#419844] "
          onClick={() => handleSaveOrder()}
        >
          Save
        </Button>
        <Button
          className="hidden md:block w-1/4 bg-[#4caf50] hover:bg-[#419844]"
          onClick={() => handleSaveOrder("print")}
        >
          Save & Print
        </Button>
      </div>
    </div>
  );
}

export default OrdersBilling;
