import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Customer KOT Service
 * Handles KOT (Kitchen Order Ticket) creation for customer orders
 * No authentication required - public API
 */

/**
 * Create KOT for customer order
 * @param {Object} kotData - KOT data
 * @param {string} kotData.tableId - Table ID
 * @param {number} kotData.tokenNumber - Order token number
 * @param {Array} kotData.items - Order items
 * @param {number} kotData.totalAmount - Total order amount
 * @returns {Promise} API response
 */
export const createCustomerKot = async (kotData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/customer/kot`,
      {
        tableId: kotData.tableId,
        tokenNumber: kotData.tokenNumber,
        items: kotData.items,
        totalAmount: kotData.totalAmount,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating customer KOT:", error);
    throw error;
  }
};

/**
 * Prepare KOT items from cart
 * @param {Array} cartItems - Cart items
 * @returns {Array} Formatted KOT items
 */
export const prepareKotItems = (cartItems) => {
  return cartItems.map((item) => ({
    itemName: item.itemName,
    itemPrice: item.itemPrice,
    itemQuantity: item.quantity,
    itemCategory: item.itemCategory || "",
    itemDescription: item.itemDescription || "",
  }));
};

/**
 * Generate token number
 * @returns {number} Random 6-digit token number
 */
export const generateTokenNumber = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export default {
  createCustomerKot,
  prepareKotItems,
  generateTokenNumber,
};
