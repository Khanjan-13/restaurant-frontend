import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faTrash, faEdit, faRefresh, faUser } from "@fortawesome/free-solid-svg-icons";

function Customers() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  const token = useMemo(() => localStorage.getItem("token"), []);

  const fetchCustomers = async (search = "") => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/dashboard/customers`, {
        params: search ? { q: search } : undefined,
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchCustomers();
  }, [BASE_URL, token]);

  const handleOpenAdd = () => {
    setForm({ name: "", phone: "", email: "", address: "", notes: "" });
    setIsAddOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/dashboard/customers`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Customer added");
      setIsAddOpen(false);
      fetchCustomers(query);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add customer");
    }
  };

  const handleOpenEdit = (row) => {
    setSelected(row);
    setForm({
      name: row.name || "",
      phone: row.phone || "",
      email: row.email || "",
      address: row.address || "",
      notes: row.notes || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected?._id) return;
    try {
      await axios.put(`${BASE_URL}/dashboard/customers/${selected._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Customer updated");
      setIsEditOpen(false);
      fetchCustomers(query);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update customer");
    }
  };

  const handleDelete = async (row) => {
    if (!row?._id) return;
    if (!window.confirm(`Delete customer "${row.name}"?`)) return;
    try {
      await axios.delete(`${BASE_URL}/dashboard/customers/${row._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Customer deleted");
      fetchCustomers(query);
    } catch (e) {
      toast.error("Failed to delete customer");
    }
  };

  const onSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    const timeout = setTimeout(() => fetchCustomers(val), 300);
    return () => clearTimeout(timeout);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Customers</h1>
              <p className="text-sm text-muted-foreground">Manage your customer directory</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => fetchCustomers(query)} disabled={loading}>
                <FontAwesomeIcon icon={faRefresh} className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={handleOpenAdd}>
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, phone, or email..." value={query} onChange={onSearch} className="pl-9" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="py-2 px-2">Name</th>
                      <th className="py-2 px-2">Phone</th>
                      <th className="py-2 px-2">Email</th>
                      <th className="py-2 px-2">Address</th>
                      <th className="py-2 px-2">Notes</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm">Loading...</td>
                      </tr>
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No customers found</td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c._id} className="border-t">
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-primary" />
                              </span>
                              <div>
                                <div className="font-medium">{c.name}</div>
                                <div className="text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2">{c.phone || "-"}</td>
                          <td className="py-2 px-2">{c.email || "-"}</td>
                          <td className="py-2 px-2">{c.address || "-"}</td>
                          <td className="py-2 px-2">{c.notes || "-"}</td>
                          <td className="py-2 px-2 text-right">
                            <div className="inline-flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleOpenEdit(c)}>
                                <FontAwesomeIcon icon={faEdit} className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(c)}>
                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Create a new customer record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Separator />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <Label htmlFor="name_edit">Name *</Label>
              <Input id="name_edit" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone_edit">Phone</Label>
                <Input id="phone_edit" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email_edit">Email</Label>
                <Input id="email_edit" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="address_edit">Address</Label>
              <Input id="address_edit" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="notes_edit">Notes</Label>
              <Input id="notes_edit" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Separator />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Customers;
