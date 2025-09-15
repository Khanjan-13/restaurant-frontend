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
} from "@fortawesome/free-solid-svg-icons";
function TableStaff() {
    const { groupedTables, fetchTables } = useTableStore(); // Get store methods and data
  const navigate = useNavigate();
  // const { pickupTables, fetchPickupTables } = useTableStore(); // Access store methods and data

  useEffect(
    () => {
      const fetchData = async () => {
        try {
          await fetchTables();
          // await fetchPickupTables();
        } catch (error) {
          console.error("Error fetching table data:", error);
          toast.error("Failed to fetch table data.");
        }
      };

      fetchData();
    },
    [fetchTables]
    // [fetchPickupTables]
  ); // Ensure fetchTables is stable to avoid unnecessary re-renders

  const handleTableClick = (tableId) => {
    navigate("/staff/menu", { state: { tableId } });
  };
  const handlePickupTableClick = (token) => {
    navigate("/Orders", { state: { token } });
  };
  return (
    <div className="flex ml-56 min-h-screen flex-col bg-muted/40 pt-5">
      <main className="grid flex-1 items-start mx-20 md:mx-30 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="bg-background shadow-lg rounded-none p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#4caf50] mb-4">Table Management</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCircle}
                  className="h-5 w-5 text-green-500"
                />
                <span className="text-sm font-medium text-muted-foreground">Empty</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon 
                  icon={faCircle} 
                  className="h-5 w-5 text-red-500" 
                />
                <span className="text-sm font-medium text-muted-foreground">Ongoing</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {Object.keys(groupedTables).length > 0 ? (
              Object.keys(groupedTables).map((section, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faLeaf}
                      className="h-5 w-5 text-[#4caf50]"
                    />
                    <h3 className="text-lg font-semibold text-foreground">{section}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {groupedTables[section].map((table, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTableClick(table.tableId)}
                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4caf50] focus:ring-offset-2 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        <div
                          className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg border-2 ${
                            table.status === "true" 
                              ? "bg-red-500 border-red-600 hover:bg-red-600" 
                              : "bg-[#4caf50] border-[#4caf50] hover:bg-[#419844]"
                          } shadow-md transition-colors duration-200`}
                        >
                          <span className="text-white font-bold text-lg">
                            {table.tableId}
                          </span>
                          {table.status === "true" && (
                            <span className="text-sm text-white font-semibold mt-1">
                              ₹{table.totalAmount?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-lg font-medium text-muted-foreground">
                  No table data available.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default TableStaff