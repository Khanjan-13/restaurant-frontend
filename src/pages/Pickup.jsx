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
import axios from "axios";

function Pickup() {
  const [pickupGroups, setPickupGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchPickup = async () => {
      setLoading(true);
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
              customerName: "Pickup",
              items: [],
            });
          }
          const group = map.get(key);
          group.items.push({ name: row.itemName, qty: Number(row.itemQuantity || 0), price: Number(row.itemPrice || 0) });
        }
        // Convert to array and compute totals (subtotal only to avoid double tax)
        const groups = Array.from(map.values()).map((g) => {
          const subtotal = g.items.reduce((s, it) => s + it.price * it.qty, 0);
          return { ...g, total: subtotal };
        });
        setPickupGroups(groups);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || "Failed to load pickup orders");
      } finally {
        setLoading(false);
      }
    };
    fetchPickup();
  }, [BASE_URL]);

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar activeTab="PICK UP" />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Pickup Orders</h1>
            <p className="text-sm text-muted-foreground">Manage customer pickup orders</p>
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Pending Pickup Queue</CardTitle>
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
                    {!loading && !error && pickupGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No pickup orders.</TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && pickupGroups.map((row, idx) => (
                      <TableRow key={row.id} className="hover:bg-muted/30">
                        <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{row.customerName}</span>
                            <span className="text-xs text-muted-foreground">Token: {row.token}</span>
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
                            <Button size="sm" variant="outline" onClick={() => window.print?.()}>
                              Print
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="outline">View</Button>
                            <Button size="sm" variant="destructive">Remove</Button>
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

export default Pickup;


