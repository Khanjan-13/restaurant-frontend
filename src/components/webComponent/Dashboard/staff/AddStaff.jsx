import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
function AddStaff() {
  const [staffData, setStaffData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
  });
  const [staffList, setStaffList] = useState([]);
  // For dialog & deletion
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    setStaffData({ ...staffData, [e.target.name]: e.target.value });
  };
  const token = localStorage.getItem("token"); // or sessionStorage.getItem()

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStaffList(res.data.data);
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addStaff = async () => {
    try {
      await axios.post(
        `${BASE_URL}/dashboard/staff/register`,
        staffData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStaffData({ name: "", mobile: "", email: "", password: "" });
      fetchStaff();
    } catch (error) {
      console.error(
        "Error adding staff:",
        error.response?.data || error.message
      );
    }
  };

  const deleteStaff = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/dashboard/staff/${id}`);
      fetchStaff();
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
    }
  };
  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };
  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="flex ml-56 min-h-screen flex-col bg-muted/40 pt-5 ">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="w-full max-w-7xl space-y-8">
          {/* Add Staff Card */}
          <Card>
            <CardHeader>
              <CardTitle>Add Staff Member</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                type="text"
                name="name"
                placeholder="Name"
                value={staffData.name}
                onChange={handleChange}
              />
              <Input
                type="text"
                name="mobile"
                placeholder="Mobile"
                value={staffData.mobile}
                onChange={handleChange}
              />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={staffData.email}
                onChange={handleChange}
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={staffData.password}
                onChange={handleChange}
              />
              <div className="col-span-full text-right mt-2">
                <Button
                  onClick={addStaff}
                  className="bg-[#4caf50] hover:bg-[#419844]"
                >
                  Add Staff
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Staff Table Card */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr. No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(staffList) && staffList.length > 0 ? (
                    staffList.map((staff, index) => (
                      <TableRow key={staff._id}>
                        <TableCell className="text-left">{index + 1}</TableCell>
                        <TableCell className="text-left">
                          {staff.name}
                        </TableCell>
                        <TableCell className="text-left">
                          {staff.mobile}
                        </TableCell>
                        <TableCell className="text-left">
                          {staff.email}
                        </TableCell>
                        <TableCell className="text-left">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(staff._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No staff members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Confirmation Dialog */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this staff member? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="space-x-2">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteStaff(deleteId)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

export default AddStaff;
