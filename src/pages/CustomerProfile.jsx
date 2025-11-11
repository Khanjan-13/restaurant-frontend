import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Phone, LogOut, ShoppingBag, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getSession,
  getSessionStats,
  clearSession,
  getVerifiedCustomer,
  isCustomerVerified,
  clearCustomerVerification,
} from '@/services/customer/customerSessionService';
import CustomerBottomNav from '@/components/webComponent/Customer/CustomerBottomNav';
import toast from 'react-hot-toast';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  
  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!tableId) {
      navigate('/');
      return;
    }
    
    loadCustomerData();
  }, [tableId]);

  const loadCustomerData = () => {
    const verified = isCustomerVerified(tableId);
    
    if (!verified) {
      toast.error("Please verify your phone number first");
      navigate(`/customer-menu?tableId=${tableId}`);
      return;
    }
    
    const customerData = getVerifiedCustomer(tableId);
    const sessionData = getSession(tableId);
    const sessionStats = getSessionStats(tableId);
    
    setCustomer(customerData);
    setSession(sessionData);
    setStats(sessionStats);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Your cart and session will be cleared.')) {
      clearSession(tableId);
      toast.success('Logged out successfully');
      navigate(`/customer/menu/${tableId}`);
    }
  };

  const handleClearVerification = () => {
    if (window.confirm('Clear verification? You will need to verify again for next orders.')) {
      clearCustomerVerification(tableId);
      toast.success('Verification cleared');
      navigate(`/customer-menu?tableId=${tableId}`);
    }
  };

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full">
              <User className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {customer.name || 'Guest'}
              </h1>
              <p className="text-orange-100 flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4" />
                {customer.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">₹{stats.totalAmount}</p>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session Info */}
        {session && (
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Started</span>
                <Badge variant="outline">{formatDate(session.createdAt)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration</span>
                <Badge variant="outline">{formatDuration(stats.sessionDuration)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items in Cart</span>
                <Badge className="bg-orange-500">{stats.cartItems}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Orders</span>
                <Badge className="bg-blue-500">{stats.pendingOrders}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Orders</span>
                <Badge className="bg-green-500">{stats.completedOrders}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Status */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 font-semibold flex items-center gap-2">
                ✓ Phone Verified
              </p>
              <p className="text-sm text-green-700 mt-1">
                You can place orders without OTP verification until you logout
              </p>
            </div>
            
            <Button
              onClick={handleClearVerification}
              variant="outline"
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Clear Verification (Require OTP Again)
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-white/90 backdrop-blur border-red-200">
          <CardContent className="pt-4">
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout & Clear Session
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will clear your cart, orders, and session data
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate(`/customer-menu?tableId=${tableId}`)}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            Browse Menu
          </Button>
          <Button
            onClick={() => navigate(`/customer/order-history?tableId=${tableId}`)}
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            View Orders
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <CustomerBottomNav tableId={tableId} />
    </div>
  );
};

export default CustomerProfile;
