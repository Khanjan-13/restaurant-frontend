import { create } from "zustand";
import axios from "axios";

export const useTableStore = create((set) => ({
  tables: [],
  groupedTables: {},

  fetchTables: async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [tableResponse, orderResponse] = await Promise.all([
        axios.get("http://localhost:8000/home/gettable", { headers }),
        axios.get("http://localhost:8000/home/getallkot", { headers }),
      ]);

      const tables = tableResponse.data.map((table) => {
        // All KOT rows for this table
        const relatedOrders = orderResponse.data.filter(
          (o) => o.tableNumber === table.tableId
        );

        // Flatten items
        const items = relatedOrders.map((o) => ({
          itemName: o.itemName,
          itemPrice: Number(o.itemPrice || 0),
          itemQuantity: Number(o.itemQuantity || 0),
        }));

        // Sub-total (no tax)
        const subTotal = items.reduce(
          (sum, it) => sum + it.itemPrice * it.itemQuantity,
          0
        );

        // 5 % tax
        const tax = subTotal * 0.05;

        // After-tax total
        const totalAmount = subTotal + tax;

        return {
          ...table,
          status: relatedOrders.length > 0 ? "true" : "false",
          tableSection: table.tableSectionId?.tableSection || "Uncategorized",
          items,
          subTotal, // before-tax
          tax, // 5 % of subtotal
          totalAmount, // after-tax
        };
      });

      // Group by section
      const groupedTables = tables.reduce((acc, tbl) => {
        (acc[tbl.tableSection] ||= []).push(tbl);
        return acc;
      }, {});

      set({ tables, groupedTables });
    } catch (err) {
      console.error("Error fetching table data:", err);
    }
  },
}));
