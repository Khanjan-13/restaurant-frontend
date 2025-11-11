import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Lock, User, ShoppingBag, ArrowLeft, Sparkles } from "lucide-react";
import { 
  sendOtp, 
  verifyOtp, 
  placeOrder as placeCustomerOrder,
  prepareOrderItems,
  calculateCartTotal 
} from "@/services/customer/customerOrderService";
import {
  getActiveCart,
  addOrderToHistory,
  clearCart,
  getSession,
  isCustomerVerified,
  getVerifiedCustomer,
  saveCustomerVerification,
} from "@/services/customer/customerSessionService";
import CustomerBottomNav from "@/components/webComponent/Customer/CustomerBottomNav";

const CustomerCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableIdFromQuery = searchParams.get('tableId');
  
  const [step, setStep] = useState("phone"); // phone, otp, confirm
  const [formData, setFormData] = useState({
    phoneNumber: "",
    customerName: "",
    otp: "123456", // Default OTP for easy testing
  });
  const [cart, setCart] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get tableId from query params
    const storedTableInfo = localStorage.getItem("customerTableInfo");
    
    if (!storedTableInfo) {
      toast.error("No table information found. Please scan QR code again.");
      navigate("/");
      return;
    }

    const parsedTableInfo = JSON.parse(storedTableInfo);
    const tableId = tableIdFromQuery || parsedTableInfo.tableId;
    
    // Load cart from table-specific localStorage or session storage
    let cartData = [];
    
    // Try table-specific localStorage first
    const tableSpecificCart = localStorage.getItem(`customerCart_${tableId}`);
    if (tableSpecificCart) {
      try {
        cartData = JSON.parse(tableSpecificCart);
      } catch (error) {
        console.error("Error parsing table-specific cart:", error);
      }
    }
    
    // Fallback to general localStorage
    if (cartData.length === 0) {
      const generalCart = localStorage.getItem("customerCart");
      if (generalCart) {
        try {
          cartData = JSON.parse(generalCart);
        } catch (error) {
          console.error("Error parsing general cart:", error);
        }
      }
    }
    
    // Fallback to session storage
    if (cartData.length === 0) {
      const sessionCart = getActiveCart(tableId);
      if (sessionCart && sessionCart.length > 0) {
        cartData = sessionCart;
      }
    }
    
    // Check if cart is empty
    if (cartData.length === 0) {
      toast.error("Your cart is empty. Please add items first.");
      navigate(`/customer-menu?tableId=${tableId}`);
      return;
    }
    
    setCart(cartData);
    setTableInfo(parsedTableInfo);
    
    // Check if customer already verified
    const verified = isCustomerVerified(tableId);
    if (verified) {
      const customerData = getVerifiedCustomer(tableId);
      setFormData({
        phoneNumber: customerData.phoneNumber,
        customerName: customerData.name || "",
        otp: "",
      });
      setCustomer(customerData);
      setStep("confirm"); // Skip directly to confirm
      toast.success("Welcome back! You can place order directly.", {
        icon: "👋",
        duration: 3000,
      });
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOTP = async () => {
    if (formData.phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await sendOtp(formData.phoneNumber, tableInfo.tableId);

      toast.success("OTP sent successfully!");
      
      // In development, show OTP in console
      if (response.otp) {
        console.log("Development OTP:", response.otp);
        toast.success(`Dev OTP: ${response.otp}`, { duration: 5000 });
      }
      
      setStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(
        formData.phoneNumber,
        formData.otp,
        tableInfo.tableId
      );

      if (response.verified) {
        toast.success("Phone verified successfully!");
        setCustomer(response.customer);
        
        // Save customer verification in session
        const tableId = tableIdFromQuery || tableInfo.tableId;
        saveCustomerVerification(tableId, {
          phoneNumber: formData.phoneNumber,
          name: response.customer?.name || formData.customerName,
          _id: response.customer?._id,
        });
        
        setStep("confirm");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const orderItems = prepareOrderItems(cart);

      const response = await placeCustomerOrder({
        tableId: tableInfo.tableId,
        phoneNumber: formData.phoneNumber,
        items: orderItems,
      });

      // Add order to session history
      const tableId = tableIdFromQuery || tableInfo.tableId;
      addOrderToHistory(tableId, {
        ...response.order,
        totalAmount: getDiscountedAmount(),
      });
      
      // Clear active cart from session
      clearCart(tableId);
      
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span>Order placed successfully!</span>
        </div>,
        {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        }
      );
      
      // Store order ID for tracking
      localStorage.setItem("customerOrderId", response.order.orderId);
      localStorage.setItem("customerPhone", formData.phoneNumber);
      
      // Clear localStorage cart (table-specific and general)
      localStorage.removeItem("customerCart");
      localStorage.removeItem(`customerCart_${tableId}`);
      
      // Navigate to order history instead of status page
      navigate(`/customer/order-history?tableId=${tableId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.response?.data?.error || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    return calculateCartTotal(cart);
  };

  const getDiscountedAmount = () => {
    const total = getTotalAmount();
    const discount = customer?.discount || 0;
    return total - (total * discount) / 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-xl border-2 border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6" />
              <div>
                <CardTitle className="text-2xl">Checkout</CardTitle>
                <p className="text-sm text-orange-100">Table {tableInfo?.tableNumber} • {tableInfo?.section}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Step 1: Phone Number */}
            {step === "phone" && (
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-800 mb-1">Enter Your Details</h3>
                  <p className="text-sm text-orange-600">We'll send an OTP to verify your number</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      name="customerName"
                      placeholder="Your name"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      maxLength="10"
                      className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <Button
                  onClick={sendOTP}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-6 text-lg shadow-lg"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-1">Verify OTP</h3>
                  <p className="text-sm text-blue-600">
                    Enter the 6-digit OTP sent to {formData.phoneNumber}
                  </p>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleInputChange}
                    maxLength="6"
                    className="pl-10 text-center text-2xl tracking-widest border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep("phone")}
                    variant="outline"
                    className="flex-1 border-gray-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={verifyOTP}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
                <Button
                  onClick={sendOTP}
                  variant="link"
                  className="w-full text-sm text-blue-600 hover:text-blue-700"
                >
                  Resend OTP
                </Button>
              </div>
            )}

            {/* Step 3: Confirm Order */}
            {step === "confirm" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-green-800 font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    Phone Verified Successfully!
                  </p>
                  <p className="text-sm text-green-700 mt-1">Welcome, {customer?.name || "Valued Customer"}!</p>
                  {customer?.totalVisits > 0 && (
                    <p className="text-sm text-green-700">
                      🎉 You've visited us {customer.totalVisits} times!
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm bg-white p-3 rounded shadow-sm">
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">{item.itemName}</span>
                          <span className="text-gray-500 ml-2">x {item.quantity}</span>
                        </div>
                        <span className="font-semibold text-gray-800">₹{item.itemPrice * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{getTotalAmount()}</span>
                  </div>
                  {customer?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({customer.discount}%):</span>
                      <span className="font-semibold">- ₹{(getTotalAmount() * customer.discount) / 100}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold text-orange-600 bg-orange-50 p-4 rounded-lg">
                    <span>Total:</span>
                    <span>₹{getDiscountedAmount()}</span>
                  </div>
                </div>

                <Button
                  onClick={placeOrder}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-semibold shadow-lg"
                >
                  {loading ? "Placing Order..." : "Confirm & Place Order 🎉"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Navigation */}
      {tableIdFromQuery && <CustomerBottomNav tableId={tableIdFromQuery} />}
    </div>
  );
};

export default CustomerCheckout;
