import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faPenToSquare,
  faTrash,
  faTicket,
  faPercent,
  faTag,
  faClock
} from "@fortawesome/free-solid-svg-icons";

function DashboardCoupons() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percent", // percent | fixed
    discountValue: 0,
    status: "active", // active | inactive
  });

  const filteredCoupons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) =>
      [c.code, c.description, c.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [query, coupons]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.coupons)
            ? raw.coupons
            : [];
      setCoupons(list);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      code: "", description: "",
      discountType: "percent", discountValue: 0, status: "active"
    });
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percent",
      discountValue: Number(coupon.discountValue ?? 0),
      status: coupon.status || "active",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = { ...form, discountValue: Number(form.discountValue) };
      if (!payload.code) {
        toast.error("Code is required");
        return;
      }
      if (!(payload.discountValue > 0)) {
        toast.error("Discount must be greater than 0");
        return;
      }
      if (payload.discountType === "percent" && payload.discountValue > 100) {
        toast.error("Percent discount cannot exceed 100%");
        return;
      }
      if (editingId) {
        await axios.put(`${BASE_URL}/api/coupons/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Coupon updated");
      } else {
        await axios.post(`${BASE_URL}/api/coupons`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Coupon created");
      }
      setIsFormOpen(false);
      resetForm();
      fetchCoupons();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Save failed";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  // Stats
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    inactive: coupons.filter(c => c.status === 'inactive').length
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Coupons</h1>
              <p className="text-sm text-muted-foreground">
                Manage discount coupons and offers
              </p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              New Coupon
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Coupons</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.total}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTicket} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.active}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faPercent} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.inactive}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTag} className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coupons Table */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">All Coupons</CardTitle>
                  <CardDescription>View and manage your discount codes</CardDescription>
                </div>
                <div className="relative min-w-[250px]">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
                  />
                  <Input
                    placeholder="Search coupons..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faClock} className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                  <p className="text-muted-foreground">Loading coupons...</p>
                </div>
              ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faTicket} className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No coupons found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type / Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.map((c) => (
                        <TableRow key={c._id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{c.code}</TableCell>
                          <TableCell>{c.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.status === "active" ? "default" : "secondary"} className="capitalize">
                              {c.status || "active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                                <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(c._id)}>
                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the coupon details below." : "Fill in the details to create a new coupon."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. SAVE10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g. Summer Sale Discount"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <select
                  id="discountType"
                  className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.discountValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setForm({ ...form, discountValue: isNaN(val) ? "" : val });
                  }}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardCoupons;


