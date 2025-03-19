/**
 * @file Report.js
 * @description Provides the UI and logic for generating inmate-related reports in the PrisonSphere system.
 * @module pages/Report
 *
 * Features:
 * - Allows users to select an inmate and generate reports.
 * - Supports downloading reports in PDF format.
 * - Uses `axios` to fetch reports from the backend.
 * - Implements animations using `Framer Motion`.
 *
 * @requires react - React for component rendering and state management.
 * @requires framer-motion - Used for UI animations and transitions.
 * @requires axios - Used for making API requests to generate reports.
 * @requires PagesNavLayout - Layout component for consistent UI structure.
 * @requires InmateSearch - Component to search and select an inmate.
 * @requires react-icons - Provides icons for the UI.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import PagesNavLayout from "../layouts/PagesNavLayout";
import InmateSearch from "../components/InmateSearch";
import {
  FaFilePdf,
  FaUser,
  FaBriefcase,
  FaExclamationTriangle,
  FaGavel,
  FaChartLine,
  FaClipboardList,
  FaFileAlt,
} from "react-icons/fa";
import axios from "axios";

/**
 * @component Report
 * @description Provides an interface for generating and downloading inmate-related reports.
 */
const Report = () => {
  const [selectedInmate, setSelectedInmate] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [reportType, setReportType] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);

  /**
   * @function handleGenerateReport
   * @description Triggers the report generation process for a selected inmate.
   * @param {string} type - Type of report to generate (e.g., "information", "rehabilitation").
   */
  const handleGenerateReport = async (type) => {
    if (!selectedInmate) return;

    setReportType(type);
    setLoadingReport(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/prisonsphere/inmates/report/${selectedInmate._id}/pdf/${type}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: "blob", // Ensures response is treated as a file
        }
      );

      // Create a downloadable PDF URL
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoadingReport(false); // Hide loader after fetching
    }
  };

  return (
    <PagesNavLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6"
      >
        {/* Page Header */}
        <h2 className="text-2xl font-bold">Report Generation</h2>
        <p className="text-gray-500 pb-5">
          Select an inmate and generate a report
        </p>

        {/* Inmate Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <InmateSearch onSelectInmate={setSelectedInmate} />
        </motion.div>

        {/* Report Cards Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Inmate Information Report */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Inmate Information Report
              </h3>
              {loadingReport && reportType === "information" ? (
                <motion.button
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2 cursor-not-allowed"
                  disabled
                >
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0L4 4l4 4V4a8 8 0 00-4 8z"
                    ></path>
                  </svg>
                  Generating...
                </motion.button>
              ) : !pdfUrl || reportType !== "information" ? (
                <motion.button
                  onClick={() => handleGenerateReport("information")}
                  className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                    selectedInmate
                      ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!selectedInmate}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFilePdf /> Generate Report
                </motion.button>
              ) : (
                <motion.a
                  href={pdfUrl}
                  download="inmate_information_report.pdf"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFilePdf /> Download PDF
                </motion.a>
              )}
            </div>

            {/* Content */}
            {pdfUrl && reportType === "information" ? (
              <iframe
                src={pdfUrl}
                className="w-full h-[250px] border rounded-md mt-4"
              ></iframe>
            ) : (
              <div className="mt-4 space-y-2">
                {[
                  { icon: <FaUser />, text: "Basic Bio-data" },
                  { icon: <FaGavel />, text: "Case Details" },
                  {
                    icon: <FaFileAlt />,
                    text: "Current Work and Parole Detail",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    className={`flex bg-gray-100 p-3 rounded-lg items-center gap-2 ${
                      selectedInmate ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {React.cloneElement(item.icon, { className: "text-lg" })}{" "}
                    {item.text}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Rehabilitation Status Report */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Rehabilitation Status Report
              </h3>
              {loadingReport && reportType === "rehabilitation" ? (
                <motion.button
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2 cursor-not-allowed"
                  disabled
                >
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0L4 4l4 4V4a8 8 0 00-4 8z"
                    ></path>
                  </svg>
                  Generating...
                </motion.button>
              ) : !pdfUrl || reportType !== "rehabilitation" ? (
                <motion.button
                  onClick={() => handleGenerateReport("rehabilitation")}
                  className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                    selectedInmate
                      ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!selectedInmate}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFilePdf /> Generate Report
                </motion.button>
              ) : (
                <motion.a
                  href={pdfUrl}
                  download="inmate_rehabilitation_report.pdf"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFilePdf /> Download PDF
                </motion.a>
              )}
            </div>

            {/* Content */}
            {pdfUrl && reportType === "rehabilitation" ? (
              <iframe
                src={pdfUrl}
                className="w-full h-[250px] border rounded-md mt-4"
              ></iframe>
            ) : (
              <div className="mt-4 space-y-2">
                {[
                  {
                    icon: <FaBriefcase />,
                    text: "Work Performance & Participation",
                  },
                  { icon: <FaClipboardList />, text: "Behavior Logs" },
                  { icon: <FaExclamationTriangle />, text: "Incident Reports" },
                  { icon: <FaChartLine />, text: "Rehabilitation Progress" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    className={`flex bg-gray-100 p-3 rounded-lg items-center gap-2 ${
                      selectedInmate ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {React.cloneElement(item.icon, { className: "text-lg" })}{" "}
                    {item.text}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </PagesNavLayout>
  );
};

export default Report;
