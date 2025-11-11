import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, MapPin, Hash, ArrowRight, Sparkles } from 'lucide-react';
import { initSession } from '@/services/customer/customerSessionService';

const CustomerWelcome = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('Fine Dining Restaurant');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!tableId) {
      toast.error('Invalid QR code');
      return;
    }

    // Initialize session
    initSession(tableId);
    fetchTableInfo();
  }, [tableId]);

  const fetchTableInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/customer/table/${tableId}`);
      setTableInfo(response.data);
      
      // Try to get restaurant name from localStorage or user data
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.restaurantName) {
        setRestaurantName(userData.restaurantName);
      }
    } catch (error) {
      console.error('Error fetching table info:', error);
      toast.error('Could not load table information');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderNow = () => {
    navigate(`/customer-menu?tableId=${tableId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-green-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        {/* Restaurant Logo/Icon */}
        <div className="text-center space-y-4">
          <div className="inline-block p-6 bg-white rounded-full shadow-xl animate-bounce-slow">
            <UtensilsCrossed className="h-16 w-16 text-green-600" strokeWidth={1.5} />
          </div>
          
          {/* Restaurant Name */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              {restaurantName}
            </h1>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Sparkles className="h-5 w-5" />
              <p className="text-lg font-medium">Welcome to Digital Dining</p>
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Table Information Card */}
        <Card className="border-2 border-green-200 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 font-medium">You're seated at</p>
              <div className="flex items-center justify-center gap-3 text-3xl font-bold text-green-700">
                <Hash className="h-8 w-8" />
                <span>Table {tableInfo?.tableNumber}</span>
              </div>
            </div>

            {/* Section Info */}
            {tableInfo?.section && tableInfo.section !== 'N/A' && (
              <div className="flex items-center justify-center gap-2 text-gray-600 bg-green-50 py-3 px-4 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
                <span className="font-medium">{tableInfo.section} Section</span>
              </div>
            )}

            {/* Welcome Message */}
            <div className="text-center space-y-2 py-4 border-t border-b border-green-100">
              <p className="text-gray-700 leading-relaxed">
                Browse our delicious menu, customize your order, and enjoy a seamless dining experience!
              </p>
              <p className="text-sm text-green-600 font-medium">
                ✨ No need to wait for a waiter ✨
              </p>
            </div>

            {/* Order Now Button */}
            <Button
              onClick={handleOrderNow}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                Order Now
                <ArrowRight className="h-5 w-5 animate-pulse" />
              </span>
            </Button>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Quick</p>
                <p className="text-sm font-semibold text-green-700">Easy Ordering</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Safe</p>
                <p className="text-sm font-semibold text-green-700">Contactless</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>🌟 Enjoy your meal! 🌟</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CustomerWelcome;
