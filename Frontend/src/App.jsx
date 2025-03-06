/**
 * @file App.js
 * @description Defines the main application component and routing system.
 * @module App
 *
 * This component:
 * - Sets up client-side routing using React Router.
 * - Maps different paths to corresponding pages.
 * - Provides structured navigation for the application.
 *
 * Features:
 * - Uses `BrowserRouter` for client-side navigation.
 * - Implements `Routes` to define available routes.
 * - Dynamically routes to inmate, visitor, parole, and report pages.
 *
 * @requires react - React library for UI rendering.
 * @requires react-router-dom - Library for managing application routing.
 */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import InmateManagement from "./pages/InmateManagement";
import ViewInmate from "./pages/ViewInmate";
import VisitorManagement from "./pages/VisitorManagement";
import VisitorHistory from "./pages/VisitorHistory";
import VisitorDetails from "./pages/VisitorDetails";
import ParoleManagement from "./pages/ParoleManagement";
import ParoleDetails from "./pages/ParoleDetails";
import RehabilitaionAndWork from "./pages/RehabilitaionAndWork";
import Report from "./pages/Report";

/**
 * Main Application Component
 * --------------------------
 * - Defines the primary routing structure using `React Router`.
 * - Manages navigation across different pages.
 *
 * @component
 * @returns {JSX.Element} - The main application UI component with routing.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inmates" element={<InmateManagement />} />
        <Route path="/inmates/view/:id" element={<ViewInmate />} />
        <Route path="/visitors" element={<VisitorManagement />} />
        <Route
          path="/visitors/history/:inmateId"
          element={<VisitorHistory />}
        />{" "}
        <Route
          path="/visitors/details/:visitorId"
          element={<VisitorDetails />}
        />
        <Route path="/paroles" element={<ParoleManagement />} />
        <Route path="/paroles/:paroleId" element={<ParoleDetails />} />
        <Route path="/rehabilitation" element={<RehabilitaionAndWork />} />
        <Route path="/reports" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;
