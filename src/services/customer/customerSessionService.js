/**
 * Customer Session Service
 * Manages customer order session, cart, and order history
 * Uses localStorage to persist data across page refreshes
 */

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get session key for a table
 * @param {string} tableId - Table ID
 * @returns {string} Session key
 */
const getSessionKey = (tableId) => `customer_session_${tableId}`;

/**
 * Initialize or get existing session for a table
 * @param {string} tableId - Table ID
 * @returns {object} Session data
 */
export const initSession = (tableId) => {
  const sessionKey = getSessionKey(tableId);
  const existingSession = localStorage.getItem(sessionKey);
  
  if (existingSession) {
    const session = JSON.parse(existingSession);
    
    // Check if session expired
    if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
      clearSession(tableId);
      return createNewSession(tableId);
    }
    
    return session;
  }
  
  return createNewSession(tableId);
};

/**
 * Create a new session
 * @param {string} tableId - Table ID
 * @returns {object} New session data
 */
const createNewSession = (tableId) => {
  const session = {
    tableId,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    activeCart: [],
    orders: [], // Array of placed orders
    totalOrders: 0,
    customerVerified: false, // Track if customer verified phone
    customerPhone: null,
    customerName: null,
    customerId: null,
  };
  
  saveSession(tableId, session);
  return session;
};

/**
 * Save session to localStorage
 * @param {string} tableId - Table ID
 * @param {object} sessionData - Session data to save
 */
const saveSession = (tableId, sessionData) => {
  const sessionKey = getSessionKey(tableId);
  sessionData.lastUpdated = Date.now();
  localStorage.setItem(sessionKey, JSON.stringify(sessionData));
};

/**
 * Get current session
 * @param {string} tableId - Table ID
 * @returns {object|null} Session data or null
 */
export const getSession = (tableId) => {
  const sessionKey = getSessionKey(tableId);
  const session = localStorage.getItem(sessionKey);
  return session ? JSON.parse(session) : null;
};

/**
 * Clear session
 * @param {string} tableId - Table ID
 */
export const clearSession = (tableId) => {
  const sessionKey = getSessionKey(tableId);
  localStorage.removeItem(sessionKey);
};

/**
 * Get active cart
 * @param {string} tableId - Table ID
 * @returns {Array} Cart items
 */
export const getActiveCart = (tableId) => {
  const session = getSession(tableId) || initSession(tableId);
  return session.activeCart || [];
};

/**
 * Add item to cart
 * @param {string} tableId - Table ID
 * @param {object} item - Item to add
 * @returns {Array} Updated cart
 */
export const addToCart = (tableId, item) => {
  const session = getSession(tableId) || initSession(tableId);
  
  // Check if item already exists in cart
  const existingItemIndex = session.activeCart.findIndex(
    (cartItem) => cartItem._id === item._id
  );
  
  if (existingItemIndex > -1) {
    // Increase quantity
    session.activeCart[existingItemIndex].quantity += 1;
  } else {
    // Add new item
    session.activeCart.push({
      ...item,
      quantity: 1,
      addedAt: Date.now(),
    });
  }
  
  saveSession(tableId, session);
  return session.activeCart;
};

/**
 * Update cart item quantity
 * @param {string} tableId - Table ID
 * @param {string} itemId - Item ID
 * @param {number} quantity - New quantity
 * @returns {Array} Updated cart
 */
export const updateCartItemQuantity = (tableId, itemId, quantity) => {
  const session = getSession(tableId) || initSession(tableId);
  
  if (quantity <= 0) {
    // Remove item if quantity is 0
    session.activeCart = session.activeCart.filter(
      (item) => item._id !== itemId
    );
  } else {
    // Update quantity
    const itemIndex = session.activeCart.findIndex(
      (item) => item._id === itemId
    );
    if (itemIndex > -1) {
      session.activeCart[itemIndex].quantity = quantity;
    }
  }
  
  saveSession(tableId, session);
  return session.activeCart;
};

/**
 * Remove item from cart
 * @param {string} tableId - Table ID
 * @param {string} itemId - Item ID
 * @returns {Array} Updated cart
 */
export const removeFromCart = (tableId, itemId) => {
  const session = getSession(tableId) || initSession(tableId);
  session.activeCart = session.activeCart.filter(
    (item) => item._id !== itemId
  );
  saveSession(tableId, session);
  return session.activeCart;
};

/**
 * Clear active cart
 * @param {string} tableId - Table ID
 */
export const clearCart = (tableId) => {
  const session = getSession(tableId) || initSession(tableId);
  session.activeCart = [];
  saveSession(tableId, session);
};

/**
 * Add order to session history
 * @param {string} tableId - Table ID
 * @param {object} orderData - Order data
 * @returns {object} Added order
 */
export const addOrderToHistory = (tableId, orderData) => {
  const session = getSession(tableId) || initSession(tableId);
  
  const order = {
    ...orderData,
    orderId: orderData._id || orderData.orderId,
    status: 'pending',
    placedAt: Date.now(),
    items: session.activeCart, // Save current cart items
  };
  
  session.orders.push(order);
  session.totalOrders += 1;
  session.activeCart = []; // Clear cart after order
  
  saveSession(tableId, session);
  return order;
};

