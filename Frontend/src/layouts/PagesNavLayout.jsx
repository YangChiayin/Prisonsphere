import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const PagesNavLayout = ({ children }) => {
  const [userRole, setUserRole] = useState("");
  const location = useLocation(); // Get current route

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "Admin"; // Default to "Admin"
    setUserRole(storedRole);
  }, []);

  // Define dynamic page titles & descriptions for all modules
  const pageData = {
    "/dashboard": {
      title: "Dashboard Overview",
      description: `Welcome back, ${userRole}`,
    },
    "/inmates": {
      title: "Inmate Management",
      description: `Welcome back ${userRole}`,
    },
    "/inmates/view/:id": {
      title: "Inmate Details",
      description: "Viewing inmate profile",
    },
    "/visitors": {
      title: "Visitor Management",
      description: `Welcome back, ${userRole}`,
    },
    "/parole": {
      title: "Parole Management",
      description: `Welcome back, ${userRole}`,
    },
    "/rehabilitation": {
      title: "Rehabilitation & Work",
      description: `Welcome back, ${userRole}`,
    },
    "/reports": { title: "Reports", description: `Welcome back, ${userRole}` },
  };

  const { title, description } = pageData[location.pathname] || {
    title: "Dashboard",
    description: "",
  };

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
