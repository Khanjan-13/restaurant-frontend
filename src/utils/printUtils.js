import toast from "react-hot-toast";

// Enhanced print function for Kitchen Order Tickets
export const printKot = (tokenNumber, kotItems, totalAmount, diningMode, tableId = null) => {
  const printWindow = window.open("", "_blank");
  const currentDateTime = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const kotHTML = `
    <html>
      <head>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 14px;
            line-height: 1.6;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .header p {
            margin: 8px 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .restaurant-info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
          }
          .kot-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #e9ecef;
          }
          .kot-details .detail-group {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .kot-details p {
            margin: 10px 0;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .kot-details .label {
            color: #666;
            font-weight: 500;
          }
          .kot-details .value {
            color: #333;
            font-weight: 700;
          }
          .priority-banner {
            background: ${diningMode === "PICK UP" ? "#ffc107" : "#28a745"};
            color: white;
            text-align: center;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
          }
          .kot-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
          }
          .kot-items th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 12px;
          }
          .kot-items td {
            border: 1px solid #e9ecef;
            padding: 15px 12px;
            text-align: left;
          }
          .kot-items tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .kot-items tbody tr:hover {
            background-color: #e3f2fd;
          }
          .item-name {
            font-weight: 600;
            color: #333;
          }
          .item-qty {
            font-weight: bold;
            color: #dc3545;
            font-size: 16px;
            text-align: center;
          }
          .item-price {
            font-weight: 600;
            color: #28a745;
          }
          .item-category {
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            color: #495057;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .total {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .total h3 {
            margin: 0;
            font-size: 24px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          }
          .footer {
            text-align: center;
            border-top: 3px solid #333;
            padding-top: 20px;
            margin-top: 30px;
            color: #666;
          }
          .footer .note {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: 500;
          }
          .print-info {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #007bff;
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
          }
          @media print {
            .print-info { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-info no-print">
          Press Ctrl+P to print
        </div>
        
        <div class="header">
          <h1>🍽️ Table No. 21</h1>
          <p>Kitchen Order Ticket</p>
          <p>${currentDateTime}</p>
        </div>

        <div class="restaurant-info">
          <p><strong>📍 Dining Management System</strong></p>
          <p>📞 Contact: +91 XXXXX XXXXX | 📧 info@tableno21.com</p>
        </div>

        <div class="priority-banner">
          ${diningMode === "PICK UP" ? "🥡 PICKUP ORDER - PRIORITY" : "🍽️ DINE-IN SERVICE"}
        </div>

        <div class="kot-details">
          <div class="detail-group">
            <p><span class="label">🎫 Token Number:</span> <span class="value">#${tokenNumber}</span></p>
            <p><span class="label">📅 Order Time:</span> <span class="value">${new Date().toLocaleTimeString('en-IN')}</span></p>
          </div>
          <div class="detail-group">
            <p><span class="label">🏷️ Service Type:</span> <span class="value">${diningMode}</span></p>
            ${diningMode !== "PICK UP" ? `<p><span class="label">🪑 Table:</span> <span class="value">${tableId}</span></p>` : '<p><span class="label">📦 Collection:</span> <span class="value">Counter</span></p>'}
          </div>
        </div>

        <table class="kot-items">
          <thead>
            <tr>
              <th>🍽️ Item Name</th>
              <th>📊 Quantity</th>
              <th>💰 Price</th>
              <th>🏷️ Category</th>
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
                  <td><span class="item-category">${item.itemCategory}</span></td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total">
          <h3>💰 Total Amount: ₹${totalAmount.toFixed(2)}</h3>
        </div>

        <div class="footer">
          <div class="note">
            <strong>📝 Kitchen Notes:</strong> Please prepare items according to customer preferences and notify when ready.
          </div>
          <p><strong>Thank you for your order!</strong></p>
          <p style="font-size: 12px; color: #999;">🧾 Kitchen Order Ticket • Generated at ${new Date().toLocaleString('en-IN')}</p>
          <p style="font-size: 10px; color: #ccc;">Table No. 21 - Premium Dining Experience</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(kotHTML);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

// Simple DMart-style receipt
export const printOrderReceipt = (orderDetails, isReprint = false) => {
  const printWindow = window.open("", "_blank");
  const { tokenNumber, items, totalAmount, paymentMethod, tableNumber } = orderDetails;
  
  // Calculate basic totals
  const itemsTotal = items?.reduce((sum, item) => 
    sum + ((item.itemPrice || 0) * (item.itemQuantity || 1)), 0) || totalAmount || 0;

  const simpleReceiptHTML = `
  <html>
  <head>
    <title>Receipt - Table No. 21</title>
    <style>
      @media print {
        body { margin: 0; padding: 10px; }
        .no-print { display: none; }
      }
      body { 
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.4;
        background: white;
        max-width: 300px;
        margin: 0 auto;
        padding: 10px;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 15px;
      }
      .header h1 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
      }
      .header p {
        margin: 2px 0;
        font-size: 10px;
      }
      .reprint {
        text-align: center;
        background: #f0f0f0;
        padding: 5px;
        margin-bottom: 10px;
        font-weight: bold;
        display: ${isReprint ? 'block' : 'none'};
      }
      .receipt-info {
        margin-bottom: 15px;
        font-size: 11px;
      }
      .receipt-info div {
        display: flex;
        justify-content: space-between;
        margin: 3px 0;
      }
      .items-header {
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
        padding: 5px 0;
        font-weight: bold;
        margin: 10px 0;
      }
      .item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin: 5px 0;
        padding: 2px 0;
      }
      .item-details {
        flex: 1;
        margin-right: 10px;
      }
      .item-name {
        font-weight: bold;
        font-size: 11px;
      }
      .item-price-qty {
        font-size: 10px;
        color: #666;
      }
      .item-total {
        font-weight: bold;
        font-size: 11px;
        min-width: 60px;
        text-align: right;
      }
      .totals {
        border-top: 1px solid #000;
        padding-top: 10px;
        margin-top: 15px;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        margin: 3px 0;
        font-size: 11px;
      }
      .grand-total {
        border-top: 1px solid #000;
        padding-top: 5px;
        margin-top: 5px;
        font-weight: bold;
        font-size: 12px;
      }
      .payment-info {
        margin: 15px 0;
        text-align: center;
        font-size: 11px;
        padding: 5px;
        border: 1px solid #ddd;
      }
      .footer {
        text-align: center;
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid #000;
        font-size: 10px;
      }
      .thank-you {
        font-weight: bold;
        margin: 10px 0;
      }
    </style>
  </head>
  <body>
    <div class="reprint">*** DUPLICATE COPY ***</div>
    
    <div class="header">
      <h1>TABLE NO. 21</h1>
      <p>Premium Dining Experience</p>
      <p>Ph: +91 XXXXX XXXXX</p>
    </div>

    <div class="receipt-info">
      <div><span>Receipt No:</span><span>#${tokenNumber || 'N/A'}</span></div>
      <div><span>Date:</span><span>${new Date(orderDetails.createdAt || new Date()).toLocaleDateString('en-IN')}</span></div>
      <div><span>Time:</span><span>${new Date(orderDetails.createdAt || new Date()).toLocaleTimeString('en-IN')}</span></div>
      <div><span>${tableNumber === 'PICK UP' ? 'Type' : 'Table'}:</span><span>${tableNumber || 'N/A'}</span></div>
    </div>

    <div class="items-header">ITEMS</div>
    
    ${(items || []).map((item) => `
    <div class="item">
      <div class="item-details">
        <div class="item-name">${item.itemName || 'Item'}</div>
        <div class="item-price-qty">₹${(item.itemPrice || 0).toFixed(2)} x ${item.itemQuantity || 1}</div>
      </div>
      <div class="item-total">₹${((item.itemPrice || 0) * (item.itemQuantity || 1)).toFixed(2)}</div>
    </div>
    `).join("")}

    <div class="totals">
      <div class="total-line">
        <span>Sub Total:</span>
        <span>₹${itemsTotal.toFixed(2)}</span>
      </div>
      <div class="total-line grand-total">
        <span>TOTAL:</span>
        <span>₹${(totalAmount || itemsTotal).toFixed(2)}</span>
      </div>
    </div>

    <div class="payment-info">
      <strong>PAID BY: ${paymentMethod || 'N/A'}</strong>
    </div>

    <div class="footer">
      <div class="thank-you">THANK YOU FOR VISITING!</div>
      <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
      ${isReprint ? '<p><strong>** REPRINT **</strong></p>' : ''}
    </div>
  </body>
  </html>
  `;

  printWindow.document.write(simpleReceiptHTML);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    if (isReprint) {
      toast.success("Receipt reprinted!");
    }
  }, 500);
}; 