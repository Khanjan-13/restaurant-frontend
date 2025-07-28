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
import axios from "axios";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
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
  faUserClock,
  faChartLine,
  faCalendarCheck,
  faCalendarXmark,
} from "@fortawesome/free-solid-svg-icons";

function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [dateRange, setDateRange] = useState("today");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchAttendanceRecords();
    getCurrentStaff();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, selectedFilter, searchQuery, dateRange]);

  const getCurrentStaff = () => {
    const staffData = localStorage.getItem("staffData");
    if (staffData) {
      setCurrentStaff(JSON.parse(staffData));
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.get(`${BASE_URL}/staff/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setAttendanceRecords(response.data);
        setFilteredRecords(response.data);
      } else {
        setAttendanceRecords([]);
        setFilteredRecords([]);
      }
    } catch (err) {
      console.error("Error fetching attendance records:", err);
      setError(err.message || "Failed to fetch attendance records. Please try again.");
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const checkInData = {
        checkInTime: new Date().toISOString(),
        staffId: currentStaff?._id,
        staffName: currentStaff?.name,
      };

      const response = await axios.post(`${BASE_URL}/staff/attendance/checkin`, checkInData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Check-in successful!");
        fetchAttendanceRecords();
      }
    } catch (err) {
      console.error("Error during check-in:", err);
      toast.error("Failed to check-in. Please try again.");
    }
  };

  const handleCheckOut = async (recordId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const checkOutData = {
        checkOutTime: new Date().toISOString(),
      };

      const response = await axios.put(`${BASE_URL}/staff/attendance/${recordId}/checkout`, checkOutData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Check-out successful!");
        fetchAttendanceRecords();
      }
    } catch (err) {
      console.error("Error during check-out:", err);
      toast.error("Failed to check-out. Please try again.");
    }
  };

  const filterRecords = () => {
    let filtered = [...attendanceRecords];

    // Filter by status
    if (selectedFilter) {
      filtered = filtered.filter(
        (record) => record.status?.toLowerCase() === selectedFilter.toLowerCase()
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
            const checkInDate = new Date(record.checkInTime);
            return checkInDate.toDateString() === today.toDateString();
          });
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(record => {
            const checkInDate = new Date(record.checkInTime);
            return checkInDate >= weekAgo;
          });
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(record => {
            const checkInDate = new Date(record.checkInTime);
            return checkInDate >= monthAgo;
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

  const getStatusBadge = (record) => {
    if (record.checkOutTime) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <FontAwesomeIcon icon={faClock} className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  const calculateWorkHours = (checkInTime, checkOutTime) => {
    if (!checkInTime || !checkOutTime) return "N/A";
    
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    const diffMs = checkOut - checkIn;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  const getCurrentStatus = () => {
    const today = new Date().toDateString();
    const todayRecord = attendanceRecords.find(record => {
      const recordDate = new Date(record.checkInTime).toDateString();
      return recordDate === today && !record.checkOutTime;
    });
    
    return todayRecord ? "checked-in" : "checked-out";
  };

  const currentStatus = getCurrentStatus();

  // Calculate stats
  const stats = {
    total: filteredRecords.length,
    active: filteredRecords.filter(record => !record.checkOutTime).length,
    completed: filteredRecords.filter(record => record.checkOutTime).length,
    avgHours: filteredRecords.length > 0
      ? filteredRecords
          .filter(record => record.checkOutTime)
          .reduce((sum, record) => {
            const hours = calculateWorkHours(record.checkInTime, record.checkOutTime);
            if (hours !== "N/A") {
              const [h, m] = hours.split("h ");
              return sum + parseInt(h) + parseInt(m) / 60;
            }
            return sum;
          }, 0) / filteredRecords.filter(record => record.checkOutTime).length
      : 0
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Staff Attendance</h1>
              <p className="text-sm text-muted-foreground">
                Track staff attendance and working hours
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAttendanceRecords}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faRefresh} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Current Status Card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Current Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentStaff?.name || "Staff Member"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge 
                      variant={currentStatus === "checked-in" ? "default" : "secondary"}
                      className={currentStatus === "checked-in" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {currentStatus === "checked-in" ? "Checked In" : "Checked Out"}
                    </Badge>
                  </div>
                  <Button
                    onClick={currentStatus === "checked-out" ? handleCheckIn : null}
                    disabled={currentStatus === "checked-in"}
                    className={currentStatus === "checked-out" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.total}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendar} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.active}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserClock} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.completed}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Hours</p>
                    <h3 className="text-2xl font-bold mt-2">{Math.round(stats.avgHours * 10) / 10}h</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border-0 shadow-sm">
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
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
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

          {/* Attendance Records Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Attendance Records</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredRecords.length} of {attendanceRecords.length} records
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
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faRefresh} className="h-4 w-4 animate-spin" />
                            Loading attendance records...
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
                          <TableCell className="text-sm text-muted-foreground">
                            {record.checkInTime
                              ? new Date(record.checkInTime).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {record.checkOutTime
                              ? new Date(record.checkOutTime).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {calculateWorkHours(record.checkInTime, record.checkOutTime)}
                          </TableCell>
                          <TableCell>{getStatusBadge(record)}</TableCell>
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
                              {!record.checkOutTime && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCheckOut(record._id)}
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3 mr-1" />
                                  Check Out
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FontAwesomeIcon icon={faCalendar} className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No attendance records found</p>
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
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>
              Detailed information about this attendance record.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Name</p>
                <p className="font-medium">{selectedRecord.staffName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check In Time</p>
                <p className="text-sm">
                  {selectedRecord.checkInTime
                    ? new Date(selectedRecord.checkInTime).toLocaleString("en-IN")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check Out Time</p>
                <p className="text-sm">
                  {selectedRecord.checkOutTime
                    ? new Date(selectedRecord.checkOutTime).toLocaleString("en-IN")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Duration</p>
                <p className="text-sm font-medium">
                  {calculateWorkHours(selectedRecord.checkInTime, selectedRecord.checkOutTime)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(selectedRecord)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Attendance;