/**
 * @file Dashboard.js
 * @description Main dashboard page displaying key statistics, recent activities, and analytics.
 * @module pages/Dashboard
 *
 * This component:
 * - Provides an overview of system metrics and activities.
 * - Displays real-time inmate statistics.
 * - Shows recent system actions and analytics.
 *
 * Features:
 * - Uses `PagesNavLayout` to maintain a consistent sidebar and navbar layout.
 * - Fetches and renders system statistics via `DashboardStats`.
 * - Displays recent user activities using `DashboardActivities`.
 * - Presents analytical data visualizations with `DashboardAnalytics`.
 *
 * @requires react - React library for UI rendering.
 * @requires PagesNavLayout - Layout component for consistent page structure.
 * @requires DashboardStats - Component displaying key prison statistics.
 * @requires DashboardActivities - Component listing recent activities.
 * @requires DashboardAnalytics - Component displaying analytical charts.
 */
import React from "react";
import PagesNavLayout from "../layouts/PagesNavLayout";
import DashboardStats from "../components/DashboardStats";
import DashboardActivities from "../components/DashboardActivities";
import DashboardAnalytics from "../components/DashboardAnalytics";

/**
 * Dashboard Page Component
 * ------------------------
 * - The main dashboard interface displaying key statistics and recent reports.
 * - Uses a structured layout with sections for stats, activities, and analytics.
 *
 * @component
 * @returns {JSX.Element} - The Dashboard UI component.
 */
const Dashboard = () => {
  return (
    <PagesNavLayout>
      {/* Key Statistics Section */}
      <DashboardStats />
      {/* Recent Activities Section */}
      <DashboardActivities />
      {/* Analytics */}
      <DashboardAnalytics />
    </PagesNavLayout>
  );
};

export default Dashboard;
