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
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const kotHTML = `
      <html>
        <head>
          <title>KOT - Token #${tokenNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; }
              .receipt { width: 80mm; margin: 0 auto; }
            }
            
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 10px;
              background: #f5f5f5;
              font-size: 12px;
              line-height: 1.2;
            }
            
            .receipt {
              background: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 80mm;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px dashed #333;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            
            .restaurant-name {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
              color: #333;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .restaurant-tagline {
              font-size: 10px;
              color: #666;
              margin: 5px 0;
              font-style: italic;
            }
            
            .address {
              font-size: 10px;
              color: #666;
              margin: 5px 0;
            }
            
            .contact {
              font-size: 10px;
              color: #666;
              margin: 5px 0;
            }
            
            .receipt-type {
              background: #333;
              color: white;
              padding: 5px 10px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              margin: 10px 0;
              border-radius: 4px;
            }
            
            .kot-details {
              margin: 15px 0;
              border: 1px solid #ddd;
              padding: 10px;
              border-radius: 4px;
            }
            
            .kot-details p {
              margin: 3px 0;
              font-size: 11px;
            }
            
            .kot-details strong {
              color: #333;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            
            .items-table th {
              background: #f8f8f8;
              border-bottom: 1px solid #ddd;
              padding: 8px 4px;
              text-align: left;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .items-table td {
              padding: 6px 4px;
              border-bottom: 1px dotted #eee;
              font-size: 11px;
            }
            
            .item-name {
              font-weight: bold;
              color: #333;
            }
            
            .item-qty {
              text-align: center;
              color: #666;
            }
            
            .item-price {
              text-align: right;
              color: #333;
            }
            
            .total-section {
              border-top: 2px dashed #333;
              margin-top: 15px;
              padding-top: 10px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            
            .total-amount {
              font-size: 14px;
              font-weight: bold;
              color: #333;
            }
            
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px dashed #ddd;
            }
            
            .footer p {
              margin: 5px 0;
              font-size: 10px;
              color: #666;
            }
            
            .thank-you {
              font-size: 12px;
              font-weight: bold;
              color: #333;
              margin: 10px 0;
            }
            
            .timestamp {
              font-size: 9px;
              color: #999;
            }
            
            .divider {
              border-top: 1px dashed #ccc;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1 class="restaurant-name">Table No 21</h1>
              <p class="restaurant-tagline">Serving Happiness Since 2025</p>
              <p class="address">BVM College, Anand</p>
              <p class="contact">Phone: +91 7485906699 | Email: info@tableno21.com</p>
              <p class="timestamp">Date: ${currentDate} | Time: ${currentTime}</p>
            </div>
            
            <div class="receipt-type">KITCHEN ORDER TICKET</div>
            
            <div class="kot-details">
              <p><strong>Token No:</strong> #${tokenNumber.toString().padStart(4, '0')}</p>
              <p><strong>Mode:</strong> ${diningMode}</p>
              <p><strong>Table:</strong> ${diningMode === "PICK UP" ? "PICK UP" : tableId || "N/A"}</p>
              <p><strong>Server:</strong> ${localStorage.getItem('staffName') || 'Staff'}</p>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${kotItems
        .map(
          (item) => `
                  <tr>
                    <td class="item-name">${item.itemName}</td>
                    <td class="item-qty">${item.itemQuantity}</td>
                    <td class="item-price">₹${item.itemPrice.toFixed(2)}</td>
                  </tr>
                `
        )
        .join("")}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${(totalAmount / 1.05).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax (5%):</span>
                <span>₹${(totalAmount - (totalAmount / 1.05)).toFixed(2)}</span>
              </div>
              <div class="divider"></div>
              <div class="total-row total-amount">
                <span>TOTAL:</span>
                <span>₹${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="footer">
              <p class="thank-you">Thank You!</p>
              <p>Please wait while we prepare your order</p>
              <p>For any queries, contact our staff</p>
              <div class="divider"></div>
              <p>Generated by: Restaurant POS System</p>
              <p>${currentDateTime}</p>
            </div>
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
    const { tokenNumber, paymentMethod } = orderDetails;
    const currentDateTime = new Date().toLocaleString();
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const orderHtml = `
    <html>
    <head>
      <title>Order Receipt - Token #${tokenNumber}</title>
      <style>
        @media print {
          body { margin: 0; padding: 10px; }
          .receipt { width: 80mm; margin: 0 auto; }
        }
        
        body {
          font-family: 'Courier New', monospace;
          margin: 0;
          padding: 10px;
          background: #f5f5f5;
          font-size: 12px;
          line-height: 1.2;
        }
        
        .receipt {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 80mm;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px dashed #333;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .restaurant-tagline {
          font-size: 10px;
          color: #666;
          margin: 5px 0;
          font-style: italic;
        }
        
        .address {
          font-size: 10px;
          color: #666;
          margin: 5px 0;
        }
        
        .contact {
          font-size: 10px;
          color: #666;
          margin: 5px 0;
        }
        
        .receipt-type {
          background: #28a745;
          color: white;
          padding: 5px 10px;
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          margin: 10px 0;
          border-radius: 4px;
        }
        
        .order-details {
          margin: 15px 0;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 4px;
        }
        
        .order-details p {
          margin: 3px 0;
          font-size: 11px;
        }
        
        .order-details strong {
          color: #333;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        .items-table th {
          background: #f8f8f8;
          border-bottom: 1px solid #ddd;
          padding: 8px 4px;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .items-table td {
          padding: 6px 4px;
          border-bottom: 1px dotted #eee;
          font-size: 11px;
        }
        
        .item-name {
          font-weight: bold;
          color: #333;
        }
        
        .item-qty {
          text-align: center;
          color: #666;
        }
        
        .item-price {
          text-align: right;
          color: #333;
        }
        
        .item-total {
          text-align: right;
          color: #333;
          font-weight: bold;
        }
        
        .total-section {
          border-top: 2px dashed #333;
          margin-top: 15px;
          padding-top: 10px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 12px;
        }
        
        .total-amount {
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        
        .payment-info {
          background: #f8f8f8;
          padding: 10px;
          border-radius: 4px;
          margin: 15px 0;
          border: 1px solid #ddd;
        }
        
        .payment-info p {
          margin: 3px 0;
          font-size: 11px;
        }
        
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px dashed #ddd;
        }
        
        .footer p {
          margin: 5px 0;
          font-size: 10px;
          color: #666;
        }
        
        .thank-you {
          font-size: 12px;
          font-weight: bold;
          color: #333;
          margin: 10px 0;
        }
        
        .timestamp {
          font-size: 9px;
          color: #999;
        }
        
        .divider {
          border-top: 1px dashed #ccc;
          margin: 10px 0;
        }
        
        .gst-info {
          font-size: 9px;
          color: #666;
          text-align: center;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1 class="restaurant-name">Table No 21</h1>
          <p class="restaurant-tagline">Serving Happiness Since 2025</p>
          <p class="address">BVM College, Anand</p>
          <p class="contact">Phone: +91 7485906699 | Email: info@tableno21.com</p>
          <p class="timestamp">Date: ${currentDate} | Time: ${currentTime}</p>
        </div>
        
        <div class="receipt-type">CUSTOMER RECEIPT</div>
        
        <div class="order-details">
          <p><strong>Token No:</strong> #${tokenNumber.toString().padStart(4, '0')}</p>
          <p><strong>Mode:</strong> ${diningMode}</p>
          <p><strong>Table:</strong> ${diningMode === "PICK UP" ? "PICK UP" : tableId || "N/A"}</p>
          <p><strong>Server:</strong> ${localStorage.getItem('staffName') || 'Staff'}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${Array.isArray(tableOrders) ? tableOrders.map(
              (item) => `
              <tr>
                <td class="item-name">${item.itemName}</td>
                <td class="item-qty">${item.itemQuantity}</td>
                <td class="item-price">₹${item.itemPrice.toFixed(2)}</td>
                <td class="item-total">₹${(item.itemPrice * item.itemQuantity).toFixed(2)}</td>
              </tr>
            `
            ).join("") : ""}
            ${Array.isArray(orderItems) ? orderItems.map(
              (item) => `
              <tr>
                <td class="item-name">${item.name}</td>
                <td class="item-qty">${item.quantity}</td>
                <td class="item-price">₹${item.price.toFixed(2)}</td>
                <td class="item-total">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
            ).join("") : ""}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${(subtotal).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (5%):</span>
            <span>₹${tax.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="total-row total-amount">
            <span>TOTAL:</span>
            <span>₹${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="payment-info">
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Status:</strong> PAID</p>
          <p><strong>Transaction ID:</strong> ${Date.now().toString().slice(-8)}</p>
        </div>
        
        <div class="gst-info">
          GST No: 27ABCDE1234F1Z5 | PAN: ABCDE1234F
        </div>
        
        <div class="footer">
          <p class="thank-you">Thank You!</p>
          <p>Please visit us again</p>
          <p>For feedback: feedback@tableno21.com</p>
          <div class="divider"></div>
          <p>Generated by: Restaurant POS System</p>
          <p>${currentDateTime}</p>
        </div>
      </div>
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

  // const handleSaveOrder = async (action) => {
  //   try {
  //     // Step 1: Check for authentication token
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       toast.error("Authentication token is missing. Please log in again.");
  //       return;
  //     }

  //     // Step 2: Validate payment mode
  //     if (!paymentMode) {
  //       toast.error("Please select a payment mode.");
  //       return;
  //     }

  //     const pickupTableNumber = "PICK UP";

  //     // Step 3: Fetch order items from the KOT API
  //     const kotApiUrl = `${BASE_URL}/home/getKotByTableNumber/${
  //       tableId ?? pickupTableNumber
  //     }`;
  //     const kotResponse = await axios.get(kotApiUrl, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const kotData = kotResponse?.data?.aggregatedItems;

  //     if (!kotData || !Array.isArray(kotData) || kotData.length === 0) {
  //       toast.error("No items found for this table.");
  //       return;
  //     }

  //     const orderItemsData = kotData.map((item) => ({
  //       itemName: item.itemName,
  //       itemPrice: item.itemPrice,
  //       itemQuantity: item.itemQuantity,
  //       itemCategory: item.itemCategory || "",
  //       itemDescription: item.itemDescription || "",
  //     }));

  //     // Step 4: Generate token number based on today's date
  //     const currentDate = new Date();
  //     const datePrefix =
  //       currentDate.getDate().toString().padStart(2, "0") +
  //       (currentDate.getMonth() + 1).toString().padStart(2, "0"); // DDMM format
  //     const dailyCounterKey = `dailyCounter_${datePrefix}`;

  //     let dailyCounter = parseInt(
  //       localStorage.getItem(dailyCounterKey) || "1",
  //       10
  //     );
  //     const tokenNumber = `${datePrefix}${dailyCounter}`;
  //     localStorage.setItem(dailyCounterKey, (dailyCounter + 1).toString());

  //     // Step 5: Prepare the payload
  //     const payload = {
  //       tokenNumber, // Use the generated token number
  //       items: orderItemsData,
  //       totalAmount: total, // Ensure `total` is calculated and passed correctly
  //       paymentMethod: paymentMode,
  //       tableNumber: diningMode === "PICK UP" ? "PICK UP" : tableId,
  //     };

  //     // Step 6: Submit the order
  //     const orderSaveUrl = `${BASE_URL}/dashboard/orderSave`;
  //     await axios.post(orderSaveUrl, payload, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     // Step 7: Update the table's order status
  //     const updateKotUrl = `${BASE_URL}/home/updateKot`;
  //     await axios.put(
  //       updateKotUrl,
  //       { tableNumber: payload.tableNumber, orderStatus: false },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     // Step 8: Delete the KOT record
  //     const deleteKotUrl = `${BASE_URL}/home/deleteKot`;
  //     await axios.delete(deleteKotUrl, {
  //       data: { tableNumber: payload.tableNumber },
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     // Step 9: Show success message
  //     toast.success("Order saved and KOT deleted successfully!", {
  //       style: {
  //         marginTop: "40px",
  //         boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
  //       },
  //     });

  //     // Step 10: Print the order if action === "print"
  //     if (action === "print") {
  //       printOrder(payload);
  //     }
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Error saving the order or deleting the KOT:", error);
  //     if (error.response && error.response.data) {
  //       toast.error(error.response.data.errorMessage || "An error occurred.");
  //     } else {
  //       toast.error(
  //         "Failed to save the order or delete the KOT. Please try again."
  //       );
  //     }
  //   }
  // };

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

      // Step 3: Generate token number (DDMM + daily counter)
      const currentDate = new Date();
      const datePrefix =
        currentDate.getDate().toString().padStart(2, "0") +
        (currentDate.getMonth() + 1).toString().padStart(2, "0"); // DDMM format
      const dailyCounterKey = `dailyCounter_${datePrefix}`;

      let dailyCounter = parseInt(localStorage.getItem(dailyCounterKey) || "1", 10);
      const tokenNumber = `${datePrefix}${dailyCounter}`;
      localStorage.setItem(dailyCounterKey, (dailyCounter + 1).toString());

      // Step 4: Call backend API
      const orderSaveUrl = `${BASE_URL}/dashboard/order-save/${tableId ?? "PICK UP"}`;
      await axios.post(
        orderSaveUrl,
        { tokenNumber, paymentMethod: paymentMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 5: Success notification
      toast.success("Order saved successfully!", {
        style: {
          marginTop: "40px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        },
      });

      // Step 6: Print if requested
      if (action === "print") {
        printOrder({ tokenNumber, paymentMethod: paymentMode });
      }

      navigate("/");
    } catch (error) {
      console.error("Error saving the order:", error);
      toast.error(
        error.response?.data?.error || "Failed to save the order. Please try again."
      );
    }
  };


     return (
     <div className="bg-background shadow-lg rounded-none px-2 md:px-3 py-1 md:py-2 flex flex-col md:w-[28rem] h-[93vh] w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
                         className={`px-2 ${diningMode === "DINE IN"
                 ? "bg-green-700 text-white"
                 : "bg-gray-200 text-black"
               }`}
            onClick={() => handleDiningModeChange("DINE IN")}
          >
            DINE IN
          </Button>
          <Button
            variant="outline"
            size="sm"
                         className={`px-2 ${diningMode === "PICK UP"
                 ? "bg-green-700 text-white"
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
           <h3 className="text-sm md:text-base font-medium">Items</h3>
         </div>
         <div className="w-[30%] flex justify-center">
           <h3 className="text-sm md:text-base font-medium">Quantity</h3>
         </div>
         <div className="w-[20%] hidden md:flex justify-center">
           <h3 className="text-sm md:text-base font-medium">Price</h3>
         </div>
       </div>

             <div className="flex flex-col space-y-2 md:space-y-4 border-2 px-1 md:px-2 py-1 md:py-2 h-96 overflow-y-auto scrollbar-thin">
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
                      className="h-3 w-3 text-green-700"
                    />
                  </Button>
                </div>
                {/* Item Name */}
                                 <div className="flex w-[50%] justify-center items-center gap-2">
                   <h3 className="text-xs md:text-sm font-medium">{item.itemName}</h3>
                 </div>
                {/* Quantity Controls */}
                                 <div className="flex items-center w-[30%] justify-center space-x-1 md:space-x-2">
                   <Button
                     variant="outline"
                     size="sm"
                     className="px-1 md:px-2 text-xs"
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
                     className="text-xs md:text-base font-medium w-8 md:w-12 text-center border border-gray-300 rounded"
                     min="1"
                   />
                   <Button
                     variant="outline"
                     size="sm"
                     className="px-1 md:px-2 text-xs"
                     onClick={() => handleIncrement(index, true)} // Pass true for tableOrders
                   >
                     +
                   </Button>
                 </div>
                {/* Total Price */}
                                 <div className="hidden md:flex w-[20%] justify-center items-center">
                   <h3 className="text-xs md:text-sm font-medium">
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
                    className="h-3 w-3 text-green-700"
                  />
                </Button>
              </div>
              {/* Item Name */}
                             <div className="flex w-[50%] justify-center items-center gap-2">
                 <h3 className="text-xs md:text-sm font-medium">{item.name}</h3>
               </div>
              {/* Quantity Controls */}
                             <div className="flex items-center w-[30%] justify-center space-x-1 md:space-x-2">
                 <Button
                   variant="outline"
                   size="sm"
                   className="px-1 md:px-2 text-xs"
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
                   className="text-xs md:text-base font-medium w-8 md:w-12 text-center border border-gray-300 rounded"
                   min="1"
                 />
                 <Button
                   variant="outline"
                   size="sm"
                   className="px-1 md:px-2 text-xs"
                   onClick={() => handleIncrement(index, false)} // Pass false for orderItems
                 >
                   +
                 </Button>
               </div>
              {/* Total Price */}
                             <div className="hidden md:flex w-[20%] justify-center items-center">
                 <h3 className="text-xs md:text-sm font-medium">
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

             <div className="mt-2 flex justify-between gap-1 md:gap-2">
                                   <Button
            className="md:w-1/4 w-full bg-green-700 hover:bg-green-800 text-xs md:text-sm py-1 md:py-2"
            onClick={() => handleSubmitKot()}
            data-kot="running"
          >
            KOT
          </Button>
          <Button
            className="md:w-1/4 w-full bg-green-700 hover:bg-green-800 text-xs md:text-sm py-1 md:py-2"
            onClick={() => handleSubmitKot("print")}
            data-kot="running"
          >
            KOT & Print
          </Button>
          <Button
            className="hidden md:block w-1/4 bg-green-700 hover:bg-green-800 text-xs md:text-sm py-1 md:py-2"
            onClick={() => handleSaveOrder()}
          >
            Save
          </Button>
          <Button
            className="hidden md:block w-1/4 bg-green-700 hover:bg-green-800 text-xs md:text-sm py-1 md:py-2"
            onClick={() => handleSaveOrder("print")}
          >
            Save & Print
          </Button>
      </div>
    </div>
  );
}

export default OrdersBilling;