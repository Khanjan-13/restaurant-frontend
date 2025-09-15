import React, { useMemo } from "react";
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

function Pickup() {
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
                    {/* Demo data until API is wired */}
                    {useMemo(() => [
                      {
                        id: "tok-101",
                        token: "P-101",
                        customerName: "Walk-in",
                        items: [
                          { name: "Veg Burger", qty: 2 },
                          { name: "Fries", qty: 1 },
                        ],
                        total: 320,
                      },
                    ], []).map((row, idx) => (
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


