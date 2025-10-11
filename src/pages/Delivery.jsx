import React, { useMemo, useEffect, useState } from "react";
import HomeNavbar from "@/components/webComponent/Home/HomeNavbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faEye, faTrash, faPrint, faTruck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Delivery() {
  const [deliveryGroups, setDeliveryGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchDelivery = async (isRefresh = false) => {
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
      const onlyDelivery = rows.filter((r) => (r.tableNumber || "").toUpperCase() === "DELIVERY");
      
      // Group by tokenNumber
      const map = new Map();
      for (const row of onlyDelivery) {
        const key = row.tokenNumber ?? row._id;
        if (!map.has(key)) {
          map.set(key, {
            id: `delivery-${key}`,
            token: row.tokenNumber ?? "-",
            customerName: "Delivery Customer",
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
      
      setDeliveryGroups(groups);
      
      if (isRefresh) {
        toast.success("Delivery orders refreshed");
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load delivery orders");
      toast.error("Failed to load delivery orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [BASE_URL]);

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar activeTab="DELIVERY" />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Delivery Orders</h1>
              <p className="text-sm text-muted-foreground">Manage customer delivery orders</p>
            </div>
            <Button 
              onClick={() => fetchDelivery(true)} 
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
                    <p className="text-2xl font-bold">{deliveryGroups.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">{deliveryGroups.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                    <p className="text-2xl font-bold">{deliveryGroups.filter(g => g.orderStatus).length}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-semibold">{deliveryGroups.filter(g => g.orderStatus).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{deliveryGroups.reduce((sum, g) => sum + g.total, 0).toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-semibold">₹</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faTruck} className="text-blue-600" />
                Delivery Orders Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow className="bg-muted/60">
                      <TableHead className="text-center w-20">Sr. No.</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right w-48">Bill</TableHead>
                      <TableHead className="text-center w-40">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                      </TableRow>
                    )}
                    {!loading && error && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-red-600">{error}</TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && deliveryGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No delivery orders.</TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && deliveryGroups.map((row, idx) => (
                      <TableRow key={row.id} className="hover:bg-muted/30">
                        <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{row.customerName}</span>
                            <span className="text-xs text-muted-foreground">Token: {row.token}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={row.orderStatus ? "default" : "secondary"}>
                                {row.orderStatus ? "Active" : "Completed"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {row.itemCount} item{row.itemCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {row.items.map((it, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-foreground">{it.name}</span>
                                <span className="text-xs text-muted-foreground">x {it.qty}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold">₹{row.total.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // View order details
                                const orderDetails = {
                                  token: row.token,
                                  customer: row.customerName,
                                  items: row.items,
                                  total: row.total,
                                  status: row.orderStatus ? "Active" : "Completed"
                                };
                                console.log("Order Details:", orderDetails);
                                toast.info(`Viewing delivery order #${row.token}`);
                              }}
                              className="gap-1"
                            >
                              <FontAwesomeIcon icon={faEye} className="text-xs" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Print order
                                const printContent = `
                                  <div style="font-family: Arial, sans-serif; padding: 20px;">
                                    <h2 style="text-align: center; margin-bottom: 20px;">DELIVERY ORDER</h2>
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
                              className="gap-1"
                            >
                              <FontAwesomeIcon icon={faPrint} className="text-xs" />
                              Print
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove delivery order #${row.token}?`)) {
                                  // TODO: Implement delete API call
                                  toast.success(`Delivery order #${row.token} removed`);
                                  fetchDelivery(true); // Refresh the list
                                }
                              }}
                              className="gap-1"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Delivery;