import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CloudDrizzle,
  MapPin,
  Brain,
  ShieldCheck,
  Radio,
  AlertTriangle,
  BarChart3,
  Users,
  ArrowRight,
  ChevronDown,
  GitMerge,
  Zap,
  Eye,
  Database,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ─── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return value;
}

// ─── Stat card with animated counter ──────────────────────────────────────────
function StatCard({ value, suffix, label, started }: { value: number; suffix: string; label: string; started: boolean }) {
  const count = useCounter(value, 1600, started);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white tabular-nums">
        {count.toLocaleString("en-IN")}
        <span className="text-sky-400">{suffix}</span>
      </div>
      <div className="text-slate-400 text-sm font-medium mt-2">{label}</div>
    </div>
  );
}

// ─── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="group relative bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-xl mb-4 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Pipeline step ─────────────────────────────────────────────────────────────
function PipelineStep({
  step,
  title,
  description,
  icon: Icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-meghblue to-meghteal flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
          {step}
        </div>
        {step < 5 && <div className="w-px flex-1 bg-gradient-to-b from-meghteal/40 to-transparent mt-2" />}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-sky-400" />
          <h4 className="text-white font-semibold text-sm">{title}</h4>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ─── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-400 blur-md opacity-40 rounded-full" />
              <CloudDrizzle className="relative w-7 h-7 text-sky-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-sky-200">
                MEGHNETRA
              </div>
              <div className="text-[9px] font-medium text-sky-400/70 tracking-widest uppercase hidden sm:block">
                Eye of the Clouds
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-meghblue to-meghteal text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-meghblue to-meghteal text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-meghblue/25 blur-[120px] rounded-full -z-0" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-meghteal/10 blur-[80px] rounded-full -z-0" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-sky-600/10 blur-[80px] rounded-full -z-0" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-sky-300 mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            SIH 2024 · Problem Statement 26069 · Live Prototype
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-50 to-white/50">
              Every Storm.
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300">
              Verified. In Real Time.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-base md:text-lg leading-relaxed mb-10">
            MEGHNETRA is an AI-powered national weather big data analytics platform.
            It ingests reports from citizen sensors, weather APIs, and news feeds,
            automatically classifies, geolocates, deduplicates, and cross-verifies
            each event — then delivers a live, confidence-scored map of India.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-meghblue to-meghteal text-white font-bold rounded-2xl
                         hover:from-meghteal hover:to-meghsky transition-all duration-300 hover:scale-105 shadow-xl shadow-meghblue/30 text-sm"
            >
              {isAuthenticated ? "Open Dashboard" : "Get Started Free"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                         text-white font-semibold rounded-2xl transition-all duration-300 text-sm"
            >
              Sign in to Dashboard
            </Link>
          </div>

          {/* ─── Product Preview ─────────────────────────────────────────── */}
          <div className="mt-16 text-left relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Window titlebar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400">meghnetra.in/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Real-Time Stream Active
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Visualization Simulation */}
              <div className="lg:col-span-2 rounded-xl bg-slate-950/80 border border-white/5 p-4 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">India Geospatial Radar</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    PostGIS + DBSCAN
                  </span>
                </div>

                {/* Simulated Geolocation hotspots */}
                <div className="relative h-48 my-auto flex items-center justify-center">
                  {/* Mumbai */}
                  <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 items-center justify-center text-[9px] font-bold text-white">!</span>
                    </span>
                    <div className="mt-1 bg-slate-900/90 border border-rose-500/30 rounded px-2 py-0.5 text-[10px] text-white whitespace-nowrap shadow-lg">
                      Mumbai · Severe Flooding (94%)
                    </div>
                  </div>

                  {/* Chennai */}
                  <div className="absolute bottom-6 right-1/3 group cursor-pointer">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                    </span>
                    <div className="mt-1 bg-slate-900/90 border border-amber-500/30 rounded px-2 py-0.5 text-[10px] text-white whitespace-nowrap shadow-lg">
                      Chennai · Heavy Rain (88%)
                    </div>
                  </div>

                  {/* Delhi */}
                  <div className="absolute top-6 left-1/2 group cursor-pointer">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
                    </span>
                    <div className="mt-1 bg-slate-900/90 border border-sky-500/30 rounded px-2 py-0.5 text-[10px] text-white whitespace-nowrap shadow-lg">
                      NCR · Thunderstorm (81%)
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2 z-10">
                  <span>Coverage: 45+ Metro Clusters</span>
                  <span className="text-emerald-400">Zero Ingestion Latency</span>
                </div>
              </div>

              {/* Event Feed preview */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                  <span>Live Verified Queue</span>
                  <span className="text-[10px] text-sky-400 font-mono">3 New</span>
                </div>

                {/* Card 1 */}
                <div className="p-3 rounded-xl bg-white/5 border border-rose-500/30 hover:border-rose-500/60 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Flooding</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Severe</span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">Western Express Highway submerged, traffic halted</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Mumbai · 3 sources</span>
                    <span className="text-emerald-400 font-semibold font-mono">94% Confidence</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-3 rounded-xl bg-white/5 border border-amber-500/30 hover:border-amber-500/60 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Thunderstorm</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">High</span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">Squall line with heavy lightning and wind gusts</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Chennai · 2 sources</span>
                    <span className="text-emerald-400 font-semibold font-mono">88% Confidence</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-3 rounded-xl bg-white/5 border border-sky-500/30 hover:border-sky-500/60 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Dust Storm</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">Moderate</span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">Visibility dropped below 500m on NH-48</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Delhi NCR · 2 sources</span>
                    <span className="text-emerald-400 font-semibold font-mono">81% Confidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-slate-600">
            <span className="text-xs font-medium uppercase tracking-widest">Explore Capabilities</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatCard value={45} suffix="+" label="Indian Cities Monitored" started={statsVisible} />
          <StatCard value={8} suffix="" label="Weather Event Categories" started={statsVisible} />
          <StatCard value={5} suffix="" label="AI Pipeline Layers" started={statsVisible} />
          <StatCard value={100} suffix="%" label="Real-Time — No Mockups" started={statsVisible} />
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">Capabilities</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Built for National-Scale<br />Weather Intelligence
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Every feature maps directly to SIH PS 26069's requirements — multi-source ingestion,
              AI classification, duplicate detection, and confidence scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={Radio}
              title="Multi-Source Ingestion"
              description="Simultaneously ingests citizen reports, real weather API data (OpenWeatherMap), and RSS news feeds through a unified normalized pipeline."
              accent="bg-sky-500/15 text-sky-400"
            />
            <FeatureCard
              icon={Brain}
              title="AI Classification"
              description="Rule-based + TF-IDF text classification identifies event type (rainfall, flood, cyclone, heatwave…) and severity from raw report text instantly."
              accent="bg-violet-500/15 text-violet-400"
            />
            <FeatureCard
              icon={GitMerge}
              title="Duplicate Detection"
              description="Four-signal fusion: TF-IDF cosine similarity, geographic proximity, time window correlation, and category agreement to cluster related reports."
              accent="bg-emerald-500/15 text-emerald-400"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Confidence Scoring"
              description="Transparent, weighted evidence formula gives every event a confidence score with a full factor breakdown — no black-box predictions."
              accent="bg-amber-500/15 text-amber-400"
            />
            <FeatureCard
              icon={MapPin}
              title="India Geospatial Map"
              description="Live Leaflet map plots all events across India with DBSCAN clustering, hotspot detection, and convex-hull affected-area estimation via PostGIS."
              accent="bg-rose-500/15 text-rose-400"
            />
            <FeatureCard
              icon={Zap}
              title="Real-Time Streaming"
              description="Socket.IO pushes verified events, queue updates, and status changes to every connected dashboard instance within milliseconds."
              accent="bg-cyan-500/15 text-cyan-400"
            />
            <FeatureCard
              icon={Eye}
              title="Admin Verification Panel"
              description="Human-in-the-loop review queue lets administrators verify, reject, or correct AI decisions with full audit trail and evidence display."
              accent="bg-orange-500/15 text-orange-400"
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics & Trends"
              description="Time-series charts, category/severity breakdowns, and source reliability tracking give operational awareness at a glance."
              accent="bg-teal-500/15 text-teal-400"
            />
          </div>
        </div>
      </section>

      {/* ─── Pipeline ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">Pipeline</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              From Raw Report<br />to Verified Event
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Every incoming report traverses a deterministic, observable pipeline.
              Each layer adds metadata, not uncertainty — so every decision is traceable.
            </p>
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-meghblue to-meghteal text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              See it live <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div>
            <PipelineStep
              step={1}
              icon={Radio}
              title="Ingest & Normalize"
              description="Citizen app, weather API, and RSS feeds submit reports. Source labels, timestamps, and categories are normalized to a controlled vocabulary."
            />
            <PipelineStep
              step={2}
              icon={Brain}
              title="AI Classification"
              description="Python FastAPI microservice classifies event type, extracts geolocation from text, and scores severity — all via internal, secure API calls."
            />
            <PipelineStep
              step={3}
              icon={GitMerge}
              title="Duplicate Detection"
              description="BullMQ workers compare each new report against existing events using four-signal fusion. Matching reports are merged into the same event."
            />
            <PipelineStep
              step={4}
              icon={Database}
              title="Verification & Scoring"
              description="Evidence from multiple sources is fused into a confidence score. Events are assigned a verification status: verified, unverified, suspicious, or contradicted."
            />
            <PipelineStep
              step={5}
              icon={Zap}
              title="Real-Time Broadcast"
              description="Final events are stored in PostgreSQL/PostGIS and pushed via Socket.IO to all connected dashboards and the admin panel instantly."
            />
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">Technology</div>
          <h2 className="text-3xl font-black text-white mb-12">
            Production-Grade Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: "React + TypeScript", sub: "Frontend" },
              { name: "Node.js + Express", sub: "API Gateway" },
              { name: "Python + FastAPI", sub: "AI Microservice" },
              { name: "PostgreSQL + PostGIS", sub: "Database" },
              { name: "Redis + BullMQ", sub: "Queue" },
              { name: "Socket.IO", sub: "Real-Time" },
            ].map(({ name, sub }) => (
              <div
                key={name}
                className="bg-white/3 hover:bg-white/6 border border-white/8 rounded-xl p-4 transition-all hover:-translate-y-0.5 cursor-default"
              >
                <div className="text-white text-xs font-bold mb-1">{name}</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-meghblue/30 to-meghteal/20 border border-white/10 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,116,144,0.3),transparent_60%)]" />
            <div className="relative">
              <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
                <CloudDrizzle className="w-10 h-10 text-sky-300" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Ready to monitor<br />India's weather in real time?
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto text-sm">
                Submit citizen reports, explore the live event map, and see
                AI-verified weather intelligence — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/register"}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-meghblue to-meghteal text-white font-bold rounded-2xl
                             hover:from-meghteal hover:to-meghsky transition-all duration-300 hover:scale-105 shadow-lg text-sm w-full sm:w-auto justify-center"
                >
                  <Users className="w-4 h-4" />
                  {isAuthenticated ? "Open Dashboard" : "Create free account"}
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold rounded-2xl transition-all text-sm w-full sm:w-auto justify-center"
                >
                  Admin sign in
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <CloudDrizzle className="w-6 h-6 text-sky-400" />
            <div>
              <div className="font-bold text-sm text-white">MEGHNETRA</div>
              <div className="text-xs text-slate-500">Eye of the Clouds · SIH PS 26069</div>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm text-slate-500">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/map" className="hover:text-white transition-colors">Live Map</Link>
            <Link to="/report" className="hover:text-white transition-colors">Submit Report</Link>
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
          <div className="text-xs text-slate-600">
            Built for Smart India Hackathon 2024
          </div>
        </div>
      </footer>
    </div>
  );
}
