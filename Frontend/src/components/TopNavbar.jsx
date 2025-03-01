import React, { useState } from "react";
import { FaBell, FaUserShield, FaUserCog } from "react-icons/fa"; // Icons for Notifications & Roles

const TopNavbar = ({ role, title, description }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New inmate admitted", time: "2 hours ago" },
    { id: 2, message: "Rehabilitation program scheduled", time: "4 hours ago" },
    { id: 3, message: "Parole hearing completed", time: "8 hours ago" },
    { id: 4, message: "Monthly report generated", time: "8 hours ago" },
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Select appropriate icon based on user role
  const RoleIcon = role === "warden" ? FaUserShield : FaUserCog;

  return (
    <div className="flex items-center justify-between bg-white shadow-md px-6 py-4 sticky w-full top-0 z-50">
      {/* Page Title & Description */}
      <div className="PageTitle">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="flex justify-center items-center space-x-5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative text-gray-700 hover:text-blue-600"
          >
            <FaBell className="text-2xl" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 bg-white shadow-lg rounded-lg w-64 p-4 z-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Notifications
              </h3>
              {notifications.length > 0 ? (
                <ul>
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className="text-gray-600 text-sm border-b last:border-none py-2"
                    >
                      {notif.message}{" "}
                      <span className="text-xs text-gray-400">
                        ({notif.time})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No new notifications</p>
              )}
            </div>
          )}
        </div>

        {/* User Role Icon */}
        <div className="relative flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <RoleIcon className="text-blue-600 text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
