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
import { NavLink } from "react-router-dom";


function TableSection() {
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
    navigate("/Orders", { state: { tableId } });
  };
  const handlePickupTableClick = (token) => {
    navigate("/Orders", { state: { token } });
  };
  return (
    <>
      <div className="mt-2 flex justify-between gap-2 mr-3">
        <div className="flex items-center ml-5 gap-3">
          <span className="flex gap-2 items-center font-medium text-gray-800">
            {" "}
            <FontAwesomeIcon
              icon={faCircle}
              className="h-7 w-7 text-green-400"
            />
            Empty
          </span>
          <span className="flex gap-2 items-center font-medium text-gray-800">
            {" "}
            <FontAwesomeIcon icon={faCircle} className="h-7 w-7 text-red-400" />
            Ongoing
          </span>
        </div>
        <div className="flex gap-2">
          <button
            
            className="text-white p-2 rounded-md font-medium bg-[#4caf50] hover:bg-[#419844]"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-1" />
            Reserved Table
          </button>
        </div>
      </div>

      <div className="mx-5">
        {Object.keys(groupedTables).length > 0 ? (
          Object.keys(groupedTables).map((section, index) => (
            <div key={index} className="py-2">
              <div className="text-left font-semibold text-lg my-2">
                <FontAwesomeIcon
                  icon={faLeaf}
                  className="h-4 w-4 mr-1 text-[#4caf50]"
                />
                {section}
              </div>
              <div className="flex gap-10 flex-wrap">
                {groupedTables[section].map((table, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTableClick(table.tableId)}
                    className="cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-[105px] aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-red-600 border-dashed ${
                        table.status === "true" ? "bg-red-400" : "bg-green-400"
                      }`}
                    >
                      <span
                        className={`text-white  ${
                          table.status === "true"
                            ? "font-bold"
                            : "font-semibold"
                        }`}
                      >
                        {table.tableId}
                      </span>
                      {/* Removed tableTotals logic */}
                      {table.status === "true" && (
                        <span className="text-md text-white font-bold mt-2 p-1">
                          {table.totalAmount?.toFixed(2)} ₹
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-lg font-medium text-gray-600">
            No table data available.
          </div>
        )}
      </div>

      {/* <div className="mx-5">
        {pickupTables.length > 0 ? (
          <div className="py-2">
            <div className="text-left font-semibold text-lg my-2">
              <FontAwesomeIcon
                icon={faLeaf}
                className="h-4 w-4 mr-1 text-[#4caf50]"
              />
              PICK UP
            </div>
            <div className="flex gap-10 flex-wrap"> */}
      {/* Filter out duplicate tables based on the token */}
      {/* {pickupTables
                .filter(
                  (value, index, self) =>
                    index === self.findIndex((t) => t.token === value.token) // Remove duplicates based on token
                )
                .map((table, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePickupTableClick(table.token)}
                    className="cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-[105px] aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-red-600 border-dashed ${
                        table.status === "true" ? "bg-red-400" : "bg-green-400"
                      }`}
                    >
                      <span className="text-white font-bold">
                        {table.token}
                      </span>
                      <span className="text-md text-white font-bold mt-2 p-1">
                        {table.totalAmount?.toFixed(2)} ₹
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-lg font-medium text-gray-600">
            No PICK UP table data available.
          </div>
        )}
      </div> */}
    </>
  );
}

export default TableSection;
