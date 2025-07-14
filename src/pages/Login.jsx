import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // for navigation after successful login
import axios from "axios";
import toast from "react-hot-toast";
function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate(); // for redirecting to another page after successful login
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BASE_URL}/signup/login`, // Ensure this matches your backend route
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if login was successful
      if (response.status === 200) {
        console.log("Login successful:", response.data);
        toast.success("Welcome!");

        // Store the token in localStorage
        localStorage.setItem("token", response.data.token);

        // Redirect to the dashboard or another page
        navigate("/dashboard"); // Replace '/dashboard' with your desired route
      }
    } catch (error) {
      // Handle errors based on the type of issue
      if (error.response) {
        // Server responded with an error status
        toast.error(
          error.response.data.message ||
            "Something went wrong, please try again."
        );
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from the server.");
      } else {
        // Any other error
        toast.error("An error occurred while logging in.");
      }
      console.error("Login error:", error);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log In
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
