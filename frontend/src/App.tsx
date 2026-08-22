import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/EventDetail";
import AdminPanel from "./pages/AdminPanel";
import CitizenReport from "./pages/CitizenReport";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/report" element={<CitizenReport />} />
    </Routes>
  );
}
