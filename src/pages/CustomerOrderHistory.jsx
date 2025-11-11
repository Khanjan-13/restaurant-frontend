import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, ShoppingBag, CheckCircle, Package, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getOrderHistory,
  getPendingOrders,
  getSessionStats,
  updateOrderStatus,
  removeCompletedOrders,
  restoreCartFromOrder,
} from '@/services/customer/customerSessionService';
import { getOrderStatus } from '@/services/customer/customerOrderService';
import CustomerBottomNav from '@/components/webComponent/Customer/CustomerBottomNav';

const CustomerOrderHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!tableId) {
      navigate('/');
      return;
    }
    
    loadOrderHistory();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      checkOrderUpdates();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [tableId]);

  const loadOrderHistory = () => {
    setLoading(true);
    const history = getOrderHistory(tableId);
    const sessionStats = getSessionStats(tableId);
    
    setOrders(history.reverse()); // Show newest first
    setStats(sessionStats);
    setLoading(false);
  };

  const checkOrderUpdates = async () => {
    setRefreshing(true);
    const pendingOrders = getPendingOrders(tableId);
    
    // Check each pending order status from backend
    for (const order of pendingOrders) {
      try {
        const response = await getOrderStatus(order.orderId);
        
        if (response.data) {
          const backendOrder = response.data.order || response.data;
          
          // Check if order is completed/delivered
          if (backendOrder.orderStatus === 'delivered' || backendOrder.orderStatus === 'completed') {
            updateOrderStatus(tableId, order.orderId, 'completed');
          } else if (backendOrder.orderStatus === 'preparing' || backendOrder.orderStatus === 'confirmed') {
            updateOrderStatus(tableId, order.orderId, 'confirmed');
          }
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    }
    
    loadOrderHistory();
    setRefreshing(false);
  };

  const handleAddMoreItems = (orderId) => {
    // Navigate to menu to add more items
    navigate(`/customer-menu?tableId=${tableId}`);
  };

  const handleViewMenu = () => {
    navigate(`/customer-menu?tableId=${tableId}`);
  };

  const handleClearCompleted = () => {
    removeCompletedOrders(tableId);
    loadOrderHistory();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary', color: 'bg-yellow-500' },
      confirmed: { label: 'Confirmed', variant: 'default', color: 'bg-blue-500' },
      preparing: { label: 'Preparing', variant: 'default', color: 'bg-orange-500' },
      completed: { label: 'Completed', variant: 'default', color: 'bg-green-500' },
      delivered: { label: 'Delivered', variant: 'default', color: 'bg-green-600' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'completed':
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" />
                My Orders
              </h1>
              {stats && (
                <p className="text-orange-100 text-sm mt-1">
                  {stats.totalOrders} order{stats.totalOrders !== 1 ? 's' : ''} • {formatAmount(stats.totalAmount)} total
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkOrderUpdates}
              disabled={refreshing}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-600">Total Orders</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.pendingOrders}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="py-12">
              <div className="text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 mb-6">Start ordering to see your order history here</p>
                <Button onClick={handleViewMenu} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {orders.map((order, index) => (
              <Card key={order.orderId || index} className="bg-white/90 backdrop-blur shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-base font-semibold">
                          Order #{order.tokenNumber || (index + 1)}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {formatTime(order.placedAt)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.itemName || item.name}</p>
                          {item.itemDescription && (
                            <p className="text-xs text-gray-500">{item.itemDescription}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-gray-600">x{item.quantity || item.itemQuantity}</p>
                          <p className="font-semibold text-gray-800">
                            {formatAmount((item.itemPrice || item.price) * (item.quantity || item.itemQuantity || 1))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Amount</span>
                      <span className="text-xl font-bold text-orange-600">
                        {formatAmount(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddMoreItems(order.orderId)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add More Items
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Clear Completed Button */}
            {stats && stats.completedOrders > 0 && (
              <Button
                onClick={handleClearCompleted}
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Clear Completed Orders
              </Button>
            )}
          </>
        )}

        {/* New Order Button */}
        <Button
          onClick={handleViewMenu}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-6 text-lg font-semibold shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Place New Order
        </Button>
      </div>
      
      {/* Bottom Navigation */}
      {tableId && <CustomerBottomNav tableId={tableId} />}
    </div>
  );
};

export default CustomerOrderHistory;
