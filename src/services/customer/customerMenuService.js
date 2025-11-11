import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Customer Menu Service
 * Handles menu fetching for customer-facing pages
 * No authentication required - public API
 */

/**
 * Get all available menu items (public)
 * @returns {Promise} Menu items array
 */
export const getPublicMenuItems = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/menu/itemall-public`);
    return response.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

/**
 * Extract unique categories from menu items
 * @param {Array} menuItems - Menu items with populated categoryId
 * @returns {Array} Array of unique category names
 */
export const extractCategories = (menuItems) => {
  const uniqueCategories = [...new Set(
    menuItems
      .filter(item => item.categoryId && item.categoryId.categoryName)
      .map(item => item.categoryId.categoryName)
  )];
  
  return ["All", ...uniqueCategories];
};

/**
 * Filter menu items by category
 * @param {Array} menuItems - All menu items
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered menu items
 */
export const filterByCategory = (menuItems, category) => {
  if (category === "All") {
    return menuItems;
  }
  return menuItems.filter(item => item.categoryId?.categoryName === category);
};

/**
 * Group menu items by category
 * @param {Array} menuItems - Menu items to group
 * @returns {Object} Items grouped by category
 */
export const groupByCategory = (menuItems) => {
  return menuItems.reduce((acc, item) => {
    const category = item.categoryId?.categoryName || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});
};

/**
 * Convert menu item to cart item format
 * @param {Object} menuItem - Menu item from API
 * @returns {Object} Cart item format
 */
export const toCartItem = (menuItem) => {
  return {
    _id: menuItem._id,
    itemName: menuItem.name,
    itemPrice: menuItem.price,
    itemCategory: menuItem.categoryId?.categoryName || "",
    itemDescription: "",
    quantity: 1,
  };
};

export default {
  getPublicMenuItems,
  extractCategories,
  filterByCategory,
  groupByCategory,
  toCartItem,
};
