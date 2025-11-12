import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faPlus,
  faUtensils,
  faUsers,
  faClock,
  faChartLine,
  faSearch,
  faFilter,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TableQRCodeModal from "./TableQRCodeModal";

function DashboardTable() {
  const [tableSection, setTableSection] = useState({ tableSection: "" });
  const [sections, setSections] = useState([]);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState(null);
  const [updateSection, setUpdateSection] = useState({});
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [tableName, setTableName] = useState({ tableId: "" });
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchSections();
    fetchTables();
  }, []);

  useEffect(() => {
    filterTables();
  }, [tables, sectionFilter, searchQuery]);

  const getTableSectionName = (table) => {
    if (!table) return "";
    const sectionInfo = table.tableSectionId;
    if (sectionInfo && typeof sectionInfo === "object") {
      return (
        sectionInfo.tableSection ||
        sectionInfo.name ||
        sectionInfo.label ||
        ""
      );
    }
    return table.tableSection || "";
  };

  const filterTables = () => {
    let filtered = [...tables];

    if (sectionFilter) {
      filtered = filtered.filter((table) => {
        const name = getTableSectionName(table);
        return (
          name &&
          name.trim().toLowerCase() === sectionFilter.trim().toLowerCase()
        );
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((table) =>
        table.tableId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.tableSectionId?.tableSection?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTables(filtered);
  };

  const fetchSections = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/dashboard/table/addsection`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSections(response.data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to fetch sections");
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/home/gettable`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(response.data || []);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to fetch tables");
    }
  };

  const submitAddSectionForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    if (!tableSection.tableSection.trim()) {
      toast.error("Section name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/dashboard/table/addsection`,
        tableSection,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTableSection({ tableSection: "" });
      toast.success(response.data.message || "Section added successfully");
      fetchSections();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Failed to add section.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitAddTableForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    const requestData = {
      tableSectionId: selectedSectionId,
      tableId: tableName.tableId.toString(),
    };

    try {
      const response = await axios.post(`${BASE_URL}/home/addtable`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message || "Table added successfully");
      setTableName({ tableId: "" });
      setSelectedSectionId("");
      setIsAddTableDialogOpen(false);
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to add table.");
    }
  };

  const handleSectionEdit = (section) => {
    setUpdateSection(section);
    setIsEditSectionDialogOpen(true);
  };

  const submitUpdateSectionForm = async (e) => {
    e.preventDefault();
    if (!updateSection.tableSection?.trim()) {
      toast.error("Section name cannot be empty.");
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/dashboard/table/updateSection/${updateSection._id}`,
        { tableSection: updateSection.tableSection },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success(response.data.message || "Section updated successfully.");
      setIsEditSectionDialogOpen(false);
      setUpdateSection({});
      fetchSections();
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to update section.");
    }
  };

  const deleteSection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section? This will also delete all tables in this section.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      // Delete related tables first
      await axios.delete(`${BASE_URL}/home/deleteSection/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Delete the section
      const response = await axios.delete(`${BASE_URL}/dashboard/table/deleteSection/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message || "Section deleted successfully.");
      fetchSections();
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to delete section.");
    }
  };

  const handleTableEdit = (table) => {
    setUpdateSection({ _id: table._id, tableSection: table.tableId });
    setIsEditTableDialogOpen(true);
  };

  const submitUpdateTableForm = async (e) => {
    e.preventDefault();
    if (!updateSection.tableSection?.trim()) {
      toast.error("Table name cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/home/updatetable/${updateSection._id}`,
        { tableId: updateSection.tableSection },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message || "Table updated successfully.");
      setIsEditTableDialogOpen(false);
      setUpdateSection({});
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to update table.");
    }
  };

  const deleteTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/home/deletetable/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Table deleted successfully.");
      fetchTables();
    } catch (error) {
      toast.error("Failed to delete table.");
    }
  };

  // Calculate stats
  const uniqueCategories = Array.from(
    new Set(
      tables
        .map((table) => getTableSectionName(table))
        .filter((name) => !!name)
        .map((name) => name.trim())
    )
  );

  const stats = {
    totalTables: tables.length,
    totalSections: sections.length,
    occupiedTables: Math.floor(tables.length * 0.6), // Mock data
    availableTables: tables.length - Math.floor(tables.length * 0.6),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Table Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage dining sections and table arrangements
              </p>
            </div>
            <Button onClick={() => setIsAddTableDialogOpen(true)} className="gap-2">
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              Add Table
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
                    <p className="text-sm font-medium text-muted-foreground">Total Tables</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.totalTables}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUtensils} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sections</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.totalSections}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.occupiedTables}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.availableTables}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Section Form */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Add New Section</CardTitle>
              <CardDescription>
                Create dining sections like Ground Floor, First Floor, AC Area, Garden, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitAddSectionForm} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="e.g., Ground Floor, AC Section, Garden Area"
                    name="tableSection"
                    value={tableSection.tableSection}
                    onChange={(e) =>
                      setTableSection({
                        ...tableSection,
                        [e.target.name]: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading} className="gap-2">
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                  Add Section
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sections Management */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Manage Sections</CardTitle>
              <CardDescription>View and manage all dining sections</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faClock} className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                  <p className="text-muted-foreground">Loading sections...</p>
                </div>
              ) : sections.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section Name</TableHead>
                        <TableHead className="text-center">Tables</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sections.map((section) => {
                        const tableCount = tables.filter((table) => {
                          const tableSectionName = getTableSectionName(table);
                          return (
                            tableSectionName &&
                            section.tableSection &&
                            tableSectionName.trim().toLowerCase() ===
                              section.tableSection.trim().toLowerCase()
                          );
                        }).length;
                        
                        return (
                          <TableRow key={section._id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">
                              {section.tableSection}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">
                                {tableCount} tables
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSectionEdit(section)}
                                >
                                  <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteSection(section._id)}
                                >
                                  <FontAwesomeIcon icon={faTrash} className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No sections found. Add your first section above.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tables Management */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Manage Tables</CardTitle>
                  <CardDescription>View and manage all restaurant tables</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative min-w-[250px]">
                    <FontAwesomeIcon 
                      icon={faSearch} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                    />
                    <Input
                      placeholder="Search tables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[150px]"
                  >
                    <option value="">All Sections</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTables.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table ID</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTables.map((table) => (
                        <TableRow key={table._id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            Table {table.tableId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {table.tableSectionId?.tableSection || "No Section"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={Math.random() > 0.6 ? "destructive" : "default"}
                              className={Math.random() > 0.6 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                            >
                              {Math.random() > 0.6 ? "Occupied" : "Available"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTableForQR(table);
                                  setIsQRModalOpen(true);
                                }}
                                className="bg-blue-50 hover:bg-blue-100"
                              >
                                <FontAwesomeIcon icon={faQrcode} className="h-3 w-3 mr-1" />
                                QR
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTableEdit(table)}
                              >
                                <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteTable(table._id)}
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
                  <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery || sectionFilter 
                      ? "No tables match your filters"
                      : "No tables found. Add your first table using the button above."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Table Dialog */}
      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Select a section and enter the table number or identifier.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAddTableForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Section</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select Section
                </option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.tableSection}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Table Number/ID</label>
              <Input
                type="text"
                placeholder="e.g., 1, 2, A1, VIP-1"
                name="tableId"
                value={tableName.tableId}
                onChange={(e) => setTableName({ ...tableName, [e.target.name]: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                Add Table
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditSectionDialogOpen} onOpenChange={setIsEditSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update the section name below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitUpdateSectionForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Section Name</label>
              <Input
                type="text"
                placeholder="Edit section name"
                name="tableSection"
                value={updateSection.tableSection || ""}
                onChange={(e) => setUpdateSection({ ...updateSection, [e.target.name]: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditSectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditTableDialogOpen} onOpenChange={setIsEditTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Update the table number/ID below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitUpdateTableForm} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Table Number/ID</label>
              <Input
                type="text"
                placeholder="Edit table name"
                name="tableSection"
                value={updateSection.tableSection || ""}
                onChange={(e) => setUpdateSection({ ...updateSection, [e.target.name]: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditTableDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <TableQRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => {
          setIsQRModalOpen(false);
          setSelectedTableForQR(null);
        }}
        table={selectedTableForQR}
      />
    </div>
  );
}

export default DashboardTable;
