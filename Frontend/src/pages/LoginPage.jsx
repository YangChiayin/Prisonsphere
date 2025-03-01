import React, { useState } from "react";
import { motion } from "framer-motion";
import logo from "../assets/images/logoBlue.png";
import Navbar from "../components/Navbar";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  //declartion of form data variables
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [showPassword, setShowPassword] = useState(false); // State for visibility
  const [error, setError] = useState(""); // State for error rendering
  const navigate = useNavigate(); //redirect after login

  //function to handle form submission character
  const handleSubmit = async (e) => {
    e.preventDefault(); //prevent default form submission
    setError(""); //reset error on every submission

    try {
      const data = await loginUser(username, password);
      localStorage.setItem("token", data.token); // Store JWT
      localStorage.setItem("role", data.role); // Store role
      navigate("/dashboard"); // Redirect after login
    } catch (errMsg) {
      setError(errMsg);
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 to-blue-500 ">
        {/* simple nav */}
        <Navbar showBackLink={true} showLoginLink={false} />

        {/* Login Form Container */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="flex-grow flex items-center justify-center"
        >
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
            {/* Smaller Branding Inside Form */}
            <div className="flex flex-col items-center">
              <img src={logo} alt="Prisonsphere Logo" className="w-10 h-10" />
              <h2 className="text-xl font-semibold text-gray-800">
                Warden/Admin
              </h2>
            </div>

            {/* Display Error Message */}
            {error && <p className="text-red-600 text-center mt-2">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6">
              {/* username input field */}
              <div>
                <label htmlFor="username" className="block text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* password input field with Visibility */}
              <div className="mt-4 relative">
                <label className="block text-gray-700">Password</label>
                <input
                  type={showPassword ? "text" : "password"} //  Toggle input type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
