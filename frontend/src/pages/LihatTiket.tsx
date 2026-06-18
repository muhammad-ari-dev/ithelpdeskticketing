import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDynamicPriority, getPriorityBadgeStyle, getPriorityWeight } from '../utils/ticketUtils';


export default function LihatTiket() {
    const navigate = useNavigate();

    // ================= STATE DATA & FILTER =================

    const [tickets, setTickets] = useState<any[]>(() => {
        // Ambil data yang disimpan oleh halaman Buat Tiket
        const savedTickets = localStorage.getItem('ticketsData');
        if (savedTickets) {
            try {
                let parsed = JSON.parse(savedTickets);
                // MIGRATION: Update old statuses to match new flow
                let migrated = false;
                parsed = parsed.map((t: any) => {
                    if (t.status === 'On Checking') { migrated = true; return { ...t, status: 'Assigned' }; }
                    if (t.status === 'Recheck') { migrated = true; return { ...t, status: 'On Check' }; }
                    return t;
                });
                if (migrated) {
                    localStorage.setItem('ticketsData', JSON.stringify(parsed));
                }
                return parsed.sort((a: any, b: any) => Number(a.id) - Number(b.id));
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [filterTech, setFilterTech] = useState('');
    const [filterPriority, setFilterPriority] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // ================= HANDLER UPDATE INLINE =================
    // Dropdown dihilangkan untuk memastikan semua logika poin (SLA) 
    // dieksekusi secara benar di dalam DetailTiket.tsx

    // ================= LOGIKA FILTER TANGGAL TIMESTAMPS =================
    const getTicketTime = (dateString: string) => {
        const [day, month, year] = dateString.split('/');
        return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0).getTime();
    };

    const getInputTime = (dateString: string, isEnd: boolean = false) => {
        const [year, month, day] = dateString.split('-');
        const hour = isEnd ? 23 : 0;
        const min = isEnd ? 59 : 0;
        return new Date(Number(year), Number(month) - 1, Number(day), hour, min, 59).getTime();
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchTech = filterTech.trim().length < 3 || ticket.tech.toLowerCase().includes(filterTech.trim().toLowerCase());
        const dynamicPriority = calculateDynamicPriority(ticket.date, ticket.status, ticket.completedAt, ticket.reopenCount > 0);
        const matchPriority = filterPriority === 'All' || (dynamicPriority.toUpperCase() === filterPriority.toUpperCase());
        const matchStatus = filterStatus === 'All' || ticket.status === filterStatus;

        let matchDate = true;
        if (startDate || endDate) {
            const ticketTime = getTicketTime(ticket.date);
            if (startDate) {
                const startTime = getInputTime(startDate, false);
                if (ticketTime < startTime) matchDate = false;
            }
            if (endDate) {
                const endTime = getInputTime(endDate, true);
                if (ticketTime > endTime) matchDate = false;
            }
        }
        return matchTech && matchPriority && matchStatus && matchDate;
    }).sort((a, b) => getPriorityWeight(calculateDynamicPriority(b.date, b.status, b.completedAt, b.reopenCount > 0), b.status) - getPriorityWeight(calculateDynamicPriority(a.date, a.status, a.completedAt, a.reopenCount > 0), a.status));

    // ================= STYLE HANDLERS =================
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-[#22c55e] border-emerald-200';
            case 'Reopen': return 'bg-amber-50 text-[#f59e0b] border-amber-200';
            case 'In Progress': return 'bg-blue-50 text-[#3b82f6] border-blue-200';
            case 'Assigned': return 'bg-rose-50 text-[#ef4444] border-rose-200';
            case 'On Check': return 'bg-purple-50 text-purple-600 border-purple-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans relative overflow-hidden">

            {/* ================= BLUE HEADER BLOCK (Tabs & Stats) ================= */}
            <div className="w-full max-w-[1100px] bg-[#3B82F6] rounded-[32px] shadow-[0_15px_30px_rgba(59,130,246,0.3)] flex flex-col px-8 py-5 mb-6 z-10">
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-blue-400/50 pb-5 mb-5 gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 md:ml-2">
                        <button onClick={() => navigate('/buat-tiket')} className="text-white hover:text-blue-200 font-bold text-[14px] md:text-[15px] transition-colors">Buat Tiket</button>
                        <button onClick={() => navigate('/ticket-detail')} className="text-white hover:text-blue-200 font-bold text-[14px] md:text-[15px] transition-colors">Detail Tiket</button>
                        <div className="bg-white px-6 py-1.5 rounded-full shadow-sm">
                            <span className="text-[#1E40AF] font-black text-[14px] md:text-[15px] tracking-wide">Lihat Tiket</span>
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard-head')} className="flex items-center gap-2 bg-blue-800/40 hover:bg-blue-800/80 px-4 py-1.5 rounded-full transition-colors border-2 border-blue-900/50 shrink-0">
                        <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                        <span className="text-white font-black text-[11px] tracking-wider uppercase">Home</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Waiting', count: tickets.filter(t => t.status === 'Assigned').length || 1, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Reopen', count: tickets.filter(t => t.status === 'Reopen').length, icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                        { label: 'In Progress', count: tickets.filter(t => t.status === 'In Progress').length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Complete', count: tickets.filter(t => t.status === 'Completed').length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                        { label: 'Total Tasks', count: tickets.length, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl py-2 px-3 flex items-center gap-2 shadow-md">
                            <div className="bg-slate-100 p-1.5 rounded-full shrink-0">
                                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[10px] font-extrabold text-blue-900 leading-none truncate">{stat.label}</span>
                                <span className="text-[14px] md:text-[16px] font-black text-slate-800 leading-tight">{stat.count}</span>
                            </div>
                        </div>
                    ))}
                    <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 px-3 py-2.5 rounded-2xl shadow-md border border-slate-100 col-span-2 md:col-span-1">
                        <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                        <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest">PDF</span>
                    </button>
                </div>
            </div>

            {/* ================= MAIN CONTENT AREA ================= */}
            <div className="w-full max-w-[1100px] flex flex-col gap-4">

                {/* --- CONTROLLER: TOMBOL SHOW/HIDE FILTER --- */}
                <div className="flex justify-end px-2">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-black transition-all shadow-md border active:scale-95
                        ${isFilterOpen ? 'bg-slate-800 text-white border-transparent' : 'bg-white text-blue-900 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span>{isFilterOpen ? 'Sembunyikan Panel Filter' : 'Buka Panel Filter / Pencarian'}</span>
                    </button>
                </div>

                {/* --- COLLAPSIBLE FILTER PANEL --- */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white shadow-xl border border-slate-100 rounded-[28px]
                    ${isFilterOpen ? 'max-h-[500px] p-6 opacity-100 mb-2' : 'max-h-0 p-0 opacity-0 border-transparent'}`}>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                        <div className="flex flex-col">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Nama Teknisi</label>
                            <div className="bg-slate-50 rounded-full border border-slate-200 px-4 py-2 flex items-center relative focus-within:border-blue-400">
                                <input 
                                    type="text"
                                    value={filterTech} 
                                    onChange={(e) => setFilterTech(e.target.value)} 
                                    placeholder="Cari teknisi (min 3 huruf)..."
                                    className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none z-10 placeholder-slate-400"
                                />
                                <svg className="w-4 h-4 text-slate-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Priority</label>
                            <div className="bg-slate-50 rounded-full border border-slate-200 px-4 py-2 flex items-center relative focus-within:border-blue-400">
                                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer z-10">
                                    <option value="All">All Priority</option><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option>
                                </select>
                                <svg className="w-4 h-4 text-slate-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Status</label>
                            <div className="bg-slate-50 rounded-full border border-slate-200 px-4 py-2 flex items-center relative focus-within:border-blue-400">
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer z-10">
                                    <option value="All">All Status</option><option value="Assigned">Assigned</option><option value="Completed">Completed</option><option value="In Progress">In Progress</option><option value="Reopen">Reopen</option><option value="On Check">On Check</option>
                                </select>
                                <svg className="w-4 h-4 text-slate-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Mulai</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 cursor-pointer" />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Sampai</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* ================= CARD UTAMA TABEL DATA ================= */}
                <div className="w-full bg-white rounded-[40px] shadow-2xl p-4 md:p-8 pb-4 border border-slate-100 min-h-[460px] overflow-hidden">
                    <div className="w-full overflow-x-auto custom-scrollbar pb-4">
                        <div className="min-w-[900px]">

                            {/* Header Judul Kolom */}
                            <div className="grid grid-cols-5 gap-4 px-6 py-4 text-[#1E40AF] font-black text-[16px] border-b-[3px] border-slate-200 mb-2">
                                <div>Tasks</div>
                                <div>Status (Update)</div>
                                <div>Priority (Update)</div>
                                <div>Date</div>
                                <div>Teknisi</div>
                            </div>

                            {/* Konten Iterasi Baris Tiket */}
                            <div className="flex flex-col gap-2">
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map((t, index) => (
                                    <div
                                        key={t.id}
                                        onClick={() => navigate('/ticket-detail', { state: t })}
                                        className={`grid grid-cols-5 gap-4 px-6 py-3.5 items-center rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                                        ${index % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-blue-50/80 border border-transparent hover:border-blue-100`}
                                    >
                                        {/* Kolom Tasks */}
                                        <div>
                                            <p className="text-[14px] font-black text-[#1E40AF]">No Task {t.id}</p>
                                            <p className="text-[12px] font-bold text-slate-400 mt-0.5 truncate">
                                                {t.kodeMasalah && <span className="text-rose-500 mr-1">[{t.kodeMasalah}]</span>}
                                                {t.task}
                                            </p>
                                        </div>

                                        {/* Kolom Status (ReadOnly) */}
                                        <div>
                                            <div className={`inline-flex items-center rounded-full px-4 py-1.5 border text-[13px] font-black shadow-sm ${getStatusStyle(t.status)}`}>
                                                {t.status}
                                            </div>
                                        </div>

                                        {/* Kolom Badge Priority */}
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <div className={`inline-flex items-center rounded-full px-4 py-1.5 border text-[11px] font-black tracking-widest shadow-sm relative ${getPriorityBadgeStyle(calculateDynamicPriority(t.date, t.status, t.completedAt, t.reopenCount > 0), t.status)}`}>
                                                {calculateDynamicPriority(t.date, t.status, t.completedAt, t.reopenCount > 0)}
                                            </div>
                                        </div>

                                        {/* Kolom Tanggal */}
                                        <div>
                                            <span className="text-[13px] font-bold text-slate-500">{t.date}</span>
                                        </div>

                                        {/* Kolom Profil Teknisi */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200 shrink-0">
                                                <img src={t.avatar} alt={t.tech} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[13px] font-bold text-slate-600 truncate">{t.tech}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 text-center flex flex-col items-center">
                                    <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-slate-400 font-bold text-lg">Tidak ada tiket yang sesuai dengan filter pencarian.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}