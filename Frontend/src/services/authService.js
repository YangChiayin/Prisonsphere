/**
 * @file authService.js
 * @description Provides authentication services including login and logout functionality.
 * @module services/authService
 *
 * This module:
 * - Handles API requests for user authentication.
 * - Stores and clears authentication tokens in local storage.
 * - Uses cookie-based authentication for session management.
 *
 * Features:
 * - Uses `axios` for HTTP requests.
 * - Implements error handling for authentication failures.
 * - Ensures credentials are included in API requests for security.
 *
 * @requires axios - HTTP client for making API requests.
 */

import axios from "axios";

// **Base API URL for authentication endpoints**
const API_URL = "http://localhost:5000/prisonsphere/auth";

/**
 * Logs in a user by sending credentials to the authentication API.
 * - Sends a `POST` request with `username` and `password`.
 * - Stores the returned authentication token and user role in local storage.
 *
 * @async
 * @function loginUser
 * @param {string} username - The username of the user attempting to log in.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - Returns an object containing authentication token and user role.
 * @throws {string} - Throws an error message if login fails.
 */
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

/**
 * Logs out the current user by calling the API logout endpoint.
 * - Sends a `GET` request to invalidate the session.
 * - Removes authentication data from local storage.
 *
 * @async
 * @function logoutUser
 * @returns {Promise<boolean>} - Returns `true` if logout is successful, otherwise `false`.
 */
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
