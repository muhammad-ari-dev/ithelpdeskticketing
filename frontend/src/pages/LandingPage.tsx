import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../assets/logolandscape.png';
import TechImg from '../assets/assetdashboard.png';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    const handleNavigation = (path: string) => {
        setIsExiting(true);
        setTimeout(() => {
            navigate(path);
        }, 350); // Delay for exit animation
    };

    return (
        // Menggunakan h-screen dan overflow-hidden agar 100% terkunci dalam 1 layar tanpa scroll
        <div className={`h-screen w-full bg-gradient-to-tr from-slate-50 via-[#F3F8FC] to-blue-50/40 overflow-hidden relative font-sans flex flex-col transition-all duration-500 ${isExiting ? 'scale-110 opacity-0 blur-sm' : 'scale-100 opacity-100 blur-0'}`}>

            {/* ===== CUSTOM ANIMATION STYLES ===== */}
            <style>
                {`
                    /* Animasi Mengapung (Float) untuk Gambar */
                    @keyframes floatAnim {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    .animate-float-custom {
                        animation: floatAnim 5s ease-in-out infinite;
                    }

                    /* Animasi Gelombang Berjalan */
                    @keyframes waveAnim {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-wave-slow {
                        animation: waveAnim 20s linear infinite;
                    }
                    .animate-wave-fast {
                        animation: waveAnim 12s linear infinite;
                    }
                `}
            </style>

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#3B82F6]/10 blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none z-0"></div>

            {/* ===== MOVING WAVES & STATIC FRONT WAVE ===== */}
            <div className="absolute top-0 left-0 w-full h-[45vh] max-h-[480px] min-h-[350px] overflow-hidden pointer-events-none z-0">

                {/* Lapis 1: Gelombang Belakang (Biru Paling Muda, Gerak Lambat) */}
                <svg className="absolute top-0 left-0 w-[200%] h-full animate-wave-slow opacity-70" viewBox="0 0 2880 600" preserveAspectRatio="none">
                    <path d="M0,420 C480,580 960,260 1440,420 C1920,580 2400,260 2880,420 L2880,0 L0,0 Z" fill="#93C5FD" />
                </svg>

                {/* Lapis 2: Gelombang Tengah (Biru Sedang, Gerak Cepat) */}
                <svg className="absolute top-0 left-0 w-[200%] h-full animate-wave-fast opacity-60" viewBox="0 0 2880 600" preserveAspectRatio="none">
                    <path d="M0,380 C480,220 960,520 1440,380 C1920,220 2400,520 2880,380 L2880,0 L0,0 Z" fill="#60A5FA" />
                </svg>

                {/* Lapis 3: Gelombang Depan Statis & Animasi Teks Mengikuti Kurva */}
                <svg
                    viewBox="0 0 1440 500"
                    className="absolute top-0 left-0 w-full h-full opacity-100 drop-shadow-[0_15px_30px_rgba(59,130,246,0.15)]"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="mainBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2563EB" />
                            <stop offset="50%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#1E40AF" />
                        </linearGradient>
                    </defs>

                    {/* Bentuk Gelombang Utama (Melengkung Natural ke Bawah) - Dibuat lebih tinggi agar gelombang belakang terlihat */}
                    <path
                        d="M0,340 Q300,220 720,300 Q1100,380 1440,240 L1440,0 L0,0 Z"
                        fill="url(#mainBlueGrad)"
                    />

                    {/* Jalur (Path) Khusus untuk Teks. Persis di garis batas Lapis 3 (Y terbalik dari background). */}
                    <path id="curve" d="M0,340 Q300,220 720,300 Q1100,380 1440,240" fill="none" />

                    {/* Teks Melengkung Bergerak (SVG SMIL Animation) */}
                    <text fill="#FFFFFF" fontSize="24" fontWeight="1000" letterSpacing="1.8" className="font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                        <textPath href="#curve" startOffset="100%" dy="-12">
                            Kelola setiap kendala IT dengan lebih cepat melalui sistem ticketing
                            {/* Animasi startOffset: Mulai dari ujung kanan (100%) hilang ke ujung kiri (-60%) */}
                            <animate
                                attributeName="startOffset"
                                from="100%"
                                to="-60%"
                                begin="0s"
                                dur="20s"
                                repeatCount="indefinite"
                            />
                        </textPath>
                    </text>
                </svg>
            </div>

            {/* ===== NAVBAR (Float Glassmorphism) ===== */}
            <nav className="relative z-50 flex items-center justify-between px-6 md:px-16 py-5 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700 mt-4 md:mt-2">
                <div className="flex items-center hover:scale-[1.02] transition-transform duration-300">
                    <img
                        src={LogoImg}
                        alt="Logo"
                        className="w-[120px] md:w-[140px] object-contain drop-shadow-sm"
                    />
                </div>

                <div className="hidden md:flex items-center gap-2 bg-white/40 backdrop-blur-lg px-3 py-1.5 rounded-full shadow-[0_8px_30px_rgba(59,130,246,0.08)] border border-white/60">
                    {[
                        { name: 'Dashboard', path: '/login' },
                        { name: 'Buat Tiket', path: '/login' },
                        { name: 'Detail Tiket', path: '/login' }
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleNavigation(item.path)}
                            className="px-6 py-2 rounded-full text-slate-800 hover:text-[#3B82F6] font-extrabold text-[14px] transition-all duration-300 hover:bg-white/70"
                        >
                            {item.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleNavigation('/login')}
                        className="bg-white/95 backdrop-blur-md px-8 py-2.5 rounded-full text-[#3B82F6] hover:text-blue-800 font-black text-[14px] shadow-[0_8px_20px_rgba(59,130,246,0.15)] border border-white hover:bg-blue-50 hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                        Sign In
                    </button>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="relative flex-1 flex items-center md:items-end justify-between w-full overflow-hidden z-10 px-6 md:px-12 lg:px-20 pb-0 md:pb-[5vh]">

                {/* Technician Image Illustration dengan Animasi Mengapung (Float) */}
                <div className="absolute md:relative bottom-[-20px] md:bottom-0 left-[-20px] md:left-0 z-10 animate-float-custom pointer-events-none w-[60%] md:w-1/2 flex items-end h-full">
                    <img
                        src={TechImg}
                        alt="Technician Illustration"
                        className="
                            w-full
                            max-h-[70vh] md:max-h-[85vh]
                            object-contain object-bottom
                            drop-shadow-[0_25px_50px_rgba(59,130,246,0.2)]
                        "
                    />
                </div>

                {/* Beautiful Soft-Text on the Right */}
                <div className="relative z-20 w-full md:w-1/2 flex flex-col justify-center items-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 pb-10 md:pb-20">
                    <header className="text-right">

                        <div className="text-slate-800/90 italic font-black text-[40px] md:text-[54px] lg:text-[68px] leading-[1.1] tracking-[-1px]">
                            Smart
                        </div>

                        <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent drop-shadow-sm font-extrabold text-[40px] md:text-[54px] lg:text-[68px] leading-[1.1] tracking-[-1.5px]">
                            Ticketing, Better
                        </div>

                        <div className="text-slate-800/90 italic font-black text-[40px] md:text-[54px] lg:text-[68px] leading-[1.1] tracking-[-1px]">
                            Service
                        </div>

                    </header>
                </div>
            </section>

        </div>
    );
}