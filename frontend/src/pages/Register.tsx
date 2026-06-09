import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../assets/logolandscape.png';
import axios from 'axios'; // 1. IMPORT AXIOS
import RegisterAsset from '../assets/assetregister.png';
import { type UserRole } from '../types';

export default function Register() {
    const navigate = useNavigate();

    // ================= STATE FORM =================
    const [username, setUsername] = useState('Ariana.17200');
    const [email, setEmail] = useState('Ariana@gmail.com');
    const [phone, setPhone] = useState('087889909110');
    const [role, setRole] = useState<UserRole>('HEAD_IT');
    const [password, setPassword] = useState('12345678');
    const [confirmPassword, setConfirmPassword] = useState('12345678');


    // ================= STATE UI =================
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // ================= HANDLE REGISTER =================
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Simpan data akun baru ke memori browser (Local Storage)
        const newAccount = {
            username: username,
            password: password,
            role: role
        };
        localStorage.setItem('registeredUser', JSON.stringify(newAccount));

        // 2. Munculkan Pop Up Sukses
        setShowSuccessPopup(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
            navigate('/login');
        }, 2500);
    };

    // ================= ICON EYE =================
    const EyeIcon = ({ isVisible, onClick }: { isVisible: boolean; onClick: () => void; }) => (
        <button type="button" onClick={onClick} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition duration-300">
            {isVisible ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243 M9.878 9.878l4.242 4.242 M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29 M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
            )}
        </button>
    );

    return (
        <div className="min-h-screen w-full bg-[#F3F8FC] relative overflow-hidden flex items-center justify-center font-sans p-4">

            {/* Ambient Eye-Comfort Background Glows */}
            <div className="absolute top-[-25%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-100/30 blur-[130px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-indigo-100/20 blur-[110px] pointer-events-none z-0"></div>

            {/* ================= GENTLE BLUE WAVE BACKGROUND ================= */}
            <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none opacity-95">
                <svg viewBox="0 0 1440 320" className="w-full h-[15vh] min-h-[420px]" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="waveGradReg" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.9" />
                        </linearGradient>
                        <filter id="waveShadowReg">
                            <feDropShadow dx="0" dy="-8" stdDeviation="15" floodColor="#3B82F6" floodOpacity="0.15" />
                        </filter>
                    </defs>
                    <path fill="url(#waveGradReg)" filter="url(#waveShadowReg)" d="M0,220 C240,320 480,120 720,210 C960,300 1180,100 1440,230 L1440,320 L0,320 Z"/>
                </svg>
            </div>

            {/* ================= MAIN CONTAINER ================= */}
            <div className="relative z-10 w-full max-w-[1120px] flex flex-col lg:flex-row items-center justify-between gap-6 h-full max-h-[760px]">

                {/* === LEFT AREA (ILUSTRASI) === */}
                <div className="hidden lg:flex w-1/2 flex-col items-center justify-center text-center h-full animate-slide-right">
                    <div className="mb-6 cursor-pointer hover:scale-[1.02] transition-transform duration-300" onClick={() => navigate('/')}>
                        <img src={LogoImg} alt="Logo" className="w-[130px] object-contain" />
                    </div>

                    <h1 className="text-[34px] xl:text-[42px] font-extrabold text-slate-800 leading-tight tracking-tight mb-8">
                        <div>Satu Platform,</div>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                            Semua Solusi IT
                        </div>
                    </h1>

                    <img src={RegisterAsset} alt="Register Illustration" className="w-[70%] max-w-[340px] object-contain drop-shadow-[0_20px_40px_rgba(30,58,138,0.08)] hover:scale-[1.02] transition-all duration-700" />
                </div>

                {/* === RIGHT AREA (FORM CARD) === */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center h-full animate-fade-in">
                    <h2 className="text-[32px] font-extrabold text-slate-800 mb-5 tracking-tight">Daftar Akun</h2>

                    <div className="w-full max-w-[440px] bg-white/75 backdrop-blur-2xl rounded-[32px] border border-white/80 shadow-[0_20px_50px_rgba(30,58,138,0.05)] px-6 py-6 md:px-8 md:py-8 relative">

                        {/* ================= SUCCESS POP UP MODAL ================= */}
                        {showSuccessPopup && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-[32px] animate-scale-up">
                                <div className="p-6 flex flex-col items-center border border-slate-50 w-[90%]">
                                    <div className="w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center mb-4 shadow-[0_8px_20px_rgba(34,197,94,0.3)]">
                                        <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 text-center tracking-tight">Daftar Berhasil</h3>
                                    <p className="text-sm font-medium text-slate-500 text-center mt-2">Menyimpan akun baru Anda...</p>
                                </div>
                            </div>
                        )}

                        {/* FORM UTAMA */}
                        <form onSubmit={handleRegister} className="space-y-3.5">
                            {/* Input: Username */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-3">User Name*</label>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                                       className="w-full h-[44px] px-4 rounded-full border border-slate-200/80 bg-white/80 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 shadow-sm" />
                            </div>

                            {/* Input: Email */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-3">Alamat Email*</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                       className="w-full h-[44px] px-4 rounded-full border border-slate-200/80 bg-white/80 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 shadow-sm" />
                            </div>

                            {/* Input: Phone */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-3">No Telepon*</label>
                                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required
                                       className="w-full h-[44px] px-4 rounded-full border border-slate-200/80 bg-white/80 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 shadow-sm" />
                            </div>

                            {/* Input: Role */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-3">Role Pekerjaan*</label>
                                <div className="relative">
                                    <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                                            className="w-full h-[44px] px-4 rounded-full border border-slate-200/80 bg-white/80 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 shadow-sm cursor-pointer appearance-none">
                                        <option value="HEAD_IT">Head IT</option>
                                        <option value="STAFF_IT_LEADER">Staff IT Leader</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                    <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            {/* Input: Password & Confirm Password in Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-3">Password*</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                                               className="w-full h-[44px] px-4 rounded-full border border-slate-200/80 bg-white/80 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 shadow-sm pr-10" />
                                        <EyeIcon isVisible={showPassword} onClick={() => setShowPassword(!showPassword)} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-3">Konfirmasi*</label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                                               className="w-full h-[44px] px-4 rounded-full border border-slate-200/80 bg-white/80 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 shadow-sm pr-10" />
                                        <EyeIcon isVisible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                                    </div>
                                </div>
                            </div>

                            {/* Register Button */}
                            <button type="submit" className="w-full h-[46px] mt-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all duration-300 active:scale-[0.98]">
                                Buat Akun Baru
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="flex justify-center mt-6 pt-4 border-t border-slate-100">
                            <span className="text-[12px] font-medium text-slate-400 mr-1.5">Sudah punya akun?</span>
                            <button onClick={() => navigate('/login')} className="text-blue-600 font-bold text-[13px] hover:text-blue-800 transition duration-300">
                                Masuk Disini
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}