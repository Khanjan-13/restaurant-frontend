import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faSignInAlt,
  faUtensils,
  faEye,
  faEyeSlash,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/signup/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("Login successful:", response.data);
        toast.success("Welcome back! 🎉");

        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message ||
            "Invalid credentials. Please try again."
        );
      } else if (error.request) {
        toast.error("Unable to connect to server. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/5 to-pink-400/10"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
      }}></div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Logo/Brand */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faUtensils} className="text-white text-2xl" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Table No. 21
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Welcome back! Sign in to your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSignInAlt} />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to Table No. 21?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Create your account
              <span className="text-lg">→</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-sm text-gray-500">
        <p>© 2024 Table No. 21. Premium Dining Management System</p>
      </div>
    </div>
  );
}

export default Login;
