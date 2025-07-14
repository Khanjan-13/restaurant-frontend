import React, { useEffect, useState } from "react";
import axios from "axios";

function MenuStaff() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:8000/dashboard/menu/itemall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMenuItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

  useEffect(() => {
    const filtered = menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, menuItems]);

  const updateQty = (itemId, change) => {
    setCart((prev) => {
      const currentQty = prev[itemId]?.qty || 1;
      const newQty = Math.max(1, currentQty + change);
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          qty: newQty,
        },
      };
    });
  };

  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: {
        ...item,
        qty: 1,
      },
    }));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white min-h-screen">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search items..."
        className="w-full p-3 mb-4 rounded-md border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Menu List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isInCart = !!cart[item.id];
          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center justify-between border border-green-200 rounded-lg px-4 py-3 bg-green-50"
            >
              <span className="capitalize text-lg font-semibold text-green-800 mb-2 sm:mb-0">
                {item.name}
              </span>

              <div className="flex items-center space-x-2">
                {isInCart ? (
                  <>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="px-3 py-1 border rounded text-green-700 border-green-500 hover:bg-green-100"
                    >
                      −
                    </button>

                    <span className="w-6 text-center text-green-800">
                      {cart[item.id].qty}
                    </span>

                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="px-3 py-1 border rounded text-green-700 border-green-500 hover:bg-green-100"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MenuStaff;
