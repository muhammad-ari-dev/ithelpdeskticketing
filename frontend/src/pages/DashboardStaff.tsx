import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoImg from "../assets/logolandscape.png";
import { authApi } from "../api/authApi"; // Import authApi
import {
  calculateDynamicPriority,
  getPriorityBadgeStyle,
} from "../utils/ticketUtils";

export default function DashboardStaff() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Ambil data user yang sedang login dari localStorage
  const [currentUser] = useState(() => {
    const sessionRaw = localStorage.getItem("currentUser");
    return sessionRaw ? JSON.parse(sessionRaw) : null;
  });

  // ================= FETCH DATA DARI BACKEND =================
  useEffect(() => {
    const fetchMyTickets = async () => {
      setIsLoading(true);
      try {
        const response = await authApi.getMyTickets();
        // Sesuaikan dengan format ResponseHandler backend (mengambil dari response.data)
        const data = Array.isArray(response) ? response : response?.data || [];
        
        // Sortir ID tiket dari yang terbaru atau biarkan sesuai backend
        setTickets(data);
      } catch (error) {
        console.error("Gagal mengambil data tiket:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTickets();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  // ================= METRIK DASHBOARD =================
  const totalAssigned = tickets.length;
  const totalCompleted = tickets.filter((t) => t.status === "Complete" || t.status === "Completed").length;
  const totalReopen = tickets.filter((t) => t.status === "Reopen").length;
  const totalInProgress = tickets.filter(
    (t) => t.status !== "Complete" && t.status !== "Completed" && t.status !== "Reopen"
  ).length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Complete":
      case "Completed":
        return "bg-emerald-50 text-[#22c55e] border-emerald-200";
      case "Reopen":
        return "bg-amber-50 text-[#f59e0b] border-amber-200";
      case "In Progress":
      case "On Progress":
        return "bg-blue-50 text-[#3b82f6] border-blue-200";
      case "Assigned":
      case "Open":
        return "bg-rose-50 text-[#ef4444] border-rose-200";
      case "On Check":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // Helper untuk memformat tanggal jika berupa array (seperti dari LocalDateTime Java)
  const formatDate = (dateObj: any) => {
    if (!dateObj) return "-";
    if (Array.isArray(dateObj)) {
       // Format dari [year, month, day, hour, minute]
       const [year, month, day] = dateObj;
       return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    // Jika string ISO, ambil bagian tanggalnya saja
    if (typeof dateObj === 'string') return dateObj.split('T')[0];
    return dateObj;
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
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${!isSidebarOpen && "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="h-24 flex items-center justify-center border-b border-blue-500/30 mt-2 pb-4 px-3 overflow-hidden">
          <div className={`flex items-center justify-start transition-all duration-300 ${isSidebarOpen ? "w-full h-16" : "w-12 h-12"}`}>
            <img src={LogoImg} alt="Logo IT Helpdesk" className={`transition-all duration-300 origin-left filter brightness-105 drop-shadow-md ${isSidebarOpen ? "w-full h-full object-contain object-left scale-[2.9] ml-2" : "h-full max-w-none object-cover object-left scale-[2.5] ml-1.5"}`} />
          </div>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2.5 px-3.5 overflow-y-auto overflow-x-hidden">
          <div className="flex items-center gap-3.5 bg-white/20 text-white border-l-[3.5px] border-white px-4 py-3 rounded-xl font-bold cursor-pointer transition-all hover:bg-white/25 group">
            <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className={`whitespace-nowrap text-[13px] tracking-wide uppercase transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}>
              DASHBOARD
            </span>
          </div>

          <div onClick={() => navigate("/profile")} className="flex items-center gap-3.5 text-blue-100/80 hover:bg-white/10 hover:text-white px-4 py-3 rounded-xl font-bold cursor-pointer transition-all group">
            <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className={`whitespace-nowrap text-[13px] tracking-wide uppercase transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}>
              PROFILE
            </span>
          </div>

          <div onClick={handleSignOut} className="mt-auto flex items-center gap-3.5 text-blue-100/80 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-100 group">
            <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`whitespace-nowrap text-[13px] tracking-wide transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}>
              SIGN OUT
            </span>
          </div>
        </div>
      </div>

      {/* ================= KONTEN UTAMA KANAN ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <div className="md:hidden bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm z-30 border-b border-slate-100">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3 bg-white hover:bg-blue-50/50 py-1.5 px-3 rounded-full border border-slate-200/80 cursor-pointer shadow-sm hover:shadow transition-all duration-300" onClick={() => navigate('/profile')}>
            <div className="text-right hidden sm:block">
              <p className="text-slate-500 font-bold text-xs leading-none">
                {currentUser?.userName || currentUser?.username}
              </p>
              <p className="text-blue-500 text-[10px] font-bold mt-1 leading-none">
                {currentUser?.roleName || "Staff IT"}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-600/90 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
              {(currentUser?.employeeName || currentUser?.name || currentUser?.userName || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 py-8 flex-1 overflow-y-auto custom-scrollbar z-10">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Staff Overview</h1>
                <p className="text-sm font-bold text-slate-500 mt-1">Pantau kinerja dan tugas yang ditugaskan kepada Anda.</p>
              </div>
              <div className="flex items-center gap-3 bg-white hover:bg-blue-50/50 py-1.5 px-3 rounded-full border border-slate-200/80 cursor-pointer shadow-sm hover:shadow transition-all duration-300" onClick={() => navigate('/profile')}>
                <div className="text-right hidden sm:block">
                  <p className="text-slate-500 font-bold text-xs leading-none">
                    {currentUser?.userName || currentUser?.username}
                  </p>
                  <p className="text-blue-500 text-[10px] font-bold mt-1 leading-none">
                    {currentUser?.roleName || "Staff IT"}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-600/90 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {(currentUser?.employeeName || currentUser?.name || currentUser?.userName || "U").charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* ================= STATISTIK CAPAIAN ================= */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Tugas</p>
                <p className="text-3xl font-bold text-slate-800">{isLoading ? "-" : totalAssigned}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Telah Selesai</p>
                <p className="text-3xl font-bold text-emerald-600">{isLoading ? "-" : totalCompleted}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Tugas Reopen</p>
                <p className="text-3xl font-bold text-amber-500">{isLoading ? "-" : totalReopen}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Sedang Berjalan</p>
                <p className="text-3xl font-bold text-blue-600">{isLoading ? "-" : totalInProgress}</p>
              </div>
            </div>

            {/* ================= DAFTAR TUGAS ================= */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Daftar Penugasan</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 z-10 relative">
              {isLoading ? (
                <div className="col-span-full py-20 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-slate-500 font-bold">Memuat data penugasan...</p>
                </div>
              ) : tickets.length > 0 ? (
                tickets
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((t) => {
                    const statusStr = t.status || "Open";
                    const isCompleted = statusStr === "Complete" || statusStr === "Completed";
                    const isInProgress = statusStr === "In Progress" || statusStr === "On Progress";
                    const formattedDate = formatDate(t.deadline);
                    const dynamicPriority = calculateDynamicPriority(formattedDate, statusStr, t.completedAt, statusStr === "Reopen");
                    return (
                    <div key={t.id || t.ticketCode} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden z-10">
                      <div className={`absolute right-0 top-0 w-2 h-full ${isCompleted ? "bg-emerald-500" : isInProgress ? "bg-blue-500" : "bg-rose-500"}`}></div>

                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[15px] font-black text-[#1E40AF]">{t.ticketCode || `No Task ${t.id}`}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(statusStr)}`}>
                                {statusStr}
                              </span>
                              {formattedDate && formattedDate !== "-" && (
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getPriorityBadgeStyle(dynamicPriority, statusStr)}`}>
                                  {dynamicPriority}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <p className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                              Batas Waktu: {formattedDate}
                            </p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <p className="text-[14px] font-bold text-slate-700 leading-relaxed">
                            {t.ticketName || t.task}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto border-t border-slate-100 pt-5 relative z-10">
                        {!isCompleted ? (
                          <button
                            onClick={() => navigate("/ticket-detail", { state: t })}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-[14px] shadow-sm transition-all flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat & Proses Tiket
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate("/ticket-detail", { state: t })}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 font-semibold py-2.5 rounded-xl text-[13px] transition-all flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Lihat Detail (Selesai)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm z-10">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-lg font-black text-slate-700">Tidak ada tugas saat ini</p>
                  <p className="text-sm font-bold text-slate-400 mt-1">Anda sudah menyelesaikan semua penugasan.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && Math.ceil(tickets.length / ITEMS_PER_PAGE) > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-12 z-10 relative">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Sebelumnya
                </button>
                <span className="text-sm font-bold text-slate-500 bg-slate-100/50 px-4 py-2 rounded-lg border border-slate-100">
                  Halaman <span className="text-slate-800">{currentPage}</span> dari <span className="text-slate-800">{Math.ceil(tickets.length / ITEMS_PER_PAGE)}</span>
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(tickets.length / ITEMS_PER_PAGE)))}
                  disabled={currentPage === Math.ceil(tickets.length / ITEMS_PER_PAGE)}
                  className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Selanjutnya
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}