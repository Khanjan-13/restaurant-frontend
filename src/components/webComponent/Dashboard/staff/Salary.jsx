import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faCalendar,
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faFilter,
  faDownload,
  faRefresh,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faXmark,
  faCalculator,
  faChartLine,
  faCreditCard,
  faCashRegister,
  faIndianRupeeSign,
  faClock,
  faUserTie,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";

function Salary() {
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [staffList, setStaffList] = useState([]);
  
  // Form states for adding new salary record
  const [newSalary, setNewSalary] = useState({
    staffId: "",
    staffName: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    workingDays: "",
    month: "",
    year: "",
    paymentMethod: "Cash",
    paymentStatus: "Pending"
  });
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchSalaryRecords();
    fetchStaffList();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [salaryRecords, selectedFilter, searchQuery, dateRange]);

  const fetchSalaryRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/staff/salary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setSalaryRecords(response.data);
        setFilteredRecords(response.data);
      } else {
        setSalaryRecords([]);
        setFilteredRecords([]);
      }
    } catch (err) {
      console.error("Error fetching salary records:", err);
      setError(err.message || "Failed to fetch salary records. Please try again.");
      toast.error("Failed to fetch salary records");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/staff/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setStaffList(response.data);
      }
    } catch (err) {
      console.error("Error fetching staff list:", err);
    }
  };

  const handleAddSalary = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const salaryData = {
        ...newSalary,
        totalSalary: parseFloat(newSalary.basicSalary) + parseFloat(newSalary.allowances || 0) - parseFloat(newSalary.deductions || 0),
        paymentDate: new Date().toISOString()
      };

      const response = await axios.post(`${BASE_URL}/staff/salary`, salaryData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Salary record added successfully!");
        setIsAddDialogOpen(false);
        setNewSalary({
          staffId: "",
          staffName: "",
          basicSalary: "",
          allowances: "",
          deductions: "",
          workingDays: "",
          month: "",
          year: "",
          paymentMethod: "Cash",
          paymentStatus: "Pending"
        });
        fetchSalaryRecords();
      }
    } catch (err) {
      console.error("Error adding salary record:", err);
      toast.error("Failed to add salary record. Please try again.");
    }
  };

  const handleUpdatePaymentStatus = async (recordId, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.put(`${BASE_URL}/staff/salary/${recordId}/status`, {
        paymentStatus: status,
        paymentDate: status === "Paid" ? new Date().toISOString() : null
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success(`Payment status updated to ${status}!`);
        fetchSalaryRecords();
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      toast.error("Failed to update payment status. Please try again.");
    }
  };

  const filterRecords = () => {
    let filtered = [...salaryRecords];

    // Filter by payment status
    if (selectedFilter) {
      filtered = filtered.filter(
        (record) => record.paymentStatus?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Filter by search query (staff name)
    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.staffId?.toString().includes(searchQuery)
      );
    }

    // Filter by date range
    if (dateRange !== "all") {
      const today = new Date();

      switch (dateRange) {
        case "today":
          filtered = filtered.filter(record => {
            const paymentDate = new Date(record.paymentDate);
            return paymentDate.toDateString() === today.toDateString();
          });
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(record => {
            const paymentDate = new Date(record.paymentDate);
            return paymentDate >= weekAgo;
          });
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(record => {
            const paymentDate = new Date(record.paymentDate);
            return paymentDate >= monthAgo;
          });
          break;
      }
    }

    setFilteredRecords(filtered);
  };

  const clearFilters = () => {
    setSelectedFilter("");
    setSearchQuery("");
    setDateRange("all");
  };

  const getPaymentStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <FontAwesomeIcon icon={faClock} className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Unknown
          </Badge>
        );
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return <FontAwesomeIcon icon={faCashRegister} className="h-3 w-3 mr-1" />;
      case "card":
        return <FontAwesomeIcon icon={faCreditCard} className="h-3 w-3 mr-1" />;
      case "upi":
        return <FontAwesomeIcon icon={faIndianRupeeSign} className="h-3 w-3 mr-1" />;
      default:
        return <FontAwesomeIcon icon={faMoneyBill} className="h-3 w-3 mr-1" />;
    }
  };

  // Calculate stats
  const stats = {
    total: filteredRecords.length,
    paid: filteredRecords.filter(record => record.paymentStatus === "Paid").length,
    pending: filteredRecords.filter(record => record.paymentStatus === "Pending").length,
    totalAmount: filteredRecords.reduce((sum, record) => sum + (record.totalSalary || 0), 0),
    avgSalary: filteredRecords.length > 0
      ? filteredRecords.reduce((sum, record) => sum + (record.totalSalary || 0), 0) / filteredRecords.length
      : 0
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Staff Salary Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage staff salaries and payment tracking
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSalaryRecords}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faRefresh} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                Add Salary
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.total}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faReceipt} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.paid}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.pending}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <h3 className="text-2xl font-bold mt-2">₹{stats.totalAmount.toLocaleString()}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faMoneyBill} className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Salary</p>
                    <h3 className="text-2xl font-bold mt-2">₹{Math.round(stats.avgSalary)}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalculator} className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
                    />
                    <Input
                      placeholder="Search by staff name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>

                {(selectedFilter || searchQuery || dateRange !== "all") && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Salary Records Table */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Salary Records</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredRecords.length} of {salaryRecords.length} records
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faRefresh} className="h-4 w-4 animate-spin" />
                            Loading salary records...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.length > 0 ? (
                      filteredRecords.map((record, index) => (
                        <TableRow key={record._id || index} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.staffName || "Unknown Staff"}</p>
                              <p className="text-sm text-muted-foreground">ID: {record.staffId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.month} {record.year}</p>
                              <p className="text-sm text-muted-foreground">{record.workingDays} days</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{record.basicSalary || 0}
                          </TableCell>
                          <TableCell className="text-green-600">
                            +₹{record.allowances || 0}
                          </TableCell>
                          <TableCell className="text-red-600">
                            -₹{record.deductions || 0}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{record.totalSalary || 0}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {getPaymentMethodIcon(record.paymentMethod)}
                              {record.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(record.paymentStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {record.paymentStatus === "Pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdatePaymentStatus(record._id, "Paid")}
                                  className="hover:bg-green-50 hover:text-green-600"
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FontAwesomeIcon icon={faMoneyBill} className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No salary records found</p>
                            {(selectedFilter || searchQuery) && (
                              <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear filters to see all records
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Salary Details</DialogTitle>
            <DialogDescription>
              Detailed information about this salary record.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Name</p>
                <p className="font-medium">{selectedRecord.staffName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Period</p>
                <p className="text-sm">{selectedRecord.month} {selectedRecord.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Working Days</p>
                <p className="text-sm">{selectedRecord.workingDays} days</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Basic Salary</p>
                  <p className="text-sm font-medium">₹{selectedRecord.basicSalary}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Allowances</p>
                  <p className="text-sm font-medium text-green-600">+₹{selectedRecord.allowances || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deductions</p>
                  <p className="text-sm font-medium text-red-600">-₹{selectedRecord.deductions || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Salary</p>
                  <p className="text-sm font-bold">₹{selectedRecord.totalSalary}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p className="text-sm capitalize">{selectedRecord.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getPaymentStatusBadge(selectedRecord.paymentStatus)}</div>
              </div>
              {selectedRecord.paymentDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                  <p className="text-sm">
                    {new Date(selectedRecord.paymentDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Salary Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Salary Record</DialogTitle>
            <DialogDescription>
              Add a new salary record for staff member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSalary} className="space-y-4">
            <div>
              <Label htmlFor="staffId">Staff Member</Label>
              <Select
                value={newSalary.staffId}
                onValueChange={(value) => {
                  const staff = staffList.find(s => s._id === value);
                  setNewSalary({
                    ...newSalary,
                    staffId: value,
                    staffName: staff?.name || ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff._id} value={staff._id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Select
                  value={newSalary.month}
                  onValueChange={(value) => setNewSalary({ ...newSalary, month: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"].map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  type="number"
                  value={newSalary.year}
                  onChange={(e) => setNewSalary({ ...newSalary, year: e.target.value })}
                  placeholder="2024"
                  min="2020"
                  max="2030"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="basicSalary">Basic Salary</Label>
              <Input
                type="number"
                value={newSalary.basicSalary}
                onChange={(e) => setNewSalary({ ...newSalary, basicSalary: e.target.value })}
                placeholder="Enter basic salary"
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="allowances">Allowances</Label>
                <Input
                  type="number"
                  value={newSalary.allowances}
                  onChange={(e) => setNewSalary({ ...newSalary, allowances: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="deductions">Deductions</Label>
                <Input
                  type="number"
                  value={newSalary.deductions}
                  onChange={(e) => setNewSalary({ ...newSalary, deductions: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="workingDays">Working Days</Label>
              <Input
                type="number"
                value={newSalary.workingDays}
                onChange={(e) => setNewSalary({ ...newSalary, workingDays: e.target.value })}
                placeholder="Enter working days"
                min="1"
                max="31"
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={newSalary.paymentMethod}
                onValueChange={(value) => setNewSalary({ ...newSalary, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Add Salary Record
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Salary;
