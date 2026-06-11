import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import LogoImg from "../assets/logolandscape.png";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
        setError("Token tidak valid atau tidak ditemukan!");
        return;
    }

    // 1. Validasi Panjang Karakter (Minimal 8)
    if (password.length < 8) {
        setError("Password minimal harus 8 karakter!");
        return;
    }

    // 2. Validasi Huruf Besar
    if (!/[A-Z]/.test(password)) {
        setError("Password harus mengandung setidaknya 1 huruf besar (A-Z)!");
        return;
    }

    // 3. Validasi Angka
    if (!/\d/.test(password)) {
        setError("Password harus mengandung setidaknya 1 angka (0-9)!");
        return;
    }

    if (password !== confirmPassword) {
        setError("Konfirmasi password tidak cocok!");
        return;
    }

    setIsSubmitting(true);
    try {
      await authApi.setPassword({
        magicToken: token,
        newPassword: password,
        confirmPassword: confirmPassword,
      });
      setShowSuccessPopup(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data || "Gagal mengatur password baru!");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center px-4 font-sans bg-[#F0F6FF]">
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
                        Password Telah Diperbarui!
                    </h3>
                    <p className="text-sm font-bold text-slate-500 mt-2 text-center mb-6 max-w-[250px]">
                        Akun Anda sudah aktif. Anda akan dialihkan secara otomatis...
                    </p>
                    <button 
                        onClick={() => navigate("/")}
                        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                    >
                        Lanjutkan ke Halaman Utama
                    </button>
                </div>
            </div>
        )}

        {/* Ambient blobs - Simple & Professional */}
        <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-200/20 blur-[130px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-indigo-200/15 blur-[100px] pointer-events-none z-0" />

        {/* ================= KOMPONEN GELOMBANG BIRU (SIMPLE WAVE) ================= */}
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

        {/* LOGO */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
            <img src={LogoImg} alt="Logo" className="w-[120px] object-contain drop-shadow-sm" />
        </div>

        {/* MAIN CARD */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 relative z-10 animate-fade-in">
            {/* ICON HEADER */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Set Password Baru</h2>
            <p className="text-sm text-slate-500 text-center mb-6">
                Silakan buat password baru Anda untuk mengaktifkan akun. Pastikan password Anda kuat dan aman.
            </p>

            {/* ERROR ALERT */}
            {error && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 text-center font-medium">
                    {error}
                </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password Baru</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting || showSuccessPopup}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none disabled:opacity-50 pr-12"
                            placeholder="Minimal 8 karakter"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3B82F6] p-1 transition-colors"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.97 9.97 0 013.29-1.563M21.543 12c-1.274-4.057-5.064-7-9.542-7-1.636 0-3.19.39-4.57 1.077" /></svg>
                            )}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Konfirmasi Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSubmitting || showSuccessPopup}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none disabled:opacity-50 pr-12"
                            placeholder="Ulangi password baru"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3B82F6] p-1 transition-colors"
                        >
                            {showConfirmPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.97 9.97 0 013.29-1.563M21.543 12c-1.274-4.057-5.064-7-9.542-7-1.636 0-3.19.39-4.57 1.077" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || showSuccessPopup}
                    className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold transition-all ${
                        showSuccessPopup 
                        ? 'bg-emerald-500' 
                        : (isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200')
                    }`}
                >
                    {showSuccessPopup ? 'Berhasil Diperbarui' : (isSubmitting ? 'Memproses...' : 'Aktifkan Akun & Simpan')}
                </button>
            </form>
        </div>
    </div>
  );
}
