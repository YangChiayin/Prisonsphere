import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import InmateManagement from "./pages/InmateManagement";
import ViewInmate from "./pages/ViewInmate";
import VisitorManagement from "./pages/VisitorManagement";
import ParoleManagement from "./pages/ParoleManagement";
import RehabilitaionAndWork from "./pages/RehabilitaionAndWork";
import Report from "./pages/Report";
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
        <Route path="/parole" element={<ParoleManagement />} />
        <Route path="/rehabilitation" element={<RehabilitaionAndWork />} />
        <Route path="/reports" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;
