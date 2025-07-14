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
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function DashboardTable() {
  const [tableSection, setTableSection] = useState({ tableSection: "" });
  const [sections, setSections] = useState([]);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);
  const [updateSection, setUpdateSection] = useState({});
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [tableName, setTableName] = useState({ tableId: "" });
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);

  //Add Table Dialog box
  const handleTableDialogOpen = () => {
    setIsAddTableDialogOpen(true);
  };

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setTableName({ ...tableName, [name]: value });
  };
  const handleSectionChange = (e) => {
    setSelectedSectionId(e.target.value);
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
      const response = await axios.post(
        "http://localhost:8000/home/addtable",
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message);
      setTableName({ tableId: "" });
      setSelectedSectionId("");
      setIsAddTableDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to submit the form.");
    }
  };

  // FOR TABLE-SECTION
  const fetchSections = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      // Fetch sections and tables concurrently
      const [sectionsResponse] = await Promise.all([
        axios.get("http://localhost:8000/dashboard/table/addsection", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      // Set the sections and tables state with the response data
      setSections(sectionsResponse.data || []); // Default to an empty array if response data is undefined
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside of the 2xx range
        console.error(
          `Error: ${error.response.status} - ${
            error.response.data.message || "Failed to fetch sections or tables"
          }`
        );
      } else if (error.request) {
        // No response was received
        console.error(
          "No response received from the server. Please try again."
        );
      } else {
        // Other errors
        console.error("An unexpected error occurred:", error.message);
      }
    }
  };

  useEffect(() => {
    fetchSections();
  }, []); // Empty dependency array as there are no dependencies

  const handleSectionDialogOpen = (section) => {
    setUpdateSection(section);
    setIsEditSectionDialogOpen(true);
  };

  const updateSectionHandler = (e) => {
    const { name, value } = e.target;
    setUpdateSection({ ...updateSection, [name]: value });
  };

  const submitUpdateSectionForm = async (e) => {
    e.preventDefault();

    // Validate input
    if (!updateSection.tableSection?.trim()) {
      return toast.error("Section name cannot be empty.");
    }
    if (!updateSection._id) {
      return toast.error("Invalid section ID. Please try again.");
    }

    try {
      // Send the update request
      const response = await axios.put(
        `http://localhost:8000/dashboard/table/updateSection/${updateSection._id}`,
        { tableSection: updateSection.tableSection }, // Only send necessary data
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
          },
        }
      );

      // Success handling
      toast.success(
        response.data.message || "Table section updated successfully."
      );
      setIsEditSectionDialogOpen(false);
      setUpdateSection({});
      fetchSections(); // Refresh the sections list
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        toast.error(
          error.response.data.message || "Failed to update table section."
        );
      } else if (error.request) {
        // No response received from the server
        toast.error("No response from the server. Please try again.");
      } else {
        // Other errors
        toast.error("An unexpected error occurred.");
      }
      console.error("Error updating table section:", error);
    }
  };

  const deleteSection = async (id) => {
    try {
      const token = localStorage.getItem("token");
    
      // Step 1: Ensure the user is authenticated
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }
    
      // Step 2: Delete all related tables
      const tablesResponse = await axios.delete(
        `http://localhost:8000/home/deleteSection/${id}`, // Endpoint for deleting related tables
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
      console.log(tablesResponse.data);
      console.log(`Deleted tables related to ID: ${id}`);
      toast.success("All related tables deleted successfully.");
    
      // Step 3: Delete the section
      const sectionResponse = await axios.delete(
        `http://localhost:8000/dashboard/table/deleteSection/${id}`, // Endpoint for deleting the section
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
      console.log(sectionResponse.data);
      toast.success(sectionResponse.data.message || "Section deleted successfully.");
    
      // Step 4: Refresh the sections list
      fetchSections();
      fetchTables(); // Re-fetch tables to reflect the update

    } catch (error) {
      console.error("Failed to delete table section and related tables:", error);
    
      // User-friendly error message
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred while deleting the section.");
      }
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
      const response = await axios.post(
        "http://localhost:8000/dashboard/table/addsection",
        tableSection,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset the form only after a successful submission
      setTableSection({ tableSection: "" });

      // Notify the user of success
      toast.success(response.data.message);

      // Refresh sections
      fetchSections();
    } catch (error) {
      // Handle different error scenarios
      if (error.response) {
        // Server responded with a status code outside of the 2xx range
        toast.error(
          error.response.data.message || "Failed to add table section."
        );
      } else if (error.request) {
        // No response was received
        toast.error("No response from server. Please try again later.");
      } else {
        // Other errors
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  // HERE FOR TABLE
  // Fetch all tables (instead of filtering at the backend)
  // Fetch tables only once when the component mounts
  useEffect(() => {
    fetchTables();
  }, [selectedSectionId]);  // Refetch only when selectedSectionId changes
  const fetchTables = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/home/gettable", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched Tables:", response.data);
      setTables(response.data || []); // Update the tables state
    } catch (error) {
      console.error("Error fetching tables:", error.message);
    }
  };

  // Fetch sections/categories (if you have them)
  const uniqueCategories = Array.from(
    new Set(tables.map((table) => table.tableSectionId?.tableSection))
  );

  // Filter tables based on selected section/category
  useEffect(() => {
    if (selectedSectionId) {
      const filtered = tables.filter(
        (table) => table.tableSectionId?.tableSection === selectedSectionId
      );
      setFilteredTables(filtered);
    } else {
      setFilteredTables(tables); // Show all tables if no section selected
    }

    // Fetch tables on component mount or section change
    // fetchTables();
  }, [selectedSectionId, tables]);
  // Handle category selection
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setSelectedSectionId(selectedCategory);
  };

  const handleTableSectionDialogOpen = (table) => {
    setUpdateSection({ _id: table._id, tableSection: table.tableId });
    setIsEditTableDialogOpen(true);
  };

  // Handle section selection
  // const handleSectionChangeT = (event) => {
  //   const sectionId = event.target.value;
  //   setSelectedSectionId(sectionId);
  // };

  //Update Table Name
  // const handleTableManageDialogOpen = () => {
  //   setIsAddTableDialogOpen(true);
  // };
  // Function to handle updating the table
  const submitUpdateTableForm = async (e) => {
    e.preventDefault();

    if (!updateSection.tableSection?.trim()) {
      return toast.error("Table name cannot be empty.");
    }

    if (!updateSection._id) {
      return toast.error("Invalid table ID. Please try again.");
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.put(
        `http://localhost:8000/home/updatetable/${updateSection._id}`,
        { tableId: updateSection.tableSection }, // Replace `tableSection` with `tableId` if needed
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Table updated successfully.");
      setIsEditTableDialogOpen(false);
      setUpdateSection({});
      fetchTables(); // Re-fetch tables to reflect the update
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message || "Failed to update the table."
        );
      } else if (error.request) {
        toast.error("No response from the server. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  // Delete table
  const deleteTable = async (tableId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/home/deletetable/${tableId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Table deleted successfully.");
      fetchTables(); // Refresh tables after deletion
    } catch (error) {
      toast.error("Failed to delete table.");
    }
  };

  // Initialize sections and tables on component mount
  // useEffect(() => {
  //   fetchSections();
  //   fetchTables();
  // }, []);

  return (
    <div className="flex ml-56 min-h-screen flex-col bg-muted/40 pb-2">
      <div className="flex justify-end p-3">
        <button
          onClick={handleTableDialogOpen}
          className="text-white p-2 rounded-md font-medium bg-[#4caf50] hover:bg-[#419844]"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Add Table
        </button>
      </div>

      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid grid-cols-1 mx-20 md:mx-40 gap-3">
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                Add Sections
              </CardTitle>
              <CardDescription className="text-base">
                Like Floors, AC, Non-AC, Indoor, Outdoor, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitAddSectionForm}>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Eg. Ground Floor"
                    name="tableSection"
                    value={tableSection.tableSection}
                    onChange={(e) =>
                      setTableSection({
                        ...tableSection,
                        [e.target.name]: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                  <Button
                    type="submit"
                    className="bg-[#4caf50] hover:bg-[#419844]"
                  >
                    Add Section
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-base text-left font-medium">
                Manage Table Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Sr. No.</TableHead>
                      <TableHead className="text-center">Section</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections.map((section, index) => (
                      <TableRow key={section._id}>
                        <TableCell className="p-2 text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="p-2 text-center">
                          {section.tableSection}
                        </TableCell>
                        <TableCell className="text-right space-x-2 p-2">
                          <Button
                            className="bg-[#4caf50] hover:bg-[#419844] px-2"
                            onClick={() => handleSectionDialogOpen(section)}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </Button>
                          <Button
                            className="bg-[#f44336] hover:bg-[#da190b] px-2"
                            onClick={() => deleteSection(section._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground">
                  No sections available.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-base text-left font-medium flex justify-between">
                <div>Manage Tables</div>
                <div>
                  <select
                    className="p-1.5 border border-gray-300 rounded-md text-sm"
                    aria-label="Filter by category"
                    onChange={handleCategoryChange} // Handle change event
                    value={selectedSectionId}
                  >
                    <option value="">Filter by section</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tables associated with the selected section */}
              {filteredTables.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Sr. No.</TableHead>
                      <TableHead className="text-center">Table ID</TableHead>
                      <TableHead className="text-center">Section</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTables.map((table, index) => (
                      <TableRow key={table._id}>
                        <TableCell className="p-2 text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="p-2 text-center">
                          {table.tableId}
                        </TableCell>
                        <TableCell className="p-2 text-center">
                          {table.tableSectionId?.tableSection || "no section"}
                        </TableCell>
                        <TableCell className="text-right space-x-2 p-2">
                          <Button
                            className="bg-[#4caf50] hover:bg-[#419844] px-2"
                            onClick={() => handleTableSectionDialogOpen(table)}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </Button>
                          <Button
                            className="bg-[#f44336] hover:bg-[#da190b] px-2"
                            onClick={() => deleteTable(table._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground">
                  No tables available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog for Adding Table */}
        <Dialog
          open={isAddTableDialogOpen}
          onOpenChange={setIsAddTableDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Table</DialogTitle>
              <DialogDescription>
                Select a section and enter the table number.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitAddTableForm}>
              <div className="flex gap-2 mb-4">
                <select
                  className="w-full p-2 border rounded"
                  value={selectedSectionId}
                  onChange={handleSectionChange}
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
              <Input
                type="text"
                placeholder="Enter Table Number"
                name="tableId"
                value={tableName.tableId}
                onChange={inputHandler}
                required
              />
              <div className="mt-4">
                <Button
                  type="submit"
                  className="bg-[#4caf50] hover:bg-[#419844]"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog for Editing Section */}
        <Dialog
          open={isEditSectionDialogOpen}
          onOpenChange={setIsEditSectionDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Section</DialogTitle>
              <DialogDescription>
                Make changes to the section below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitUpdateSectionForm}>
              <Input
                type="text"
                placeholder="Edit section name"
                name="tableSection"
                value={updateSection.tableSection || ""}
                onChange={updateSectionHandler}
                className="w-full"
              />
              <div className="mt-4">
                <Button
                  type="submit"
                  className="bg-[#4caf50] hover:bg-[#419844]"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog for Editing Table */}
        <Dialog
          open={isEditTableDialogOpen}
          onOpenChange={setIsEditTableDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Section</DialogTitle>
              <DialogDescription>
                Make changes to the table below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitUpdateTableForm}>
              <Input
                type="text"
                placeholder="Edit Table name"
                name="tableSection"
                value={updateSection.tableSection || ""}
                onChange={updateSectionHandler}
                className="w-full"
              />
              <div className="mt-4">
                <Button
                  type="submit"
                  className="bg-[#4caf50] hover:bg-[#419844]"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default DashboardTable;
