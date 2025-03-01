import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

/**
 * DashboardAnalytics Component
 * ----------------------------
 * Fetches and displays analytics charts:
 * - Line chart (Inmate count over the last 6 months).
 * - Pie chart (Inmate distribution).
 */
const DashboardAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token"); //  Get authentication token
        if (!token) {
          console.error(" No authentication token found.");
          return;
        }

        const { data } = await axios.get(
          "http://localhost:5000/prisonsphere/dashboard/analytics",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, []);

  if (!analytics) {
    return <p className="text-gray-500 mt-4">Loading analytics...</p>;
  }

  // Line Chart Data (Inmate Count Over Time)
  const lineChartData = {
    labels: analytics.monthlyInmateStats.map((stat) => `Month ${stat._id}`),
    datasets: [
      {
        label: "Inmates Admitted",
        data: analytics.monthlyInmateStats.map((stat) => stat.count),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
      },
    ],
  };

  // Pie Chart Data (Inmate Distribution)
  const pieChartData = {
    labels: ["Incarcerated", "Released", "In Parole"],
    datasets: [
      {
        data: [
          analytics.inmateDistribution.incarceratedCount,
          analytics.inmateDistribution.releasedCount,
          analytics.inmateDistribution.paroleCount,
        ],
        backgroundColor: ["blue", "green", "orange"],
      },
    ],
  };

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg p-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Analytics Overview
      </h2>
      <p className="text-gray-600 text-sm">Prison data visualization.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Line Chart */}
        <div className="bg-gray-50 p-4 rounded-md shadow flex flex-col items-center">
          <h3 className="text-gray-800 font-medium mb-2">
            Inmate Admissions (Last 6 Months)
          </h3>
          <div className="w-full h-64">
            <Line data={lineChartData} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-50 p-4 rounded-md shadow flex flex-col items-center">
          <h3 className="text-gray-800 font-medium mb-2">
            Inmate Distribution
          </h3>
          <div className="w-[300px] h-[300px] flex justify-center items-center">
            <Pie data={pieChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
