import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faUsers,
  faIdBadge,
  faClock,
  faTrash,
  faEye,
  faSearch,
  faRefresh,
  faUserCheck,
  faEnvelope,
  faPhone,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

function AddStaff() {
  const [staffData, setStaffData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role:"waiter",
  });
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staffList, searchQuery]);

  const filterStaff = () => {
    if (!searchQuery) {
      setFilteredStaff(staffList);
    } else {
      const filtered = staffList.filter(
        (staff) =>
          staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          staff.mobile?.includes(searchQuery)
      );
      setFilteredStaff(filtered);
    }
  };

  const handleChange = (e) => {
    setStaffData({ ...staffData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setStaffData({ ...staffData, role: value });
  };

  const fetchStaff = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/dashboard/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  const addStaff = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!staffData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!staffData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!staffData.mobile.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (!/^\d{10}$/.test(staffData.mobile.trim())) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }
    if (!staffData.password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (staffData.password.trim().length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }


    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/dashboard/staff/register`, staffData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffData({ name: "", mobile: "", email: "", password: "", role: "waiter" });
      fetchStaff();
    } catch (error) {
      console.error("Error adding staff:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to add staff member"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/dashboard/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Staff member deleted successfully");
      fetchStaff();
      setOpenDialog(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff member");
    }
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  // Calculate stats
  const stats = {
    totalStaff: staffList.length,
    activeStaff: staffList.length, // Assuming all staff are active for demo
    onDuty: Math.floor(staffList.length * 0.7), // Mock data
    roles: Array.from(new Set(staffList.map(() => "Staff"))).length || 1, // Mock data
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Staff Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage restaurant staff members and their details
              </p>
            </div>
            <Button onClick={fetchStaff} variant="outline" disabled={loading}>
              <FontAwesomeIcon icon={faRefresh} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.totalStaff}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.activeStaff}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserCheck} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">On Duty</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.onDuty}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Roles</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.roles}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserTie} className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Staff Form */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faUserPlus} className="h-5 w-5 text-primary" />
                Add New Staff Member
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter staff member details to add them to the system
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={addStaff} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <div className="relative">
                      <FontAwesomeIcon 
                        icon={faIdBadge} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                      />
                      <Input
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={staffData.name}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile Number *</label>
                    <div className="relative">
                      <FontAwesomeIcon 
                        icon={faPhone} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                      />
                      <Input
                        type="tel"
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={staffData.mobile}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address *</label>
                    <div className="relative">
                      <FontAwesomeIcon 
                        icon={faEnvelope} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                      />
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={staffData.email}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password *</label>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={staffData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role *</label>
                    <Select onValueChange={handleRoleChange} value={staffData.role}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waiter">Waiter</SelectItem>
                        <SelectItem value="chef">Chef</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="gap-2">
                    <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" />
                    {loading ? "Adding..." : "Add Staff Member"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Staff List */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Staff Members</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredStaff.length} of {staffList.length} staff members
                  </p>
                </div>
                <div className="relative min-w-[250px]">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                  />
                  <Input
                    placeholder="Search staff members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUsers} className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                  <p className="text-muted-foreground">Loading staff members...</p>
                </div>
              ) : filteredStaff.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableBody>
                      {filteredStaff.map((staff, index) => (
                        <TableRow key={staff._id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {staff.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{staff.name}</p>
                                <p className="text-sm text-muted-foreground">ID: #{index + 1}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-muted-foreground" />
                                {staff.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-muted-foreground" />
                                {staff.mobile}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 capitalize">
                              {staff.role || "staff"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="default" 
                              className="bg-green-100 text-green-800"
                            >
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info("View functionality coming soon")}
                              >
                                <FontAwesomeIcon icon={faEye} className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDeleteDialog(staff._id)}
                              >
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
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUsers} className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No staff members match your search"
                      : "No staff members found. Add your first staff member above."
                    }
                  </p>
                  {searchQuery && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setSearchQuery("")}>
                      Clear search to see all staff
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTrash} className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
              All associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteStaff(deleteId)}
              className="gap-2"
            >
              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
              Delete Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddStaff;
