import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import LogoImg from "../assets/logolandscape.png";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  calculateDynamicPriority,
  getPriorityBadgeStyle,
} from "../utils/ticketUtils";

// Gelombang biru dekoratif dihapus untuk tampilan yang lebih profesional dan bersih.

export default function DashboardStaff() {
  const navigate = useNavigate();
  const { users } = useUserContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const [tickets, setTickets] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Ambil data user yang sedang login dari localStorage (hanya sekali)
  const [currentUser] = useState(() => {
    const sessionRaw = localStorage.getItem("currentUser");
    return sessionRaw ? JSON.parse(sessionRaw) : null;
  });

  const staffUser = users.find((u) => u.username === currentUser?.username);
  const myPoints = staffUser?.points || 0;

  useEffect(() => {
    // if (!currentUser || currentUser.roleName !== "EMPLOYEE") {
    //   navigate("/");
    //   return;
    // }

    const saved = localStorage.getItem("ticketsData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const myTickets = parsed.filter(
          (t: any) =>
            t.tech &&
            currentUser.username &&
            t.tech.toLowerCase().includes(currentUser.username.toLowerCase()),
        );
        setTickets(
          myTickets.sort((a: any, b: any) => Number(a.id) - Number(b.id)),
        );
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser, navigate]);

  const getMyAvatar = () => {
    if (!currentUser) return "https://i.pravatar.cc/150?img=11";
    const me = users.find(
      (u) => u.name.toLowerCase() === currentUser.username.toLowerCase(),
    );
    return me?.avatar || "https://i.pravatar.cc/150?img=11";
  };

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const updateTicketStatus = (ticketId: string, newStatus: string) => {
    // Logika update status dipindahkan ke halaman DetailTiket untuk mencegah duplikasi logika SLA
  };

  const totalAssigned = tickets.length;
  const totalCompleted = tickets.filter((t) => t.status === "Completed").length;
  const totalReopen = tickets.filter((t) => t.reopenCount > 0).length;
  const totalInProgress = tickets.filter(
    (t) => t.status !== "Completed",
  ).length;

  // Data for Recharts
  const chartData = tickets
    .filter((t) => t.pointsEarned !== undefined)
    .map((t) => ({
      name: `T-${t.id}`,
      poin: t.pointsEarned,
      color:
        t.pointsEarned > 0
          ? "#22c55e"
          : t.pointsEarned < 0
            ? "#ef4444"
            : "#f59e0b",
    }));

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-[#22c55e] border-emerald-200";
      case "Reopen":
        return "bg-amber-50 text-[#f59e0b] border-amber-200";
      case "In Progress":
        return "bg-blue-50 text-[#3b82f6] border-blue-200";
      case "Recheck":
        return "bg-slate-50 text-slate-600 border-slate-200";
      case "Assigned":
        return "bg-rose-50 text-[#ef4444] border-rose-200";
      case "On Check":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
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

        <div className="flex-1 py-6 flex flex-col gap-2.5 px-3.5 overflow-y-auto overflow-x-hidden">
          <div className="flex items-center gap-3.5 bg-white/20 text-white border-l-[3.5px] border-white px-4 py-3 rounded-xl font-bold cursor-pointer transition-all hover:bg-white/25 group">
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

          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3.5 text-blue-100/80 hover:bg-white/10 hover:text-white px-4 py-3 rounded-xl font-bold cursor-pointer transition-all group"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span
              className={`whitespace-nowrap text-[13px] tracking-wide uppercase transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}
            >
              PROFILE
            </span>
          </div>

          {/* Sign Out Button in Sidebar */}
          <div
            onClick={handleSignOut}
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
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black uppercase tracking-widest text-[#3B82F6]">
                Staff Dashboard
              </p>
              <p className="text-sm font-extrabold text-slate-800">
                {currentUser?.username}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[#3B82F6] overflow-hidden p-0.5 bg-white">
              <img
                src={getMyAvatar()}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 md:px-10 py-8 flex-1 overflow-y-auto custom-scrollbar z-10">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  Staff Overview
                </h1>
                <p className="text-sm font-bold text-slate-500 mt-1">
                  Pantau kinerja dan tugas yang ditugaskan kepada Anda.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                    Welcome Back
                  </p>
                  <p className="text-[14px] font-extrabold text-slate-800 mb-0.5">
                    {currentUser?.username}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
                  <img
                    src={getMyAvatar()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* ================= STATISTIK CAPAIAN & GRAFIK ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              {/* Stats */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-5">
                <div className="col-span-2 bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-2xl shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/10 skew-x-12 transform group-hover:translate-x-8 transition-transform duration-500"></div>
                  <p className="text-[12px] font-semibold text-blue-100 uppercase tracking-widest mb-1 relative z-10">
                    Total Poin Tiket Keseluruhan
                  </p>
                  <p className="text-4xl font-bold text-white relative z-10 flex items-center gap-2">
                    ⭐{" "}
                    {tickets.reduce((sum, t) => sum + (t.pointsEarned || 0), 0)}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    Total Tugas
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {totalAssigned}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    Telah Selesai
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {totalCompleted}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    Tugas Reopen
                  </p>
                  <p className="text-3xl font-bold text-amber-500">
                    {totalReopen}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    Sedang Berjalan
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalInProgress}
                  </p>
                </div>
              </div>

              {/* Graphic / Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
                  Grafik Poin Per Tiket
                </p>
                {chartData.length > 0 ? (
                  <div className="w-full flex-1 min-h-[220px] pb-2">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      className="border-none outline-none"
                    >
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#F1F5F9"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: "#94A3B8",
                          }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          tick={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: "#94A3B8",
                          }}
                          axisLine={false}
                          tickLine={false}
                          dx={-10}
                        />
                        <Tooltip
                          cursor={{ fill: "#F8FAFC" }}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            fontWeight: "bold",
                          }}
                          itemStyle={{ fontWeight: "bold" }}
                        />
                        <Bar dataKey="poin" radius={[6, 6, 6, 6]} barSize={22}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                      <svg
                        className="w-8 h-8 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                        />
                      </svg>
                    </div>
                    <p className="text-[12px] font-bold text-slate-400">
                      Belum ada data grafik
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ================= DAFTAR TUGAS ================= */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                Daftar Penugasan
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 z-10 relative">
              {tickets.length > 0 ? (
                tickets
                  .slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE,
                  )
                  .map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden z-10"
                    >
                      <div
                        className={`absolute right-0 top-0 w-2 h-full ${t.status === "Completed" ? "bg-emerald-500" : t.status === "In Progress" ? "bg-blue-500" : "bg-rose-500"}`}
                      ></div>

                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[15px] font-black text-[#1E40AF]">
                              No Task {t.id}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(t.status)}`}
                              >
                                {t.status}
                              </span>
                              {t.date && (
                                <span
                                  className={`px-2.5 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getPriorityBadgeStyle(calculateDynamicPriority(t.date, t.status, t.completedAt, t.reopenCount > 0), t.status)}`}
                                >
                                  {calculateDynamicPriority(
                                    t.date,
                                    t.status,
                                    t.completedAt,
                                    t.reopenCount > 0,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <p className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                              {t.date}
                            </p>
                            {t.pointsEarned !== undefined && (
                              <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 shadow-sm flex items-center gap-1">
                                ⭐{" "}
                                {t.pointsEarned > 0
                                  ? `+${t.pointsEarned}`
                                  : t.pointsEarned}{" "}
                                Poin
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mb-6">
                          <p className="text-[14px] font-bold text-slate-700 leading-relaxed">
                            {t.kodeMasalah && (
                              <span className="text-rose-500 mr-1">
                                [{t.kodeMasalah}]
                              </span>
                            )}
                            {t.task}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto border-t border-slate-100 pt-5 relative z-10">
                        {t.status !== "Completed" ? (
                          <button
                            onClick={() =>
                              navigate("/ticket-detail", { state: t })
                            }
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-[14px] shadow-sm transition-all flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Lihat & Proses Tiket
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navigate("/ticket-detail", { state: t })
                            }
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 font-semibold py-2.5 rounded-xl text-[13px] transition-all flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Lihat Detail (Selesai)
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm z-10">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-black text-slate-700">
                    Tidak ada tugas saat ini
                  </p>
                  <p className="text-sm font-bold text-slate-400 mt-1">
                    Anda sudah menyelesaikan semua penugasan.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {Math.ceil(tickets.length / ITEMS_PER_PAGE) > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-12 z-10 relative">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Sebelumnya
                </button>
                <span className="text-sm font-bold text-slate-500 bg-slate-100/50 px-4 py-2 rounded-lg border border-slate-100">
                  Halaman <span className="text-slate-800">{currentPage}</span>{" "}
                  dari{" "}
                  <span className="text-slate-800">
                    {Math.ceil(tickets.length / ITEMS_PER_PAGE)}
                  </span>
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(tickets.length / ITEMS_PER_PAGE),
                      ),
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(tickets.length / ITEMS_PER_PAGE)
                  }
                  className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Selanjutnya
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
