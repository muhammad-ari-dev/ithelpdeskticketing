
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../assets/logolandscape.png';
import { useUserContext } from '../context/UserContext';
import { authApi } from '../api/authApi';// Import authApi

// ============================================================
// KOMPONEN GELOMBANG BIRU
// ============================================================
const BlueWave = () => (
  <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none overflow-hidden">
    <svg viewBox="0 0 1440 170" className="w-full h-[130px]" preserveAspectRatio="none">
      <defs>
        <filter id="waveHeadShadow">
          <feDropShadow dx="0" dy="-6" stdDeviation="12" floodColor="#3B82F6" floodOpacity="0.15" />
        </filter>
      </defs>
      <path fill="#3B82F6" filter="url(#waveHeadShadow)" d="M0,120 C240,170 480,60 720,110 C960,160 1180,50 1440,100 L1440,170 L0,170 Z" opacity="0.28" />
      <path fill="#2563EB" d="M0,145 C180,110 360,165 540,135 C720,105 900,158 1080,125 C1200,105 1360,155 1440,142 L1440,170 L0,170 Z" opacity="0.42" />
    </svg>
  </div>
);

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function TambahUser() {
  const navigate = useNavigate();
  const { getStaffs } = useUserContext();

  // Ambil data dari context
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
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionRaw = localStorage.getItem("currentUser");
  const sessionUser = sessionRaw
    ? JSON.parse(sessionRaw)
    : { username: "Admin", role: "ADMIN" };

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

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

    // Validasi Nama Lengkap
    const nameRegex = /^[a-zA-Z\s.'-]{2,64}$/;
    if (!nameRegex.test(formData.namaLengkap)) {
      setErrorMessage("Nama lengkap tidak valid. Gunakan 2-64 karakter huruf, spasi, titik, apostrof, atau strip.");
      setShowErrorPopup(true);
      return;
    }

    // Validasi Username
    const usernameRegex = /^[a-zA-Z0-9._]{3,64}$/;
    if (!usernameRegex.test(formData.userName)) {
      setErrorMessage("Username tidak valid. Gunakan 3-64 karakter alfanumerik, titik, atau underscore tanpa spasi.");
      setShowErrorPopup(true);
      return;
    }

    // Validasi Nomor HP
    const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
    if (!phoneRegex.test(formData.noTelepon)) {
      setErrorMessage("Nomor HP tidak valid. Harus diawali +62, 62, atau 0 dan diikuti 8-13 angka.");
      setShowErrorPopup(true);
      return;
    }

    // Validasi Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Alamat email tidak valid. Pastikan format domain komplit (misal: .com, bukan .c).");
      setShowErrorPopup(true);
      return;
    }

    // Validasi Leader jika role Staff IT
    if (formData.role === "Staff IT" && !selectedLeaderId) {
      setErrorMessage("Silakan pilih Leader terlebih dahulu.");
      setShowErrorPopup(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = {
        employeeName: formData.namaLengkap,
        userName: formData.userName,
        email: formData.email,
        noHp: formData.noTelepon,
        roleName: formData.role === "Head IT" ? "LEAD" : "EMPLOYEE",
        leadID: formData.role === "Staff IT" ? selectedLeaderId : null,
      };

      await authApi.registerEmployee(dataToSend);
      setNewUserName(formData.namaLengkap);
      setShowSuccessPopup(true);

      // Reset form
      setFormData({
        namaLengkap: "",
        userName: "",
        email: "",
        noTelepon: "",
        role: "Staff IT",
        joinDate: new Date().toISOString().split("T")[0],
      });
      setSelectedLeaderId("");
      setSelectedStaffIds([]);
    } catch (error: any) {
      setErrorMessage(error.response?.data || "Gagal mendaftarkan karyawan!");
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F6FF] font-sans overflow-hidden relative">

      {/* Ambient blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-200/20 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-indigo-200/15 blur-[100px] pointer-events-none z-0" />

      {/* ================= SUCCESS POPUP ================= */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center border border-slate-100 min-w-[320px] animate-scale-up">
            <div className="w-20 h-20 bg-[#22c55e] rounded-full flex items-center justify-center mb-4 shadow-[0_10px_25px_rgba(34,197,94,0.4)]">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center">
              Registrasi Berhasil!
            </h3>
            <p className="text-sm font-bold text-slate-500 mt-2 text-center">
              <span className="text-blue-600">{newUserName}</span> berhasil didaftarkan.
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1 mb-6 text-center">
              Email konfirmasi telah dikirimkan.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              OK, Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* ================= ERROR POPUP ================= */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center border border-slate-100 min-w-[320px] animate-scale-up">
            <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mb-4 shadow-[0_10px_25px_rgba(225,29,72,0.4)]">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center">
              Registrasi Gagal
            </h3>
            <p className="text-sm font-bold text-rose-500 mt-2 text-center mb-6 max-w-xs">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              Coba Lagi
            </button>
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

      {/* ============ SIDEBAR BIRU ============ */}
      <div className={`fixed md:relative z-50 h-full ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20'} bg-gradient-to-b from-blue-600 via-blue-600 to-indigo-700 shadow-2xl transition-all duration-300 ease-in-out flex flex-col shrink-0 border-r border-blue-500/30`}>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:block absolute -right-3.5 top-8 bg-white text-slate-800 rounded-full p-1.5 shadow-md hover:scale-110 hover:text-blue-600 transition-all border border-slate-100 z-50"
        >
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${!isSidebarOpen && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="h-24 flex items-center justify-center border-b border-blue-500/30 mt-2 pb-4 px-3 relative overflow-hidden">
          <div className={`flex items-center justify-start transition-all duration-300 ${isSidebarOpen ? 'w-full h-16' : 'w-12 h-12'}`}>
            <img
              src={LogoImg}
              alt="Logo IT Helpdesk"
              className={`transition-all duration-300 origin-left drop-shadow-md filter brightness-110 max-w-none ${isSidebarOpen ? 'h-full object-contain scale-[2.9] ml-2' : 'h-full object-cover scale-[2.5] ml-1.5'}`}
            />
          </div>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2.5 px-3.5 overflow-y-auto">
          <div
            onClick={() => navigate('/dashboard-admin')}
            className={`flex items-center cursor-pointer transition-all duration-300 group ${isSidebarOpen ? 'gap-3.5 px-4 py-3 rounded-xl' : 'justify-center w-12 h-12 rounded-xl mx-auto'} text-blue-100/80 hover:bg-white/10 hover:text-white`}
          >
            <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {isSidebarOpen && <span className="whitespace-nowrap text-[13px] tracking-wide uppercase font-bold">Dashboard</span>}
          </div>

          <div
            onClick={() => navigate('/profile')}
            className={`flex items-center cursor-pointer transition-all duration-300 group ${isSidebarOpen ? 'gap-3.5 px-4 py-3 rounded-xl' : 'justify-center w-12 h-12 rounded-xl mx-auto'} text-blue-100/80 hover:bg-white/10 hover:text-white`}
          >
            <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isSidebarOpen && <span className="whitespace-nowrap text-[13px] tracking-wide uppercase font-bold">Profile</span>}
          </div>

          <div
            className={`flex items-center cursor-pointer transition-all duration-300 group ${isSidebarOpen ? 'gap-3.5 px-4 py-3 rounded-xl' : 'justify-center w-12 h-12 rounded-xl mx-auto'} bg-white/20 text-white border-l-[3.5px] border-white`}
          >
            <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {isSidebarOpen && <span className="whitespace-nowrap text-[13px] tracking-wide uppercase font-bold">Tambah User</span>}
          </div>

          {/* Sign Out Button in Sidebar */}
          <div
            onClick={handleSignOut}
            className="mt-auto flex items-center gap-3.5 text-blue-100/80 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-100 group"
          >
            <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className={`whitespace-nowrap text-[13px] tracking-wide transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>SIGN OUT</span>
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
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-1 flex items-center gap-3 mb-6">

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
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-Z\s.'-]*$/.test(val)) {
                          setFormData({ ...formData, namaLengkap: val });
                        }
                      }}
                      placeholder="cth: Ariana Azzahra"
                      required
                      pattern="^[a-zA-Z\s.'\-]{2,64}$"
                      title="Gunakan 2-64 karakter huruf, spasi, titik, strip (-), atau apostrof (')"
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-2 font-semibold">
                      * 2-64 karakter huruf, spasi, titik, strip (-), atau apostrof (')
                    </p>
                  </div>

                  {/* User Name */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                      User Name *
                    </label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-Z0-9._]*$/.test(val)) {
                          setFormData({ ...formData, userName: val });
                        }
                      }}
                      placeholder="cth: Ariana.17200"
                      required
                      pattern="^[a-zA-Z0-9._]{3,64}$"
                      title="Gunakan 3-64 karakter huruf/angka, titik (.), atau underscore (_). Tanpa spasi."
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-2 font-semibold">
                      * 3-64 karakter huruf/angka, titik (.), atau underscore (_). Tanpa spasi.
                    </p>
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
                      pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                      title="Pastikan format domain komplit (cth: @gmail.com)."
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-2 font-semibold">
                      * Pastikan format domain komplit (cth: @gmail.com).
                    </p>
                  </div>

                  {/* No Telepon */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1E40AF] mb-1.5 ml-1">
                      No Telepon *
                    </label>
                    <input
                      type="tel"
                      value={formData.noTelepon}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[0-9+]*$/.test(val)) {
                          setFormData({ ...formData, noTelepon: val });
                        }
                      }}
                      placeholder="cth: 081234567890"
                      required
                      pattern="^(\+62|62|0)[0-9]{8,13}$"
                      title="Nomor HP harus diawali +62, 62, atau 0 dan diikuti 8-13 angka."
                      className="w-full bg-[#F8FAFF] border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold text-[14px] outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-2 font-semibold">
                      * Awalan +62, 62, atau 0, diikuti 8-13 angka.
                    </p>
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
                      ? "Pilih Leader *"
                      : "Pilih Staff Anggota"}
                  </h3>

                  {/* ==== KONDISI 1: Staff IT → Pilih Leader (Single Select) ==== */}
                  {formData.role === 'Staff IT' && (
                    <div className="relative">
                      <select
                        value={selectedLeaderId}
                        onChange={(e) => setSelectedLeaderId(e.target.value)}
                        disabled={leadsLoading}
                        required={formData.role === "Staff IT"}
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
                                  {s.name} ({s.roleName})
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
                    disabled={isSubmitting}
                    className={`flex-1 text-white font-black text-[15px] py-4 rounded-2xl shadow-[0_8px_25px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-2.5 ${isSubmitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-[#22c55e] hover:bg-[#16a34a] active:scale-95'}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
