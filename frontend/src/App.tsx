import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
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
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/map" element={<MapFullView />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/city-lookup" element={<CityLookup />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/report" element={<CitizenReport />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
