import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function LoginStaff() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BASE_URL}/dashboard/staff/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Welcome!");
        console.log(response.data);

        localStorage.setItem("token", response.data.token);
        try {
          const staff = response.data.staff || {};
          const parseJwt = (tkn) => {
            try {
              const base64Url = tkn.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              return JSON.parse(jsonPayload);
            } catch {
              return {};
            }
          };
          const decoded = parseJwt(response.data.token);
          const name = staff.name || staff.fullName || staff.username || decoded?.name || decoded?.username || (staff.email ? staff.email.split('@')[0] : "");
          const nextUser = { _id: staff._id || decoded?.id || decoded?._id, name, email: staff.email || decoded?.email };
          localStorage.setItem("user", JSON.stringify(nextUser));
        } catch {}

        // Save createdBy (admin who created the staff)
        if (response.data.staff?.createdBy) {
          localStorage.setItem("createdBy", response.data.staff.createdBy._id);
        }

        // Save staff role for later use
        if (response.data.staff?.role) {
          localStorage.setItem("role", response.data.staff.role);

          // Redirect based on role
          if (response.data.staff.role === "chef") {
            navigate("/dashboard/staff/kot"); // Kitchen Order Tickets page
          } else if (response.data.staff.role === "waiter") {
            navigate("/staff/table"); // Main home page for waiters
          } else {
            navigate("/dashboard"); // fallback
          }
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message ||
          "Something went wrong, please try again."
        );
      } else if (error.request) {
        toast.error("No response from the server.");
      } else {
        toast.error("An error occurred while logging in.");
      }
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-none border-border">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-[#4caf50] mb-2">Staff Login</CardTitle>
          <p className="text-muted-foreground">Enter your credentials to access the staff portal</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="border-border focus:border-[#4caf50] focus:ring-[#4caf50]"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#4caf50] hover:bg-[#419844] text-white font-semibold py-2 transition-colors duration-200"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginStaff;