/**
 * @file Sidebar.js
 * @description Sidebar navigation menu for the PrisonSphere system.
 * @module components/Sidebar
 *
 * This component:
 * - Provides a fixed navigation menu for managing different system modules.
 * - Includes links to Dashboard, Inmate Management, Visitors, Parole, Reports, etc.
 * - Features a logout button that securely logs the user out.
 *
 * Features:
 * - Uses `react-router-dom` for navigation with active link highlighting.
 * - Implements a reusable `SidebarItem` component for better scalability.
 * - Uses authentication service for secure logout handling.
 *
 * @requires react - React library for UI rendering.
 * @requires react-router-dom - Library for managing navigation.
 * @requires react-icons - Provides icons for better UX.
 * @requires authService - Handles logout functionality.
 */
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaChartLine, FaGavel, FaRegHandshake } from "react-icons/fa";
import { MdOutlineAccountBalance } from "react-icons/md";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FiFileText, FiLogOut } from "react-icons/fi";
import { logoutUser } from "../services/authService";
import logo from "../assets/images/logoBlue.png";

/**
 * Sidebar Component
 * -----------------
 * - Provides a navigation menu for accessing system modules.
 * - Includes an interactive logout button.
 *
 * @component
 * @returns {JSX.Element} - The sidebar navigation UI component.
 */
const Sidebar = () => {
  const navigate = useNavigate(); // Navigation hook for redirecting users

  /**
   * Handles user logout.
   * - Calls the authentication service to log the user out.
   * - Redirects the user to the login page upon success.
   */
  const handleLogout = async () => {
    try {
      const success = await logoutUser();
      if (success) {
        navigate("/login");
      } else {
        alert("Logout failed! Please try again.");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="h-screen w-64 bg-white shadow-md fixed flex flex-col">
      {/* Updated Logo Section */}
      <div className="p-4 flex items-center justify-start">
        <NavLink to="/dashboard" className="flex items-center space-x-2">
          <img src={logo} alt="PrisonSphere Logo" className="h-8" />
          <span className="text-gray-800 font-semibold text-lg">
            Prisonsphere
          </span>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow mt-4">
        <ul className="space-y-2 px-4">
          <SidebarItem
            to="/dashboard"
            icon={<FaChartLine />}
            text="Dashboard"
          />
          <SidebarItem
            to="/inmates"
            icon={<MdOutlineAccountBalance />}
            text="Inmate Management"
          />
          <SidebarItem
            to="/visitors"
            icon={<AiOutlineUsergroupAdd />}
            text="Visitor Management"
          />
          <SidebarItem
            to="/paroles"
            icon={<FaGavel />}
            text="Parole Management"
          />
          <SidebarItem
            to="/rehabilitation"
            icon={<FaRegHandshake />}
            text="Rehabilitation & Work"
          />
          <SidebarItem to="/reports" icon={<FiFileText />} text="Reports" />
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 text-red-600 hover:bg-red-100 rounded-lg"
        >
          <FiLogOut className="text-xl mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Reusable SidebarItem Component
 * ------------------------------
 * - Creates a navigational link with an icon and text.
 * - Highlights active links using `react-router-dom`'s `isActive` property.
 *
 * @component
 * @param {String} to - The path of the navigation link.
 * @param {JSX.Element} icon - The icon representing the link.
 * @param {String} text - The label text for the link.
 * @returns {JSX.Element} - The sidebar link component.
 */
const SidebarItem = ({ to, icon, text }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center p-3 rounded-lg ${
            isActive
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-blue-100"
          }`
        }
      >
        <span className="text-xl mr-3">{icon}</span>
        <span>{text}</span>
      </NavLink>
    </li>
  );
};

export default Sidebar;
