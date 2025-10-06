import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    setForm({ code: "", description: "",
      discountType: "percent", discountValue: 0, status: "active" });
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

  return (
    <div className="p-3 md:p-6">
      <div className="flex items-center justify-between mb-3 w-full md:w-[48rem] mx-auto">
        <h1 className="text-lg md:text-xl font-semibold">Coupons</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search coupons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-40 md:w-64"
          />
          <Button onClick={openCreate} className="bg-green-700 hover:bg-green-800">New Coupon</Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden w-full md:w-[48rem] mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7f7] text-left">
                <th className="py-2 px-2 w-[24%]">Code</th>
                <th className="py-2 px-2 w-[28%]">Description</th>
                <th className="py-2 px-2 w-[18%]">Type / Value</th>
                <th className="py-2 px-2 w-[15%]">Status</th>
                <th className="py-2 px-2 w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-4 px-2">Loading...</td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 px-2">No coupons found</td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c._id} className="border-t">
                    <td className="py-2 px-2 truncate">{c.code}</td>
                    <td className="py-2 px-2 truncate">{c.description}</td>
                    <td className="py-2 px-2">
                      {(c.discountType || "percent").toString()} / {Number(c.discountValue ?? 0)}
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant="outline" className="capitalize">{c.status || "active"}</Badge>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(c._id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] md:w-[36rem] rounded-md shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base md:text-lg font-semibold">{editingId ? "Edit Coupon" : "New Coupon"}</h2>
              <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>Close</Button>
            </div>
            <Separator className="mb-3" />
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Code</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE10" />
              </div>
              <div>
                <label className="text-xs font-medium">Description</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Summer discount" />
              </div>
              <div>
                <label className="text-xs font-medium">Discount Type</label>
                <select
                  className="w-full border rounded-md h-9 px-2 text-sm"
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                >
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Discount Value</label>
                <Input type="number" min="0" value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === "percent" ? "e.g. 10 for 10%" : "e.g. 100 for ₹100"}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Status</label>
                <select
                  className="w-full border rounded-md h-9 px-2 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-green-700 hover:bg-green-800">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardCoupons;


