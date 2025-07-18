import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; // Make sure you have react-hot-toast installed

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
        `${BASE_URL}/dashboard/staff/login`, // Replace with actual backend route
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
        // Save createdBy (admin who created the staff)
        if (response.data.staff?.createdBy) {
          localStorage.setItem("createdBy", response.data.staff.createdBy._id);
        }
        navigate("/dashboard");
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
    <div className="flex items-center justify-center min-h-screen bg-muted px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Staff Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginStaff;
