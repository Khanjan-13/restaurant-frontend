import React, { useMemo, useEffect, useState } from "react";
import HomeNavbar from "@/components/webComponent/Home/HomeNavbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faEye, faTrash, faPrint, faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Pickup() {
  const [pickupGroups, setPickupGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const buildTicketHTML = (order) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Ticket #${order.token}</title>
          <style>
            @media print { body { margin: 0; } }
            body { font-family: monospace; font-size: 12px; margin: 0; padding: 8px; }
            .ticket { width: 80mm; max-width: 100%; margin: 0 auto; }
            .center { text-align: center; }
            .bold { font-weight: 700; }
            .row { display: flex; justify-content: space-between; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .small { font-size: 11px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 2px 0; }
            th { border-bottom: 1px dashed #000; font-weight: 700; }
            .col-item { width: 58%; }
            .col-qty { width: 12%; text-align: center; }
            .col-amt { width: 30%; text-align: right; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center bold">PICKUP ORDER</div>
            <div class="center small">Token #${order.token}</div>
            <div class="center small">${dateStr} ${timeStr}</div>
            <div class="divider"></div>
            <div class="row"><span>Customer</span><span>${order.customerName || "Pickup"}</span></div>
            <div class="row"><span>Status</span><span>${order.orderStatus ? "Active" : "Completed"}</span></div>
            <div class="divider"></div>
            <table>
              <thead>
                <tr>
                  <th class="col-item">Item</th>
                  <th class="col-qty">Qty</th>
                  <th class="col-amt">Amt</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(it => `
                  <tr>
                    <td class="col-item">${it.name}</td>
                    <td class="col-qty">${it.qty}</td>
                    <td class="col-amt">₹${(Number(it.price)||0) * (Number(it.qty)||0)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="divider"></div>
            <div class="row bold"><span>Total</span><span>₹${order.total}</span></div>
            <div class="center small" style="margin-top:8px;">Thank you!</div>
          </div>
          <script>window.onload=()=>{window.print();window.close();}</script>
        </body>
      </html>
    `;
  };

  const handleSavePickup = async (order, action) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const tokenNumber = String(order?.token || "").trim();
      if (!tokenNumber) {
        toast.error("Invalid order token");
        return;
      }

      const orderSaveUrl = `${BASE_URL}/dashboard/order-save/PICK UP`;
      await axios.post(
        orderSaveUrl,
        { tokenNumber, paymentMethod: "Cash" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order saved successfully!");

      if (action === "print") {
        const html = buildTicketHTML(order);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        // After opening print dialog, refresh to fetch current status
        setTimeout(() => fetchPickup(true), 1500);
        toast.success("Print dialog opened");
      } else {
        // Non-print save: refresh immediately
        fetchPickup(true);
      }
    } catch (err) {
      console.error("Error saving pickup order:", err);
      toast.error("Failed to save the order. Please try again.");
    }
  };

  const fetchPickup = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/home/getallkot`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      const onlyPickup = rows.filter((r) => (r.tableNumber || "").toUpperCase() === "PICK UP");
      
      // Group by tokenNumber
      const map = new Map();
      for (const row of onlyPickup) {
        const key = row.tokenNumber ?? row._id;
        if (!map.has(key)) {
          map.set(key, {
            id: `pickup-${key}`,
            token: row.tokenNumber ?? "-",
            customerName: "Pickup Customer",
            items: [],
            createdAt: row.createdAt,
            orderStatus: row.orderStatus,
            totalAmount: row.totalAmount || 0
          });
        }
        const group = map.get(key);
        group.items.push({ 
          name: row.itemName, 
          qty: Number(row.itemQuantity || 0), 
          price: Number(row.itemPrice || 0),
          description: row.itemDescription || ""
        });
      }
      
      // Convert to array and compute totals
      const groups = Array.from(map.values()).map((g) => {
        const subtotal = g.items.reduce((s, it) => s + it.price * it.qty, 0);
        return { 
          ...g, 
          total: g.totalAmount || subtotal,
          itemCount: g.items.length
        };
      });
      
      // Sort by creation date (newest first)
      groups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setPickupGroups(groups);
      
      if (isRefresh) {
        toast.success("Pickup orders refreshed");
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load pickup orders");
      toast.error("Failed to load pickup orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPickup();
  }, [BASE_URL]);

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar activeTab="PICK UP" />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Pickup Orders</h1>
              <p className="text-sm text-muted-foreground">Manage customer pickup orders</p>
            </div>
            <Button 
              onClick={() => fetchPickup(true)} 
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <FontAwesomeIcon 
                icon={faRefresh} 
                className={`${refreshing ? 'animate-spin' : ''}`} 
              />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{pickupGroups.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">{pickupGroups.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                    <p className="text-2xl font-bold">{pickupGroups.filter(g => g.orderStatus).length}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-semibold">{pickupGroups.filter(g => g.orderStatus).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{pickupGroups.reduce((sum, g) => sum + g.total, 0).toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-semibold">₹</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Loading pickup orders...
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="text-red-600 font-medium mb-2">Error Loading Orders</div>
                <div className="text-red-500 text-sm">{error}</div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && pickupGroups.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground mb-2">No pickup orders found</div>
                <div className="text-sm text-muted-foreground">Orders will appear here when customers place pickup orders</div>
              </CardContent>
            </Card>
          )}

          {/* Pickup Orders Cards - Compact */}
          {!loading && !error && pickupGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pickupGroups.map((row, idx) => (
                <Card key={row.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-xs">#{idx + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{row.customerName}</div>
                          <div className="text-xs text-muted-foreground">Token: {row.token}</div>
                        </div>
                      </div>
                      <Badge variant={row.orderStatus ? "default" : "secondary"} className="text-xs">
                        {row.orderStatus ? "Active" : "Completed"}
                      </Badge>
                    </div>

                    {/* Items Summary */}
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        {row.itemCount} item{row.itemCount !== 1 ? 's' : ''}
                      </div>
                      <div className="space-y-1">
                        {row.items.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="truncate flex-1">{item.name}</span>
                            <span className="text-muted-foreground ml-2">x{item.qty}</span>
                          </div>
                        ))}
                        {row.items.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{row.items.length - 2} more item{row.items.length - 2 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="mb-3" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        ₹{row.total.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(row);
                            setIsViewModalOpen(true);
                          }}
                          className="h-7 px-2"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-xs" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const html = buildTicketHTML(row);
                            const w = window.open('', '_blank');
                            w.document.write(html);
                            w.document.close();
                          }}
                          className="h-7 px-2"
                        >
                          <FontAwesomeIcon icon={faPrint} className="text-xs" />
                        </Button>
                        {/* <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSavePickup(row)}
                          className="h-7 px-2"
                        >
                          Save
                        </Button> */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSavePickup(row, "print")}
                          className="h-7 px-2"
                        >
                          Save & Print
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove order #${row.token}?`)) {
                              toast.success(`Order #${row.token} removed`);
                              fetchPickup(true);
                            }
                          }}
                          className="h-7 px-2"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </Button>
                        
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Order Details Modal */}
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faShoppingBag} className="text-green-600" />
                  Pickup Order Details
                </DialogTitle>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedOrder.customerName}</h3>
                      <p className="text-sm text-muted-foreground">Token: {selectedOrder.token}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={selectedOrder.orderStatus ? "default" : "secondary"}>
                        {selectedOrder.orderStatus ? "Active" : "Completed"}
                      </Badge>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        ₹{selectedOrder.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">Order Items ({selectedOrder.itemCount} items)</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.qty}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ₹{item.price.toLocaleString()} each
                            </div>
                            <div className="font-medium">
                              ₹{(item.price * item.qty).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{selectedOrder.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const printContent = `
                          <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2 style="text-align: center; margin-bottom: 20px;">PICKUP ORDER</h2>
                            <p><strong>Token:</strong> ${selectedOrder.token}</p>
                            <p><strong>Customer:</strong> ${selectedOrder.customerName}</p>
                            <p><strong>Status:</strong> ${selectedOrder.orderStatus ? "Active" : "Completed"}</p>
                            <hr style="margin: 15px 0;">
                            <h3>Items:</h3>
                            ${selectedOrder.items.map(item => `
                              <p>${item.name} x ${item.qty} = ₹${item.price * item.qty}</p>
                            `).join('')}
                            <hr style="margin: 15px 0;">
                            <p><strong>Total: ₹${selectedOrder.total}</strong></p>
                          </div>
                        `;
                        const printWindow = window.open('', '_blank');
                        printWindow.document.write(printContent);
                        printWindow.document.close();
                        printWindow.print();
                        toast.success("Print dialog opened");
                      }}
                    >
                      <FontAwesomeIcon icon={faPrint} className="mr-2" />
                      Print Order
                    </Button>
                    <Button onClick={() => setIsViewModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default Pickup;


