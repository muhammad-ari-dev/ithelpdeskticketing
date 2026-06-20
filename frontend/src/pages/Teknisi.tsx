import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../assets/logolandscape.png';

import { useUserContext } from '../context/UserContext';

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

export default function Teknisi() {
    const navigate = useNavigate();
    const { users } = useUserContext();

    // Session dari localStorage
    const sessionRaw = localStorage.getItem('currentUser');
    const currentUser = sessionRaw ? JSON.parse(sessionRaw) : { id: 'ariana', username: 'Ariana', role: 'HEAD_IT' };

    // Ambil semua staff IT tanpa mempedulikan Head IT (agar bisa melihat teknisi kosong di head lain)
    const allTeknisiList = users.filter(u => u.roleName === 'Staff IT');

    // Ambil data tiket dari localStorage untuk mengecek status pekerjaan teknisi
    const [tickets] = useState<any[]>(() => {
        const saved = localStorage.getItem('ticketsData');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [];
    });

    // Dapatkan daftar nama teknisi yang masih memiliki task aktif
    const busyTechNames = tickets
        .filter(t => t.status !== 'Completed')
        .map(t => (t.tech || '').toLowerCase());

    // Tampilkan semua teknisi
    const teknisiList = allTeknisiList;

    // State Sidebar dan Pencarian
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Logika Items Per Page: 
    // - Jika Desktop & Sidebar Tertutup: 6
    // - Jika Desktop & Sidebar Terbuka ATAU Mobile: 4
    const isDesktop = window.innerWidth > 1024;
    const itemsPerPage = (isDesktop && !isSidebarOpen) ? 6 : 4;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // State Menu Aktif diset ke 'teknisi'
    const [activeMenu, setActiveMenu] = useState('teknisi');

    // Perhitungan Data Pagination
    const filteredList = teknisiList.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex h-screen bg-[#F0F6FF] font-sans overflow-hidden relative">

            {/* Ambient eye-comfort background glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-200/20 blur-[130px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-200/15 blur-[100px] pointer-events-none z-0"></div>

            {/* ================= OVERLAY MOBILE ================= */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* ================= SIDEBAR (Premium Cheerful Blue Style) ================= */}
            <div className={`fixed md:relative z-50 h-full ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20'} bg-gradient-to-b from-blue-600 via-blue-600 to-indigo-700 shadow-2xl transition-all duration-300 ease-in-out flex flex-col shrink-0 border-r border-blue-500/30`}>

                {/* Tombol Toggle Sidebar */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="hidden md:block absolute -right-3.5 top-8 bg-white text-slate-800 rounded-full p-1.5 shadow-md hover:scale-110 hover:text-blue-600 transition-all z-30 border border-slate-100"
                >
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${!isSidebarOpen && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Logo Area */}
                <div className="h-24 flex items-center justify-center border-b border-blue-500/30 mt-2 pb-4 px-3 overflow-hidden">
                    <div className={`flex items-center justify-start transition-all duration-300 ${isSidebarOpen ? 'w-full h-16' : 'w-12 h-12'}`}>
                        <img
                            src={LogoImg}
                            alt="Logo IT Helpdesk"
                            className={`transition-all duration-300 origin-left filter brightness-105 drop-shadow-md ${isSidebarOpen ? 'w-full h-full object-contain object-left scale-[2.9] ml-2' : 'h-full max-w-none object-cover object-left scale-[2.5] ml-1.5'}`}
                        />
                    </div>
                </div>

                {/* Menu Navigasi */}
                <div className="flex-1 py-6 flex flex-col gap-2.5 px-3.5 overflow-y-auto overflow-x-hidden">

                    {/* Menu: Dashboard */}
                    <div
                        onClick={() => navigate('/dashboard-head')}
                        className="flex items-center gap-3.5 text-blue-100/80 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-white/10 hover:text-white group"
                    >
                        <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform text-blue-200/80 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        <span className={`whitespace-nowrap text-[13px] tracking-wide uppercase transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>DASHBOARD</span>
                    </div>

                    {/* Menu Lainnya */}
                    {[
                        { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", text: "Profile", path: "/profile" },
                        { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", text: "Teknisi", path: "/teknisi", active: true },
                        { icon: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", text: "Buat Tiket", path: "/buat-tiket" },
                        { icon: "M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4-4-4-4", text: "Detail Tiket", path: "/ticket-detail" },
                        { icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", text: "Lihat Tiket", path: "/lihat-tiket" }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl cursor-pointer transition-all group ${item.active
                                ? "bg-white/20 text-white border-l-[3.5px] border-white font-bold hover:bg-white/25"
                                : "text-blue-100/80 font-semibold hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <svg className={`w-5 h-5 shrink-0 transition-transform ${item.active ? 'group-hover:scale-105' : 'group-hover:scale-105 text-blue-200/80 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                            </svg>
                            <span className={`whitespace-nowrap text-[13px] tracking-wide transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}>
                                {item.text}
                            </span>
                        </div>
                    ))}

                    {/* Sign Out Button in Sidebar */}
                    <div
                        onClick={() => {
                            localStorage.removeItem("currentUser");
                            navigate("/");
                        }}
                        className="mt-auto flex items-center gap-3.5 text-blue-100/80 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-100 group"
                    >
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
                {/* Gelombang biru di bagian bawah */}
                <BlueWave />

                {/* Navbar Top Mobile (Meresponsive) */}
                <div className="md:hidden bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm z-30 border-b border-slate-100">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-600"
                    >
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
                                {currentUser?.roleName || "Head IT"}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-blue-600/90 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                            {(currentUser?.employeeName || currentUser?.name || currentUser?.userName || currentUser?.username || "U").charAt(0).toUpperCase()}
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
                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        <h2 className="text-xl font-extrabold text-slate-800 hidden sm:block tracking-tight">
                            Daftar Teknisi
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar */}
                        <div className="bg-slate-100/50 backdrop-blur-sm rounded-full px-5 py-2 flex items-center gap-3 w-[300px] shadow-inner border border-slate-200/60 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Cari Nama Teknisi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-[13px] font-bold text-slate-700 placeholder-slate-400"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>

                        {/* User Profile */}
                        <div
                            className="flex items-center gap-3 bg-white hover:bg-blue-50/50 py-1.5 px-3 rounded-full border border-slate-200/80 cursor-pointer shadow-sm hover:shadow transition-all duration-300"
                            onClick={() => navigate('/profile')}
                            title="Profile"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-slate-500 font-bold text-xs leading-none">
                                    {currentUser?.userName || currentUser?.username}
                                </p>
                                <p className="text-blue-500 text-[10px] font-bold mt-1 leading-none">
                                    {currentUser?.roleName || "Head IT"}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-blue-600/90 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                                {(currentUser?.employeeName || currentUser?.name || currentUser?.userName || currentUser?.username || "U").charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- GRID TEKNISI --- */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-8 md:pt-12 custom-scrollbar">
                    {/* LOGIKA GRID:
                        - lg:grid-cols-2 (Saat Sidebar terbuka/layar medium)
                        - xl:grid-cols-3 (Saat Sidebar tertutup/layar lebar, akan jadi 3 kolom)
                    */}
                    <div className={`grid gap-x-8 gap-y-20 mx-auto transition-all duration-300
                        ${isSidebarOpen ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'} 
                        max-w-[1300px]`}>

                        {(() => {
                            if (filteredList.length === 0) {
                                return (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                        <svg className="w-24 h-24 text-blue-200 mb-6 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <h3 className="text-2xl font-black text-slate-700 tracking-tight">Semua Teknisi Sedang Sibuk</h3>
                                        <p className="text-[15px] font-bold text-slate-400 mt-2">Tidak ada teknisi IT yang tersedia (nganggur) di bawah pengawasan Anda saat ini.</p>
                                    </div>
                                );
                            }

                            return paginatedList.map((tech) => (
                                <div key={tech.id} className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 pt-16 shadow-[0_15px_35px_rgba(15,23,42,0.04)] border border-slate-100 hover:shadow-[0_20px_45px_rgba(30,58,138,0.08)] transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between min-h-[220px]">

                                    {/* Foto Profil Melayang */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-[5px] border-white shadow-[0_10px_25px_rgba(15,23,42,0.08)] overflow-hidden bg-slate-100 z-10 transition-transform duration-500 group-hover:scale-105 group-hover:border-blue-50/50">
                                        <img src={tech.avatar} alt={tech.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Label Status Penugasan */}
                                    <div className="absolute top-4 right-4 z-20">
                                        {busyTechNames.includes(tech.name.toLowerCase()) ? (
                                            <span className="bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Dalam Penugasan
                                            </span>
                                        ) : (
                                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                Tersedia
                                            </span>
                                        )}
                                    </div>

                                    {/* Konten Kartu */}
                                    <div className="flex flex-col gap-3.5 text-[13px] font-bold text-slate-750 px-2 mt-2">
                                        <div className="flex items-center">
                                            <span className="w-20 shrink-0 text-slate-400 tracking-wider text-[11px] uppercase">Nama</span>
                                            <span className="mr-2.5 text-slate-300">:</span>
                                            <span className="text-slate-800 text-[14px] font-extrabold truncate">{tech.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-20 shrink-0 text-slate-400 tracking-wider text-[11px] uppercase">No WA</span>
                                            <span className="mr-2.5 text-slate-300">:</span>
                                            <span className="text-slate-800 text-[14px] font-extrabold">{tech.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-20 shrink-0 text-slate-400 tracking-wider text-[11px] uppercase">Status</span>
                                            <span className="mr-2.5 text-slate-300">:</span>
                                            <span className={`px-4 py-1 rounded-full text-white text-[10px] font-black tracking-widest uppercase shadow-sm
                                                ${tech.status === 'Non Aktif' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            >
                                                {tech.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <span className="w-20 shrink-0 text-slate-400 tracking-wider text-[11px] uppercase">Head IT</span>
                                            <span className="mr-2.5 text-slate-300">:</span>
                                            <span className="text-blue-600 text-[13px] font-extrabold truncate bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                {users.find(u => u.id === tech.leaderId)?.name || 'Tidak ada'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Call to action (WhatsApp link) */}
                                    <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
                                        <a
                                            href={`https://wa.me/${tech.phone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-all group/btn"
                                        >
                                            <span>Hubungi Teknisi</span>
                                            <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>

                    {/* --- PAGINATION --- */}
                    {totalPages > 1 && (
                        <div className="mt-16 flex justify-center pb-4">
                            <div className="bg-slate-200/50 backdrop-blur-sm rounded-full flex flex-wrap justify-center items-center px-3 py-1.5 gap-2 shadow-inner border border-slate-200/40">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 text-slate-450 hover:text-black font-bold transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm transition-colors ${currentPage === page ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:bg-white/60'}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 text-slate-450 hover:text-black font-bold transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}