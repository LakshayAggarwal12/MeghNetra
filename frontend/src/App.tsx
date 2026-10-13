import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AuthGuard from "./components/shared/AuthGuard";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// App pages (protected)
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/EventDetail";
import AdminPanel from "./pages/AdminPanel";
import CitizenReport from "./pages/CitizenReport";
import MapFullView from "./pages/MapFullView";
import Alerts from "./pages/Alerts";
import CityLookup from "./pages/CityLookup";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      {/* ── Public landing page ──────────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />

      {/* ── Auth pages (standalone, no AppLayout) ───────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Application (AppLayout, any authenticated user required) ─────── */}
      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/map" element={<MapFullView />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/city-lookup" element={<CityLookup />} />
          <Route path="/report" element={<CitizenReport />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin-only route */}
          <Route element={<AuthGuard adminOnly />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Route>

      {/* ── Catch-all ───────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
