import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Customer Order Service
 * Handles customer order operations for QR ordering system
 * No authentication required - public APIs
 */

/**
 * Get table information by tableId
 * @param {string} tableId - Table ID from QR code
 * @returns {Promise} Table data
 */
export const getTableInfo = async (tableId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/customer/table/${tableId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching table info:", error);
    throw error;
  }
};

/**
 * Send OTP to customer phone
 * @param {string} phoneNumber - Customer phone number
 * @param {string} tableId - Table ID
 * @returns {Promise} OTP send response
 */
export const sendOtp = async (phoneNumber, tableId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/customer/send-otp`, {
      phoneNumber,
      tableId,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

/**
 * Verify OTP
 * @param {string} phoneNumber - Customer phone number
 * @param {string} otp - OTP code
 * @param {string} tableId - Table ID
 * @returns {Promise} Verification response
 */
export const verifyOtp = async (phoneNumber, otp, tableId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/customer/verify-otp`, {
      phoneNumber,
      otp,
      tableId,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

/**
 * Place customer order
 * @param {Object} orderData - Order data
 * @param {string} orderData.phoneNumber - Customer phone
 * @param {string} orderData.tableId - Table ID
 * @param {Array} orderData.items - Order items
 * @param {string} orderData.couponCode - Optional coupon code
 * @returns {Promise} Order response
 */
export const placeOrder = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/customer/place-order`, {
      phoneNumber: orderData.phoneNumber,
      tableId: orderData.tableId,
      items: orderData.items,
      couponCode: orderData.couponCode || null,
    });
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

/**
 * Get order status
 * @param {string} orderId - Order ID
 * @returns {Promise} Order status data
 */
export const getOrderStatus = async (orderId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/customer/order-status/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order status:", error);
    throw error;
  }
};

/**
 * Calculate cart total
 * @param {Array} cartItems - Cart items
 * @returns {number} Total amount
 */
export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (item.itemPrice * item.quantity);
  }, 0);
};

/**
 * Prepare order items from cart
 * @param {Array} cartItems - Cart items
 * @returns {Array} Formatted order items
 */
export const prepareOrderItems = (cartItems) => {
  return cartItems.map((item) => ({
    itemName: item.itemName,
    itemPrice: item.itemPrice,
    itemQuantity: item.quantity,
    itemCategory: item.itemCategory || "",
    itemDescription: item.itemDescription || "",
  }));
};

export default {
  getTableInfo,
  sendOtp,
  verifyOtp,
  placeOrder,
  getOrderStatus,
  calculateCartTotal,
  prepareOrderItems,
};
