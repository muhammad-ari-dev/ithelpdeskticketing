
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../assets/logolandscape.png';
import { useUserContext } from '../context/UserContext';
import { authApi } from '../api/authApi';// Import authApi

// ============================================================
// KOMPONEN GELOMBANG BIRU (Konsisten seperti Login/Register)
// ============================================================
const BlueWave = () => (
  <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none overflow-hidden">
    <svg
      viewBox="0 0 1440 220"
      className="w-full h-[180px]"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="waveDropShadow">
          <feDropShadow
            dx="0"
            dy="-8"
            stdDeviation="15"
            floodColor="#1D4ED8"
            floodOpacity="0.18"
          />
        </filter>
      </defs>
      <path
        fill="#3B82F6"
        filter="url(#waveDropShadow)"
        d="M0,160 C200,220 380,80 600,140 C820,200 1020,60 1200,120 C1320,160 1390,180 1440,170 L1440,220 L0,220 Z"
        opacity="0.35"
      />
      <path
        fill="#2563EB"
        d="M0,190 C180,140 360,220 540,180 C720,140 900,200 1080,160 C1200,130 1360,200 1440,190 L1440,220 L0,220 Z"
        opacity="0.5"
      />
    </svg>
  </div>
);

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function TambahUser() {
  const navigate = useNavigate();
  const { addUser, getHeads, getStaffs } = useUserContext();

  // Ambil data dari context
  const availableLeaders = getHeads();
  const availableStaffs = getStaffs();

  // ===== STATE FORM =====
  const [formData, setFormData] = useState({
    namaLengkap: "",
    userName: "",
    email: "",
    noTelepon: "",
    role: "Staff IT" as "Staff IT" | "Head IT",
    joinDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
  });
  const [leads, setLeads] = useState<{ id: string; employeeName: string }[]>([]); // Buat nampung data Lead dari Backend

  useEffect(() => {
    // Ngambil daftar Lead pas halaman dimuat
    setLeadsLoading(true);
    authApi.getLeads()
      .then((data: any) => {
        // Handle jika backend return { data: [...] } atau langsung array
        const list = Array.isArray(data) ? data : data?.data ?? [];
        console.log("[getLeads] result:", list);
        setLeads(list);
      })
      .catch((err) => {
        console.error("[getLeads] error:", err);
      })
      .finally(() => setLeadsLoading(false));
  }, []);

  const [selectedLeaderId, setSelectedLeaderId] = useState<string>(""); // State UI
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newUserName, setNewUserName] = useState("");

  // Session user dari localStorage
  const sessionRaw = localStorage.getItem("currentUser");
  const sessionUser = sessionRaw
    ? JSON.parse(sessionRaw)
    : { username: "Admin", role: "ADMIN" };

  // ===== HANDLERS =====
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      role: e.target.value as "Staff IT" | "Head IT",
    });
    setSelectedLeaderId("");
    setSelectedStaffIds([]);
  };

  const handleAddStaff = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const staffId = e.target.value;
    if (!staffId) return;
    if (!selectedStaffIds.includes(staffId)) {
      setSelectedStaffIds((prev) => [...prev, staffId]);
    }
    e.target.value = "";
  };

  const handleRemoveStaff = (staffId: string) => {
    setSelectedStaffIds((prev) => prev.filter((id) => id !== staffId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        employeeName: formData.namaLengkap,
        userName: formData.userName,
        email: formData.email,
        noHp: formData.noTelepon,
        roleName: formData.role === "Head IT" ? "LEAD" : "EMPLOYEE",
        leadID: formData.role === "Staff IT" ? selectedLeaderId : null,
      };

      const result = await authApi.registerEmployee(dataToSend);
      alert("Sukses: " + result);
      setShowSuccessPopup(true);
      // Reset form...
    } catch (error: any) {
      alert(error.response?.data || "Gagal daftar!");
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F6FF] font-sans overflow-hidden relative">
      {/* ================= SUCCESS POPUP ================= */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center border border-slate-100 min-w-[320px]">
            <div className="w-20 h-20 bg-[#22c55e] rounded-full flex items-center justify-center mb-4 shadow-[0_10px_25px_rgba(34,197,94,0.4)]">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center">
              Registrasi Berhasil!
            </h3>
            <p className="text-sm font-bold text-slate-500 mt-2 text-center">
              <span className="text-blue-600">{newUserName}</span> berhasil
              didaftarkan.
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1 text-center">
              Email & kredensial login telah dikirim (lihat console)
            </p>
          </div>
        </div>
      )}

      {/* ================= OVERLAY MOBILE ================= */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`fixed md:relative z-50 h-full ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"} bg-gradient-to-b from-[#3B82F6] via-[#2563EB] to-[#1E40AF] shadow-2xl transition-all duration-300 ease-in-out flex flex-col shrink-0 border-r border-blue-500/30`}
      >
        {/* Toggle button */}
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

        {/* Logo */}
        <div className="h-24 flex items-center justify-center border-b border-blue-500/30 mt-2 pb-4 px-3 overflow-hidden">
          <div
            className={`flex items-center justify-start transition-all duration-300 ${isSidebarOpen ? "w-full h-16" : "w-12 h-12"}`}
          >
            <img
              src={LogoImg}
              alt="Logo IT Helpdesk"
              className={`transition-all duration-300 origin-left drop-shadow-md filter brightness-110 ${isSidebarOpen ? "w-full h-full object-contain object-left scale-[2.9] ml-2" : "h-full max-w-none object-cover object-left scale-[2.5] ml-1.5"}`}
            />
          </div>
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
          {/* Dashboard Admin */}
          <div
            onClick={() => navigate("/dashboard-admin")}
            className="flex items-center gap-3.5 text-blue-100/80 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-white/10 hover:text-white group"
          >
            <svg
              className="w-5 h-5 shrink-0 text-blue-200/80 group-hover:text-white group-hover:scale-105 transition-transform"
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
              className={`whitespace-nowrap text-[13px] uppercase tracking-wide transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 -translate-x-4 hidden"}`}
            >
              Dashboard Karyawan
            </span>
          </div>

          {/* Tambah User (AKTIF) */}
          <div className="flex items-center gap-3.5 bg-white/20 text-white border-l-[3.5px] border-white px-4 py-3 rounded-xl font-bold cursor-pointer">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span
              className={`whitespace-nowrap text-[13px] uppercase tracking-wide transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 -translate-x-4 hidden"}`}
            >
              Tambah User
            </span>
          </div>
        </div>

        {/* Profile di sidebar */}
        <div className="px-3 pb-6">
          <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3 border border-white/20">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md">
              <span className="text-[#3B82F6] font-black text-sm">
                {sessionUser.username?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {isSidebarOpen && (
              <div>
                <p className="text-white font-black text-xs leading-tight">
                  {sessionUser.username}
                </p>
                <p className="text-blue-200 text-[10px] font-bold mt-0.5">
                  Admin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= KONTEN UTAMA ================= */}
      <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
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
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black uppercase tracking-widest text-[#3B82F6]">
                Welcome Back
              </p>
              <p className="text-sm font-extrabold text-slate-800">
                {sessionUser.username}
              </p>
            </div>
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md">
              <span className="text-[#3B82F6] font-black text-sm">
                {sessionUser.username?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Header Bar Biru (Konsisten seperti DetailTiket) */}
        <div className="hidden md:block w-full px-6 pt-6 pb-2 z-10 shrink-0">
          <div className="bg-[#3B82F6] rounded-[24px] px-8 py-3.5 flex items-center justify-between shadow-[0_10px_30px_rgba(59,130,246,0.35)]">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/dashboard-admin")}
                className="text-blue-100 hover:text-white font-bold text-[14px] transition-colors"
              >
                Dashboard
              </button>
              <div className="bg-white px-5 py-1.5 rounded-full shadow-sm">
                <span className="text-[#1E40AF] font-black text-[14px] tracking-wide">
                  Tambah User
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="text-white font-black text-[15px] leading-tight">
                  {sessionUser.username}
                </h3>
                <p className="text-blue-100 font-bold text-[11px]">Admin</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 shadow-lg">
                <span className="text-white font-black text-sm">
                  {sessionUser.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Konten Form Scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-8 px-4 sm:px-6 md:px-8 pt-4">
          <div className="max-w-[800px] mx-auto bg-white rounded-[36px] shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100 overflow-hidden">
            <div className="p-10">
              {/* Judul Halaman */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#3B82F6] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(59,130,246,0.35)]">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[26px] font-black text-[#1E3A8A] leading-tight">
                    Registrasi Karyawan
                  </h1>
                  <p className="text-slate-400 font-bold text-[13px]">
                    Isi data berikut untuk mendaftarkan karyawan baru.
                  </p>
                </div>
              </div>

              {/* Info Admin Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-3 mb-6">
                <svg
                  className="w-5 h-5 text-[#3B82F6] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[#1E40AF] font-bold text-[13px]">
                  Password default:{" "}
                  <span className="font-black bg-blue-100 px-2 py-0.5 rounded-lg">
                    password123
                  </span>
                </p>
              </div>

              {/* Form Card */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6"
              >
                {/* ======== KOLOM KIRI: Data Karyawan ======== */}
                <div className="space-y-5">
                  <h3 className="text-[12px] font-black text-[#3B82F6] uppercase tracking-widest border-b border-blue-100 pb-2">
                    Data Karyawan
                  </h3>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={formData.namaLengkap}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          namaLengkap: e.target.value,
                        })
                      }
                      placeholder="cth: Ariana Azzahra"
                      required
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  {/* User Name */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                      User Name *
                    </label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) =>
                        setFormData({ ...formData, userName: e.target.value })
                      }
                      placeholder="cth: Ariana.17200"
                      required
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="cth: ariana@gmail.com"
                      required
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  {/* No Telepon */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                      No Telepon *
                    </label>
                    <input
                      type="tel"
                      value={formData.noTelepon}
                      onChange={(e) =>
                        setFormData({ ...formData, noTelepon: e.target.value })
                      }
                      placeholder="cth: 081234567890"
                      required
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  {/* Tanggal Bergabung */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                      Tanggal Bergabung *
                    </label>
                    <input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) =>
                        setFormData({ ...formData, joinDate: e.target.value })
                      }
                      required
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                      Role *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={handleRoleChange}
                        className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none appearance-none cursor-pointer focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                      >
                        <option value="Staff IT">Staff IT</option>
                        <option value="Head IT">Head IT</option>
                      </select>
                      <svg
                        className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ======== KOLOM KANAN: Relasi Dinamis ======== */}
                <div className="space-y-5">
                  <h3 className="text-[12px] font-black text-[#3B82F6] uppercase tracking-widest border-b border-blue-100 pb-2">
                    {formData.role === "Staff IT"
                      ? "Pilih Leader"
                      : "Pilih Staff Anggota"}
                  </h3>

                  {/* ==== KONDISI 1: Staff IT → Pilih Leader (Single Select) ==== */}
                  {formData.role === 'Staff IT' && (
                    <div className="relative">
                      <select
                        value={selectedLeaderId}
                        onChange={(e) => setSelectedLeaderId(e.target.value)}
                        disabled={leadsLoading}
                        className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none appearance-none cursor-pointer focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-60 disabled:cursor-wait"
                      >
                        <option value="">
                          {leadsLoading ? "Memuat data..." : leads.length === 0 ? "— Tidak ada Head IT —" : "— Pilih Head IT —"}
                        </option>
                        {leads.map((l) => (
                          <option key={l.id.toString()} value={l.id.toString()}>{l.employeeName}</option>
                        ))}
                      </select>
                      <svg
                        className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  )}


                  {/* ==== KONDISI 2: Head IT → Multi-Select Staff ==== */}
                  {formData.role === "Head IT" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                          Tambah Staff
                        </label>
                        <div className="relative">
                          <select
                            onChange={handleAddStaff}
                            defaultValue=""
                            className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none appearance-none cursor-pointer focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                          >
                            <option value="" disabled>
                              — Pilih Staff untuk ditambahkan —
                            </option>
                            {availableStaffs
                              .filter((s) => !selectedStaffIds.includes(s.id))
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.role})
                                </option>
                              ))}
                          </select>
                          <svg
                            className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Daftar Staff Terpilih */}
                      {selectedStaffIds.length > 0 && (
                        <div className="bg-[#F8FAFF] border border-blue-100 rounded-2xl p-3 flex flex-wrap gap-2">
                          {selectedStaffIds.map((staffId) => {
                            const staff = availableStaffs.find(
                              (s) => s.id === staffId,
                            );
                            return staff ? (
                              <div
                                key={staffId}
                                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-[12px] font-bold"
                              >
                                {staff.name}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStaff(staffId)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ==== TOMBOL SUBMIT ==== */}
                <div className="col-span-1 md:col-span-2 flex gap-4 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-[15px] py-4 rounded-2xl shadow-[0_8px_25px_rgba(34,197,94,0.35)] transition-all active:scale-95 flex items-center justify-center gap-2.5"
                  >
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Registrasi Karyawan
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard-admin")}
                    className="px-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[15px] py-4 rounded-2xl transition-all active:scale-95"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
