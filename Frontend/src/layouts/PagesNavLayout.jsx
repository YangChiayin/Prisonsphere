/**
 * @file PagesNavLayout.js
 * @description Layout wrapper that includes Sidebar and TopNavbar for all pages.
 * @module layouts/PagesNavLayout
 *
 * This component:
 * - Provides a consistent layout with a sidebar and top navigation.
 * - Dynamically sets page titles and descriptions based on route.
 * - Handles user role retrieval for personalized page greetings.
 *
 * Features:
 * - Uses `useLocation` to track route changes dynamically.
 * - Retrieves user role from local storage for role-based access.
 * - Supports nested routes for detailed pages (e.g., viewing inmate/visitor details).
 *
 * @requires react - React library for UI rendering.
 * @requires react-router-dom - Library for tracking navigation routes.
 * @requires Sidebar - Sidebar navigation menu component.
 * @requires TopNavbar - Top navigation bar with page titles and notifications.
 */
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

/**
 * PagesNavLayout Component
 * ------------------------
 * - Wraps all pages with a sidebar and top navigation bar.
 * - Dynamically sets page titles and descriptions based on the current route.
 *
 * @component
 * @param {ReactNode} children - The content of the page being displayed.
 * @returns {JSX.Element} - The layout wrapper for all pages.
 */
const PagesNavLayout = ({ children }) => {
  const [userRole, setUserRole] = useState(""); // Stores the current user role
  const location = useLocation(); // Tracks the current route

  /**
   * Retrieves the stored user role from local storage.
   * - Defaults to "Admin" if no role is found.
   * - Updates the role when the route changes.
   */
  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "Admin"; // Default to "Admin"
    setUserRole(storedRole);
  }, [location.pathname]);

  /**
   * Page Titles & Descriptions
   * --------------------------
   * - Maps known routes to appropriate page titles and descriptions.
   * - Provides a default fallback for unknown routes.
   */
  const pageData = {
    "/dashboard": {
      title: "Dashboard Overview",
      description: `Welcome back, ${userRole}`,
    },
    "/inmates": {
      title: "Inmate Management",
      description: `Manage inmate records and profiles`,
    },
    "/visitors": {
      title: "Visitor Management",
      description: `Track visitor logs and history`,
    },
    "/paroles": {
      title: "Parole Management",
      description: "Manage parole hearings and applications",
    },
    "/rehabilitation": {
      title: "Rehabilitation   & Work",
      description: `Welcome back, ${userRole}`,
    },
    "/reports": { title: "Reports", description: `Welcome back, ${userRole}` },
  };

  /**
   * Dynamically Detects Nested Routes
   * ---------------------------------
   * - Handles detailed views for specific inmates, visitors, and paroles.
   * - Ensures correct page titles for viewing/editing individual records.
   *
   * @param {string} pathname - The current route path.
   * @returns {Object} - The title and description of the current page.
   */
  const getPageData = (pathname) => {
    if (pathname.startsWith("/inmates/view/")) {
      return { title: "Inmate Details", description: "Viewing inmate profile" };
    }
    if (pathname.startsWith("/visitors/history/")) {
      return {
        title: "Visitor History",
        description: "View all visits for an inmate",
      };
    }
    if (pathname.startsWith("/visitors/details/")) {
      return {
        title: "Visitor Details",
        description: "Viewing visitor's record",
      };
    }
    if (pathname.startsWith("/work-programs/enrollments")) {
      return {
        title: "Work Program Enrollments",
        description: "Viewing all Program enrollment in the Facility",
      };
    }
    if (pathname.startsWith("/paroles/")) {
      if (pathname.match(/^\/paroles\/[a-zA-Z0-9]+$/)) {
        return {
          title: "Parole Review",
          description: "Review parole applications and decisions",
        };
      }
    }
    return pageData[pathname] || { title: "Dashboard", description: "" };
  };

  const { title, description } = getPageData(location.pathname);
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-64">
        {/* Top Navbar (Now globally used in all modules) */}
        <TopNavbar role={userRole} title={title} description={description} />

        {/* Dynamic Content Section */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default PagesNavLayout;
