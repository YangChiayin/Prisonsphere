import React from "react";
import PagesNavLayout from "../layouts/PagesNavLayout";
import DashboardStats from "../components/DashboardStats";
import DashboardActivities from "../components/DashboardActivities";
import DashboardAnalytics from "../components/DashboardAnalytics";

/**
 * Dashboard Page
 * --------------
 * The main dashboard interface, displaying key statistics and recent reports.
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
