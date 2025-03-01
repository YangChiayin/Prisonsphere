import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/images/logoBlue.png";

const Navbar = ({ showBackLink, showLoginLink }) => {
  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 w-full flex justify-center py-4 shadow-sm rounded-md backdrop-blur-sm"
    >
      <div className="w-[90%] md:w-[80%] flex items-center justify-between">
        {/* Logo & Name */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Prisonsphere Logo" className="w-10 h-10" />
          <span className="text-lg font-bold text-gray-800 tracking-wide">
            Prisonsphere
          </span>
        </div>
        {/* Conditonal rendering of Links */}
        <div className="flex items-center space-x-6">
          {showLoginLink && (
            <Link
              to="/login"
              className="text-blue-700 font-semibold hover:underline"
            >
              Login
            </Link>
          )}

          {showBackLink && (
            <Link
              to="/"
              className="text-blue-700 font-semibold hover:underline"
            >
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
