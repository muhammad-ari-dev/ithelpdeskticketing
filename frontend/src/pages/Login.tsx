import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LogoImg from "../assets/logolandscape.png";
import LoginAsset from "../assets/assetlogin.png";
import { authApi } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  // ================= STATE =================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // === STATE UNTUK ERROR POP UP ===
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ================= HANDLE LOGIN =================
  // ================= HANDLE LOGIN (VERSI API BACKEND) =================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Tembak API Backend lewat Kurir
      const response = await authApi.login({
        userName: username,
        password: password,
      });

      // Response structure: response.data contains the actual payload
      const userData = response.data;

      // 2. Simpan data user asli dari BE ke localStorage
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: userData.id,
          name: userData.nama,
          userName: userData.username,
          email: userData.email,
          role: userData.role?.roleName, // "ADMINISTRATOR", "LEAD", "EMPLOYEE"
          role_desc: userData.role_desc,
          token: userData.token, // Menyimpan token JWT
          created_at: userData.created_at
        }),
      );

      // 3. Tentukan redirect berdasarkan role dari BE
      let targetRoute = "/dashboard-staff"; // default EMPLOYEE
      const roleName = userData.role?.roleName;
      if (roleName === "ADMINISTRATOR") {
        targetRoute = "/dashboard-admin";
      } else if (roleName === "LEAD") {
        targetRoute = "/dashboard";
      }

      // 4. Tampilkan popup sukses lalu navigasi
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate(targetRoute);
      }, 2800);
    } catch (error: unknown) {
      const err = error as { response?: { data?: string } };
      const errorMsg =
        err.response?.data || "Gagal terhubung ke server Backend!";
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  }; // <== TAMBAHIN INI CUY! WAJIB BANGET BIAR FUNGSINYA SELESAI

  // ================= ICON EYE (TOMBOL LIHAT PASSWORD) =================

  // ================= ICON EYE (TOMBOL LIHAT PASSWORD) =================
  const EyeIcon = ({
    isVisible,
    onClick,
  }: {
    isVisible: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition duration-300"
    >
      {isVisible ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5 c4.478 0 8.268 2.943 9.542 7 -1.274 4.057-5.064 7-9.542 7 -4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.875 18.825A10.05 10.05 0 0112 19 c-4.478 0-8.268-2.943-9.543-7 a9.97 9.97 0 011.563-3.029 m5.858.908a3 3 0 114.243 4.243 M9.878 9.878l4.242 4.242 M9.88 9.88l-3.29-3.29 m7.532 7.532l3.29 3.29 M3 3l3.59 3.59 m0 0A9.953 9.953 0 0112 5 c4.478 0 8.268 2.943 9.543 7 a10.025 10.025 0 01-4.132 5.411 m0 0L21 21"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center px-6 font-sans bg-[#F3F8FC]">
      {/* ================= FLUID WAVE TRANSITION ================= */}
      <div className="fixed top-0 left-0 w-[150vw] h-screen z-[100] pointer-events-none flex animate-wave-sweep">
        <div className="w-[100vw] h-full bg-[#2563EB]"></div>
        <svg
          viewBox="0 0 500 1000"
          className="h-full w-[50vw] text-[#2563EB] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C 500,250 -200,750 500,1000 L0,1000 Z" />
        </svg>
      </div>

      {/* Soft Ambient Background Elements - Eye Comfort */}
      <div className="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-100/40 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-100/30 blur-[100px] pointer-events-none z-0"></div>

      {/* ================= GENTLE BLUE WAVE BACKGROUND ================= */}
      <div className="absolute bottom-0 left-0 w-[200%] z-0 pointer-events-none opacity-95 animate-wave">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-[240px] md:h-[280px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.9" />
            </linearGradient>
            <filter id="waveShadow">
              <feDropShadow
                dx="0"
                dy="-8"
                stdDeviation="15"
                floodColor="#3B82F6"
                floodOpacity="0.15"
              />
            </filter>
          </defs>
          <path
            fill="url(#waveGrad)"
            filter="url(#waveShadow)"
            d="M0,220 C240,320 480,120 720,210 C960,300 1180,160 1440,230 L1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* ================= LOGO ================= */}
      <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
        <div
          className="cursor-pointer hover:scale-[1.02] transition-transform duration-300"
          onClick={() => navigate("/")}
        >
          <img src={LogoImg} alt="Logo" className="w-[125px] object-contain" />
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="relative z-10 w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
        {/* ================= LEFT SECTION (TECH ILLUSTRATION) ================== */}
        <div className="hidden lg:flex w-1/2 items-end justify-center relative pt-8 animate-slide-right">
          <img
            src={LoginAsset}
            alt="IT Support Illustration"
            className="w-[85%] max-w-[580px] object-contain drop-shadow-[0_20px_40px_rgba(30,58,138,0.08)] hover:scale-[1.01] transition-all duration-700 ease-in-out animate-float"
          />
        </div>

        {/* ================= RIGHT SECTION (LOGIN CARD) ================= */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center animate-fade-in">
          <h1
            className="text-[38px] md:text-[46px] font-extrabold text-slate-800 tracking-tight mb-6 text-center opacity-0 animate-slide-up-fade"
            style={{ animationDelay: "0.1s" }}
          >
            Selamat Datang
          </h1>

          <div className="w-full max-w-[435px] bg-white/75 backdrop-blur-2xl rounded-[32px] border border-white/80 shadow-[0_20px_50px_rgba(30,58,138,0.05)] px-8 py-8 md:px-10 md:py-10 relative">
            {/* ================= SUCCESS POP UP (REMOVED DARI KARTU) ================= */}

            {/* ================= ERROR POP UP ================= */}
            {showErrorPopup && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-[32px] animate-scale-up">
                <div className="p-6 flex flex-col items-center w-[95%] relative">
                  <button
                    onClick={() => setShowErrorPopup(false)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 p-2 rounded-full transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mb-4 shadow-[0_8px_20px_rgba(239,68,68,0.25)]">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 text-center tracking-tight">
                    Login Gagal
                  </h3>
                  <p className="text-sm font-semibold text-rose-500 text-center mt-2 px-2 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* USERNAME */}
              <div
                className="opacity-0 animate-slide-up-fade"
                style={{ animationDelay: "0.2s" }}
              >
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-3">
                  User Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Masukkan nama pengguna"
                    className="w-full h-[52px] px-5 rounded-full border border-slate-200/80 bg-white/80 text-[14px] text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div
                className="opacity-0 animate-slide-up-fade"
                style={{ animationDelay: "0.3s" }}
              >
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-[52px] px-5 rounded-full border border-slate-200/80 bg-white/80 text-[14px] text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 shadow-sm pr-14"
                  />
                  <EyeIcon
                    isVisible={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              {/* REMEMBER ME CHECKBOX */}
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2.5 ml-3 cursor-pointer select-none group w-fit opacity-0 animate-slide-up-fade"
                style={{ animationDelay: "0.4s" }}
              >
                <div
                  className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all duration-300 ${rememberMe ? "bg-blue-600 border-blue-600 shadow-sm" : "border-slate-300 group-hover:border-blue-400"}`}
                >
                  {rememberMe && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
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
                  )}
                </div>
                <span className="text-[13px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                  Ingat saya
                </span>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="opacity-0 animate-slide-up-fade w-full h-[52px] mt-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[16px] font-bold shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-[0.98]"
                style={{ animationDelay: "0.5s" }}
              >
                Log In
              </button>
            </form>

            {/* ================= FOOTER ================= */}
            <div
              className="mt-8 pt-5 border-t border-slate-100 opacity-0 animate-slide-up-fade"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="flex justify-between items-center">
                <button className="text-left text-[13px] font-semibold text-slate-400 hover:text-blue-600 transition-colors duration-300">
                  Lupa sandi?
                </button>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-slate-400">
                    IT Helpdesk System
                  </span>
                </div>
              </div>
              {/* Info: Pendaftaran hanya via Admin */}
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5 flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 text-blue-400 shrink-0 mt-0.5"
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
                <p className="text-[11px] font-semibold text-blue-500 leading-relaxed">
                  Pendaftaran akun dilakukan oleh <strong>Abang Hakimmmm</strong>.
                  Hubungi Admin IT Anda jika belum memiliki akun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FULLSCREEN 3D LOGO TRANSITION ================= */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.5, rotateY: -90, opacity: 0 }}
              animate={{
                scale: [0.5, 1.2, 1],
                rotateY: [-90, 0, 360, 360],
                opacity: [0, 1, 1, 1],
              }}
              transition={{
                duration: 2.2,
                ease: "easeInOut",
                times: [0, 0.4, 0.8, 1],
              }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                {/* Glow behind logo */}
                <div className="absolute inset-0 bg-blue-400 blur-[60px] opacity-20 rounded-full"></div>
                <img
                  src={LogoImg}
                  alt="Company Logo"
                  className="w-[220px] md:w-[280px] object-contain relative z-10 drop-shadow-2xl"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-10 flex flex-col items-center"
              >
                <div className="flex gap-2 mb-3">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-blue-600"
                  ></motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-blue-500"
                  ></motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  ></motion.div>
                </div>
                <h3 className="text-[16px] font-bold text-blue-900 tracking-widest uppercase">
                  Mengautentikasi...
                </h3>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
