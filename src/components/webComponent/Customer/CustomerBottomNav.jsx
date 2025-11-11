import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Home, ShoppingCart, History, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getActiveCart, getSessionStats } from '@/services/customer/customerSessionService';

const CustomerBottomNav = ({ tableId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get cart count and pending orders
  const cart = getActiveCart(tableId);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const stats = getSessionStats(tableId);
  const pendingCount = stats?.pendingOrders || 0;

  const navItems = [
    {
      name: 'Menu',
      icon: Home,
      path: `/customer-menu?tableId=${tableId}`,
      isActive: location.pathname.includes('/customer-menu') || location.pathname.includes('/customer/menu'),
    },
    {
      name: 'Cart',
      icon: ShoppingCart,
      path: `/customer/checkout?tableId=${tableId}`,
      isActive: location.pathname.includes('/checkout'),
      badge: cartCount,
    },
    {
      name: 'Orders',
      icon: History,
      path: `/customer/order-history?tableId=${tableId}`,
      isActive: location.pathname.includes('/order-history') || location.pathname.includes('/order-status'),
      badge: pendingCount,
    },
    {
      name: 'Profile',
      icon: User,
      path: `/customer/profile?tableId=${tableId}`,
      isActive: location.pathname.includes('/profile'),
    },
  ];

  const handleNavigation = (path, name) => {
    // If going to cart and cart is empty, show message
    if (name === 'Cart' && cartCount === 0) {
      // Still navigate, checkout page will handle empty cart
    }
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-2 py-3">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path, item.name)}
                className={`relative flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${isActive ? 'animate-pulse' : ''}`} />
                  {item.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-1.5 py-0 text-xs min-w-[18px] h-[18px] flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerBottomNav;
