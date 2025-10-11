import React, { useMemo, useEffect, useState } from "react";
import HomeNavbar from "@/components/webComponent/Home/HomeNavbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faEye, faTrash, faPrint } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Pickup() {
  const [pickupGroups, setPickupGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
                            const orderDetails = {
                              token: row.token,
                              customer: row.customerName,
                              items: row.items,
                              total: row.total,
                              status: row.orderStatus ? "Active" : "Completed"
                            };
                            console.log("Order Details:", orderDetails);
                            toast.info(`Viewing order #${row.token}`);
                          }}
                          className="h-7 px-2"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-xs" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const printContent = `
                              <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2 style="text-align: center; margin-bottom: 20px;">PICKUP ORDER</h2>
                                <p><strong>Token:</strong> ${row.token}</p>
                                <p><strong>Customer:</strong> ${row.customerName}</p>
                                <p><strong>Status:</strong> ${row.orderStatus ? "Active" : "Completed"}</p>
                                <hr style="margin: 15px 0;">
                                <h3>Items:</h3>
                                ${row.items.map(item => `
                                  <p>${item.name} x ${item.qty} = ₹${item.price * item.qty}</p>
                                `).join('')}
                                <hr style="margin: 15px 0;">
                                <p><strong>Total: ₹${row.total}</strong></p>
                              </div>
                            `;
                            const printWindow = window.open('', '_blank');
                            printWindow.document.write(printContent);
                            printWindow.document.close();
                            printWindow.print();
                            toast.success("Print dialog opened");
                          }}
                          className="h-7 px-2"
                        >
                          <FontAwesomeIcon icon={faPrint} className="text-xs" />
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
        </div>
      </div>
    </div>
  );
}

export default Pickup;