/**
 * Get order history
 * @param {string} tableId - Table ID
 * @returns {Array} Orders
 */
export const getOrderHistory = (tableId) => {
  const session = getSession(tableId) || initSession(tableId);
  return session.orders || [];
};

/**
 * Get pending orders (not completed by admin)
 * @param {string} tableId - Table ID
 * @returns {Array} Pending orders
 */
export const getPendingOrders = (tableId) => {
  const session = getSession(tableId) || initSession(tableId);
  return (session.orders || []).filter(
    (order) => order.status === 'pending' || order.status === 'confirmed'
  );
};

/**
 * Update order status
 * @param {string} tableId - Table ID
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 */
export const updateOrderStatus = (tableId, orderId, status) => {
  const session = getSession(tableId) || initSession(tableId);
  
  const orderIndex = session.orders.findIndex(
    (order) => order.orderId === orderId || order._id === orderId
  );
  
  if (orderIndex > -1) {
    session.orders[orderIndex].status = status;
    session.orders[orderIndex].updatedAt = Date.now();
    
    // If order is completed, mark it
    if (status === 'completed' || status === 'delivered') {
      session.orders[orderIndex].completedAt = Date.now();
    }
    
    saveSession(tableId, session);
  }
};

/**
 * Remove completed orders from session
 * @param {string} tableId - Table ID
 */
export const removeCompletedOrders = (tableId) => {
  const session = getSession(tableId) || initSession(tableId);
  
  session.orders = session.orders.filter(
    (order) => order.status !== 'completed' && order.status !== 'delivered'
  );
  
  saveSession(tableId, session);
};

/**
 * Check if session should be cleared (all orders completed)
 * @param {string} tableId - Table ID
 * @returns {boolean} True if session can be cleared
 */
export const shouldClearSession = (tableId) => {
  const session = getSession(tableId);
  if (!session) return true;
  
  const hasPendingOrders = session.orders.some(
    (order) => order.status === 'pending' || order.status === 'confirmed'
  );
  
  const hasActiveCart = session.activeCart && session.activeCart.length > 0;
  
  return !hasPendingOrders && !hasActiveCart;
};

/**
 * Get session statistics
 * @param {string} tableId - Table ID
 * @returns {object} Session stats
 */
export const getSessionStats = (tableId) => {
  const session = getSession(tableId) || initSession(tableId);
  
  const totalOrders = session.orders.length;
  const pendingOrders = session.orders.filter(
    (order) => order.status === 'pending' || order.status === 'confirmed'
  ).length;
  const completedOrders = session.orders.filter(
    (order) => order.status === 'completed' || order.status === 'delivered'
  ).length;
  
  const totalAmount = session.orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  
  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalAmount,
    cartItems: session.activeCart.length,
    sessionDuration: Date.now() - session.createdAt,
  };
};

/**
 * Restore cart from a previous order (for adding more items)
 * @param {string} tableId - Table ID
 * @param {string} orderId - Order ID to restore from
 */
export const restoreCartFromOrder = (tableId, orderId) => {
  const session = getSession(tableId) || initSession(tableId);
  
  const order = session.orders.find(
    (order) => order.orderId === orderId || order._id === orderId
  );
  
  if (order && order.items) {
    session.activeCart = [...order.items];
    saveSession(tableId, session);
  }
};

/**
 * Save customer verification details
 * @param {string} tableId - Table ID
 * @param {object} customerData - Customer data (phone, name, id)
 */
export const saveCustomerVerification = (tableId, customerData) => {
  const session = getSession(tableId) || initSession(tableId);
  
  session.customerVerified = true;
  session.customerPhone = customerData.phoneNumber || customerData.phone;
  session.customerName = customerData.name;
  session.customerId = customerData._id || customerData.customerId;
  
  saveSession(tableId, session);
};

/**
 * Check if customer is verified in session
 * @param {string} tableId - Table ID
 * @returns {boolean} True if customer verified
 */
export const isCustomerVerified = (tableId) => {
  const session = getSession(tableId);
  return session ? session.customerVerified === true : false;
};

/**
 * Get verified customer details
 * @param {string} tableId - Table ID
 * @returns {object|null} Customer details or null
 */
export const getVerifiedCustomer = (tableId) => {
  const session = getSession(tableId);
  if (!session || !session.customerVerified) {
    return null;
  }
  
  return {
    phoneNumber: session.customerPhone,
    name: session.customerName,
    customerId: session.customerId,
  };
};

/**
 * Clear customer verification (logout)
 * @param {string} tableId - Table ID
 */
export const clearCustomerVerification = (tableId) => {
  const session = getSession(tableId);
  if (session) {
    session.customerVerified = false;
    session.customerPhone = null;
    session.customerName = null;
    session.customerId = null;
    saveSession(tableId, session);
  }
};

export default {
  initSession,
  getSession,
  clearSession,
  getActiveCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  addOrderToHistory,
  getOrderHistory,
  getPendingOrders,
  updateOrderStatus,
  removeCompletedOrders,
  shouldClearSession,
  getSessionStats,
  restoreCartFromOrder,
  saveCustomerVerification,
  isCustomerVerified,
  getVerifiedCustomer,
  clearCustomerVerification,
};
