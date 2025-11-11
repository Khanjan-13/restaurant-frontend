import { useTableStore } from "@/zustandStore/tableStore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHourglass2,
  faPlus,
  faCircle,
  faUtensils,
  faUsers,
  faClock,
  faMapMarkerAlt,
  faSearch,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

function TableSection() {
  const { groupedTables, fetchTables } = useTableStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, available, occupied
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchTables();
      } catch (error) {
        console.error("Error fetching table data:", error);
        toast.error("Failed to fetch table data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchTables]);

  const handleTableClick = (tableId) => {
    navigate("/Orders", { state: { tableId } });
  };

  const handlePickupTableClick = (token) => {
    navigate("/Orders", { state: { token } });
  };

  // Filter tables based on search and status
  const getFilteredSections = () => {
    if (!groupedTables || Object.keys(groupedTables).length === 0) return {};

    const filtered = {};
    
    Object.keys(groupedTables).forEach(section => {
      // Filter by selected section
      if (selectedSection && section !== selectedSection) return;

      let tables = groupedTables[section];

      // Filter by search query
      if (searchQuery) {
        tables = tables.filter(table =>
          table.tableId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by status
      if (statusFilter !== "all") {
        tables = tables.filter(table => {
          const isOccupied = table.status === "true";
          return statusFilter === "occupied" ? isOccupied : !isOccupied;
        });
      }

      if (tables.length > 0) {
        filtered[section] = tables;
      }
    });

    return filtered;
  };

  const filteredSections = getFilteredSections();
  const allSections = Object.keys(groupedTables);

  // Calculate stats
  const allTables = Object.values(groupedTables).flat();
  const occupiedTables = allTables.filter(table => table.status === "true");
  const availableTables = allTables.filter(table => table.status !== "true");
  const totalRevenue = occupiedTables.reduce((sum, table) => sum + (table.totalAmount || 0), 0);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSection("");
    setStatusFilter("all");
  };

  return (
    <div className="flex-1 bg-muted/30">
      {/* Header Section */}
      <div className="bg-background border-b">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUtensils} className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Tables</p>
                  <p className="text-xl font-bold">{allTables.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCircle} className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Available</p>
                  <p className="text-xl font-bold">{availableTables.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Occupied</p>
                  <p className="text-xl font-bold">{occupiedTables.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faClock} className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Revenue</p>
                  <p className="text-lg font-bold">₹{totalRevenue.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button 
                className="gap-2"
                onClick={() => {
                  // Find the first available table
                  const availableTable = allTables.find(table => table.status !== "true");
                  if (availableTable) {
                    toast.success(`Reserving Table ${availableTable.tableId}`);
                    handleTableClick(availableTable.tableId);
                  } else {
                    toast.error("No available tables to reserve");
                  }
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                Reserve Table
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-t bg-muted/20">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
                />
                <Input
                  placeholder="Search tables or sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
              >
                <option value="">All Sections</option>
                {allSections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
              >
                <option value="all">All Tables</option>
                <option value="available">Available Only</option>
                <option value="occupied">Occupied Only</option>
              </select>

              {(searchQuery || selectedSection || statusFilter !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FontAwesomeIcon icon={faUtensils} className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Loading tables...</p>
            </div>
          </div>
        ) : Object.keys(filteredSections).length > 0 ? (
          <div className="space-y-8">
            {Object.keys(filteredSections).map((section, index) => (
              <div key={index} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{section}</h3>
                      <p className="text-sm text-muted-foreground">
                        {filteredSections[section].length} table{filteredSections[section].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-muted">
                    {filteredSections[section].filter(t => t.status !== "true").length} available
                  </Badge>
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {filteredSections[section].map((table, idx) => {
                    const isOccupied = table.status === "true";
                    const totalAmount = table.totalAmount || 0;

                    return (
                      <Card
                        key={idx}
                        className={`group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${
                          isOccupied
                            ? "border-red-200 bg-red-50 hover:bg-red-100"
                            : "border-green-200 bg-green-50 hover:bg-green-100"
                        }`}
                        onClick={() => handleTableClick(table.tableId)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="space-y-2">
                            {/* Table Icon */}
                            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                              isOccupied ? "bg-red-200" : "bg-green-200"
                            }`}>
                              <FontAwesomeIcon 
                                icon={faUtensils} 
                                className={`h-5 w-5 ${
                                  isOccupied ? "text-red-700" : "text-green-700"
                                }`} 
                              />
                            </div>

                            {/* Table Number */}
                            <div>
                              <p className="font-bold text-lg">Table {table.tableId}</p>
                              <p className={`text-sm font-medium ${
                                isOccupied ? "text-red-700" : "text-green-700"
                              }`}>
                                {isOccupied ? "Occupied" : "Available"}
                              </p>
                            </div>

                            {/* Order Amount (if occupied) */}
                            {isOccupied && totalAmount > 0 && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground">Current Bill</p>
                                <p className="font-bold text-red-700">₹{totalAmount.toFixed(0)}</p>
                              </div>
                            )}

                            {/* Status Indicator */}
                            <div className="flex items-center justify-center">
                              <div className={`w-2 h-2 rounded-full ${
                                isOccupied ? "bg-red-500" : "bg-green-500"
                              }`} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon icon={faUtensils} className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tables Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || selectedSection || statusFilter !== "all"
                ? "No tables match your current filters. Try adjusting your search criteria."
                : "No table data available. Please contact your administrator."
              }
            </p>
            {(searchQuery || selectedSection || statusFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TableSection;
