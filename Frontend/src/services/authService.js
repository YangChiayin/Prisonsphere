import axios from "axios";

// Base API URL
const API_URL = "http://localhost:5000/prisonsphere/auth";

// Function to log in a user
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      { username, password },
      { withCredentials: true } // Ensures cookies/sessions are included
    );
    return response.data; // Returns token and user role
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

// Function to Logout User
export const logoutUser = async () => {
  try {
    await axios.get(`${API_URL}/logout`, { withCredentials: true });
    localStorage.removeItem("role"); // Clear role from storage
    localStorage.removeItem("token"); // Clear token from storage
    return true;
  } catch (error) {
    console.error("Logout Error:", error);
    return false;
  }
};
