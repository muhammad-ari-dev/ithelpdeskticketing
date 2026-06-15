import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoImg from "../assets/logolandscape.png";
import { useUserContext } from "../context/UserContext";
import {
  calculateDynamicPriority,
  getPriorityWeight,
  getPriorityBadgeStyle,
} from "../utils/ticketUtils";

// Gelombang biru dekoratif (konsisten di semua dashboard)
const BlueWave = () => (
  <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none overflow-hidden">
    <svg
      viewBox="0 0 1440 170"
      className="w-full h-[130px]"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="waveHeadShadow">
          <feDropShadow
            dx="0"
            dy="-6"
            stdDeviation="12"
            floodColor="#3B82F6"
            floodOpacity="0.15"
          />
        </filter>
      </defs>
      <path
        fill="#3B82F6"
        filter="url(#waveHeadShadow)"
        d="M0,120 C240,170 480,60 720,110 C960,160 1180,50 1440,100 L1440,170 L0,170 Z"
        opacity="0.28"
      />
      <path
        fill="#2563EB"
        d="M0,145 C180,110 360,165 540,135 C720,105 900,158 1080,125 C1200,105 1360,155 1440,142 L1440,170 L0,170 Z"
        opacity="0.42"
      />
    </svg>
  </div>
);

export default function DashboardHead() {
  const navigate = useNavigate(); // Hook untuk navigasi antar halaman
  const { users } = useUserContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const sessionRaw = localStorage.getItem("currentUser");
  const currentUser = sessionRaw ? JSON.parse(sessionRaw) : null;

  // Ambil data tiket real dari localStorage
  const [rawTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem("ticketsData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.sort((a: any, b: any) => Number(a.id) - Number(b.id));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Map tiket riil untuk menambahkan avatar teknisi dari context `users`
  const tickets = rawTickets.map((t) => {
    const staff = users.find((u) => u.name === t.tech);
    return {
      ...t,
      avatarImg: staff?.avatar || "",
      avatar: "bg-blue-500", // default fallback class
    };
  });

  const Speedometer = ({ level }: { level: "LOW" | "Medium" | "HIGH" }) => {
    const rotation =
      level === "LOW"
        ? "-rotate-45"
        : level === "Medium"
          ? "rotate-0"
          : "rotate-45";
    return (
      <div className="relative w-16 h-10 overflow-hidden flex justify-center drop-shadow-sm">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Softer HSL eye-comfort colors for speedometers */}
          <path
            d="M 10 50 A 40 40 0 0 1 35 20"
            fill="none"
            stroke="#10B981"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-90"
          />
          <path
            d="M 35 20 A 40 40 0 0 1 65 20"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="12"
            className="opacity-90"
          />
          <path
            d="M 65 20 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#EF4444"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-90"
          />
          <circle cx="50" cy="45" r="7" fill="#334155" />
        </svg>
        <div
          className={`absolute bottom-0.5 w-1.5 h-6 bg-slate-700 rounded-full origin-bottom transition-all duration-700 ease-out ${rotation}`}
          style={{ left: "calc(50% - 3px)" }}
        ></div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F0F6FF] font-sans overflow-hidden relative">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-200/20 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-200/15 blur-[100px] pointer-events-none z-0" />

      {/* ================= OVERLAY MOBILE ================= */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`fixed md:relative z-50 h-full ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"} bg-gradient-to-b from-blue-600 via-blue-600 to-indigo-700 shadow-2xl transition-all duration-300 ease-in-out flex flex-col shrink-0 border-r border-blue-500/30`}
      >
        {/* Tombol Toggle Sidebar (Desktop) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:block absolute -right-3.5 top-8 bg-white text-slate-800 rounded-full p-1.5 shadow-md hover:scale-110 hover:text-blue-600 transition-all z-30 border border-slate-100"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${!isSidebarOpen && "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center border-b border-blue-500/30 mt-2 pb-4 px-3 overflow-hidden">
          <div
            className={`flex items-center justify-start transition-all duration-300 ${isSidebarOpen ? "w-full h-16" : "w-12 h-12"}`}
          >
            <img
              src={LogoImg}
              alt="Logo IT Helpdesk"
              className={`transition-all duration-300 origin-left filter brightness-105 drop-shadow-md ${isSidebarOpen ? "w-full h-full object-contain object-left scale-[2.9] ml-2" : "h-full max-w-none object-cover object-left scale-[2.5] ml-1.5"}`}
            />
          </div>
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 py-6 flex flex-col gap-2.5 px-3.5 overflow-y-auto overflow-x-hidden">
          {/* Menu: Dashboard (AKTIF) */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3.5 bg-white/20 text-white border-l-[3.5px] border-white px-4 py-3 rounded-xl font-bold cursor-pointer transition-all hover:bg-white/25 group"
          >
            <svg
              className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span
              className={`whitespace-nowrap text-[13px] tracking-wide uppercase transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}
            >
              DASHBOARD
            </span>
          </div>

          {/* Menu Lainnya */}
          {[
            {
              icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
              text: "Profile",
              path: "/profile",
            },
            {
              icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
              text: "Teknisi",
              path: "/teknisi",
            },
            {
              icon: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              text: "Buat Tiket",
              path: "/buat-tiket",
            },
            {
              icon: "M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4-4-4-4",
              text: "Detail Tiket",
              path: "/ticket-detail",
            },
            {
              icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
              text: "Lihat Tiket",
              path: "/lihat-tiket",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3.5 text-blue-100/80 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-white/10 hover:text-white group"
            >
              <svg
                className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform text-blue-200/80 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={item.icon}
                />
              </svg>
              <span
                className={`whitespace-nowrap text-[13px] tracking-wide transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}
              >
                {item.text}
              </span>
            </div>
          ))}

          {/* Sign Out Button in Sidebar */}
          <div
            onClick={() => {
              localStorage.removeItem("currentUser");
              navigate("/login");
            }}
            className="mt-auto flex items-center gap-3.5 text-blue-100/80 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-100 group"
          >
            <svg
              className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span
              className={`whitespace-nowrap text-[13px] tracking-wide transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}
            >
              SIGN OUT
            </span>
          </div>
        </div>
      </div>

      {/* ================= KONTEN UTAMA KANAN ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Gelombang biru di bagian bawah */}
        <BlueWave />

        {/* Navbar Top Mobile (Meresponsive) */}
        <div className="md:hidden bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm z-30 border-b border-slate-100">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-3 bg-white hover:bg-blue-50/50 py-1.5 px-3 rounded-full border border-slate-200/80 cursor-pointer shadow-sm hover:shadow transition-all duration-300" onClick={() => navigate('/profile')}>
            <div className="text-right hidden sm:block">
              <p className="text-slate-800 font-extrabold text-xs leading-none">
                {currentUser.name || currentUser.username}
              </p>
              <p className="text-blue-500 text-[10px] font-bold mt-1">
                Head IT
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600/90 flex items-center justify-center shadow-inner text-white font-bold text-xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : currentUser?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>

        {/* Header Bar */}
        <header className="hidden md:flex h-20 bg-white/70 backdrop-blur-md border-b border-slate-100 shadow-sm items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-extrabold text-slate-800 hidden sm:block tracking-tight">
              Overview Dashboard
            </h2>
          </div>

          <div
            className="flex items-center gap-3 bg-white hover:bg-blue-50/50 py-1.5 px-3 rounded-full border border-slate-200/80 cursor-pointer shadow-sm hover:shadow transition-all duration-300"
            onClick={() => {
              localStorage.removeItem("currentUser");
              navigate("/login");
            }}
            title="Sign Out"
          >
            <div className="text-right hidden sm:block">
              <p className="text-slate-800 font-extrabold text-xs leading-none">
                {currentUser.name}
              </p>
              <p className="text-blue-500 text-[10px] font-bold mt-1">
                Head IT
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-600/90 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Area Konten Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto space-y-8">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  level: "LOW",
                  count: tickets.filter(
                    (t) =>
                      calculateDynamicPriority(
                        t.date,
                        t.status,
                        t.completedAt,
                        t.reopenCount > 0,
                      ) === "LOW",
                  ).length,
                  color: "text-emerald-500",
                  desc: "Prioritas Rendah",
                },
                {
                  level: "Medium",
                  count: tickets.filter(
                    (t) =>
                      calculateDynamicPriority(
                        t.date,
                        t.status,
                        t.completedAt,
                        t.reopenCount > 0,
                      ) === "MEDIUM",
                  ).length,
                  color: "text-amber-500",
                  desc: "Prioritas Sedang",
                },
                {
                  level: "HIGH",
                  count: tickets.filter(
                    (t) =>
                      calculateDynamicPriority(
                        t.date,
                        t.status,
                        t.completedAt,
                        t.reopenCount > 0,
                      ) === "HIGH",
                  ).length,
                  color: "text-rose-500",
                  desc: "Prioritas Tinggi",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-md rounded-3xl p-6 flex items-center justify-between border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(30,58,138,0.06)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <Speedometer level={item.level as any} />
                  <div className="text-right">
                    <p className="text-[10px] font-extrabold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-widest">
                      {item.desc}
                    </p>
                    <p
                      className={`text-4xl font-black ${item.color} drop-shadow-sm mt-1`}
                    >
                      {item.count}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chevron Status Pipeline (Highly Refined) */}
            <div className="w-full flex h-[62px] shadow-sm rounded-2xl overflow-hidden font-extrabold text-[13px] bg-white border border-slate-100">
              {/* STEP 1: WAITING */}
              <div
                className="min-w-[120px] md:w-1/5 flex-shrink-0 bg-rose-50/70 border-r border-rose-100/50 z-50 flex items-center justify-center gap-2.5 hover:bg-rose-100/40 transition-colors cursor-pointer"
                style={{
                  clipPath: "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)",
                }}
              >
                <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {tickets.filter((t) => t.status === "Assigned").length}
                </span>
                <span className="text-rose-700 tracking-wide hidden sm:block">
                  Assigned
                </span>
              </div>

              {/* STEP 2: PROGRESS */}
              <div
                className="min-w-[120px] md:w-1/5 flex-shrink-0 bg-blue-50/70 border-r border-blue-100/50 z-40 flex items-center justify-center gap-2.5 -ml-4 pl-4 hover:bg-blue-100/40 transition-colors cursor-pointer"
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 8% 50%)",
                }}
              >
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {tickets.filter((t) => t.status === "In Progress").length}
                </span>
                <span className="text-blue-700 tracking-wide hidden sm:block">
                  In Progress
                </span>
              </div>

              {/* STEP 3: RECHECK */}
              <div
                className="min-w-[120px] md:w-1/5 flex-shrink-0 bg-purple-50/70 border-r border-purple-100/50 z-30 flex items-center justify-center gap-2.5 -ml-4 pl-4 hover:bg-purple-100/40 transition-colors cursor-pointer"
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 8% 50%)",
                }}
              >
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {tickets.filter((t) => t.status === "On Check").length}
                </span>
                <span className="text-purple-700 tracking-wide hidden sm:block">
                  On Check
                </span>
              </div>

              {/* STEP 4: COMPLETE */}
              <div
                className="min-w-[120px] md:w-1/5 flex-shrink-0 bg-emerald-50/70 border-r border-emerald-100/50 z-20 flex items-center justify-center gap-2.5 -ml-4 pl-4 hover:bg-emerald-100/40 transition-colors cursor-pointer"
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 8% 50%)",
                }}
              >
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {tickets.filter((t) => t.status === "Completed").length}
                </span>
                <span className="text-emerald-700 tracking-wide hidden sm:block">
                  Complete
                </span>
              </div>

              {/* STEP 5: REOPEN */}
              <div
                className="min-w-[120px] md:w-1/5 flex-shrink-0 bg-amber-50/60 z-10 flex items-center justify-center gap-2.5 -ml-4 pl-4 hover:bg-amber-100/40 transition-colors cursor-pointer"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 8% 50%)",
                }}
              >
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {tickets.filter((t) => t.reopenCount > 0).length}
                </span>
                <span className="text-amber-700 tracking-wide hidden sm:block">
                  Reopened
                </span>
              </div>
            </div>

            {/* Live Tracking Table/Cards */}
            <div className="bg-white/90 backdrop-blur-md rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-white/50">
                <h2 className="text-md font-extrabold text-slate-800 flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>{" "}
                  Live Task Tracking
                </h2>
              </div>

              <div className="divide-y divide-slate-100/80">
                {[...tickets]
                  .sort(
                    (a, b) =>
                      getPriorityWeight(
                        calculateDynamicPriority(
                          b.date,
                          b.status,
                          b.completedAt,
                          b.reopenCount > 0,
                        ),
                        b.status,
                      ) -
                      getPriorityWeight(
                        calculateDynamicPriority(
                          a.date,
                          a.status,
                          a.completedAt,
                          a.reopenCount > 0,
                        ),
                        a.status,
                      ),
                  )
                  .map((t, index) => (
                    <div
                      key={index}
                      onClick={() => navigate("/ticket-detail", { state: t })}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 hover:bg-blue-50/40 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="w-full sm:w-[30%] mb-3 sm:mb-0">
                        <p className="font-extrabold text-slate-800 text-[14px] group-hover:text-blue-600 transition-colors">
                          No Task {t.id}
                        </p>
                        <p className="text-xs text-slate-400 font-bold mt-1 truncate">
                          {t.kodeMasalah && (
                            <span className="text-rose-500 mr-1">
                              [{t.kodeMasalah}]
                            </span>
                          )}
                          {t.task}
                        </p>
                      </div>

                      <div className="w-full sm:w-[20%] mb-3 sm:mb-0">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${
                            t.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-150"
                              : t.status === "Reopen"
                                ? "bg-amber-50 text-amber-600 border-amber-150"
                                : t.status === "In Progress"
                                  ? "bg-blue-50 text-blue-600 border-blue-150"
                                  : "bg-rose-50 text-rose-600 border-rose-150"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              t.status === "Completed"
                                ? "bg-emerald-500"
                                : t.status === "Reopen"
                                  ? "bg-amber-500"
                                  : t.status === "In Progress"
                                    ? "bg-blue-500"
                                    : "bg-rose-500"
                            }`}
                          ></span>
                          {t.status}
                        </span>
                      </div>

                      <div className="w-full sm:w-[15%] mb-3 sm:mb-0">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${getPriorityBadgeStyle(calculateDynamicPriority(t.date, t.status, t.completedAt, t.reopenCount > 0), t.status)}`}
                        >
                          {calculateDynamicPriority(
                            t.date,
                            t.status,
                            t.completedAt,
                            t.reopenCount > 0,
                          )}
                        </span>
                      </div>

                      <div className="w-full sm:w-[15%] text-slate-400 text-xs font-bold mb-3 sm:mb-0">
                        {t.date}
                      </div>

                      <div className="w-full sm:w-[20%] flex items-center justify-start sm:justify-end gap-2.5">
                        <span className="font-extrabold text-slate-600 text-xs truncate max-w-[110px]">
                          {t.tech}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-white/80 ${t.avatar}`}
                        >
                          {t.tech.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
