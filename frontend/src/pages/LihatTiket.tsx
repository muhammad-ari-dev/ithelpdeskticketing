import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDynamicPriority, getPriorityBadgeStyle, getPriorityWeight } from '../utils/ticketUtils';
import { authApi } from '../api/authApi';

interface BackendTicket {
  id?: number;
  ticketCode?: string;
  ticketName?: string;
  status?: string;
  deadline?: string;
  createdAt?: string;
  assignedEmployeeName?: string;
  // Fallbacks for legacy/local storage data
  task?: string;
  kodeMasalah?: string;
  date?: string;
  completedAt?: string;
  reopenCount?: number;
  tech?: string;
  avatar?: string;
}

export default function LihatTiket() {
    const navigate = useNavigate();

    // ================= STATE DATA & FILTER =================
    const [tickets, setTickets] = useState<BackendTicket[]>([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);
    const [ticketLoadError, setTicketLoadError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [filterTech, setFilterTech] = useState('');
    const [filterPriority, setFilterPriority] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const getTicketDeadline = (ticket: BackendTicket) => ticket.deadline ?? ticket.createdAt ?? ticket.date ?? '';
    const getTicketTechnician = (ticket: BackendTicket) => ticket.assignedEmployeeName ?? ticket.tech ?? '';
    const getTicketTask = (ticket: BackendTicket) => ticket.ticketName ?? ticket.task ?? '';
    
    // FIX: Normalisasi string status dari backend agar selalu konsisten
    const getTicketStatus = (ticket: BackendTicket) => {
        const s = ticket.status ?? '';
        if (s === 'Open' || s === 'On Checking') return 'Assigned';
        if (s === 'Recheck') return 'On Check';
        if (s === 'Complete') return 'Completed'; // Mengubah Complete jadi Completed
        return s;
    };
    
    const getDashboardPriority = (ticket: BackendTicket) =>
        calculateDynamicPriority(getTicketDeadline(ticket));

    // ================= DATA FETCHER =================
    const fetchTickets = async () => {
        setIsLoadingTickets(true);
        setTicketLoadError(null);

        try {
            const response = await authApi.getTickets();
            const ticketList = Array.isArray(response) ? response : response?.data ?? [];
            setTickets(ticketList);
        } catch (error: unknown) {
            const errorName = error instanceof Error ? error.name : '';
            if (errorName === 'CanceledError' || errorName === 'AbortError') return;

            console.error('[getTickets] error:', error);
            setTicketLoadError('Gagal memuat data tiket dari backend.');
        } finally {
            setIsLoadingTickets(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // ================= LOGIKA FILTER & OPTIMASI SORTING =================
    const getTicketTime = (dateString: string) => {
        if (!dateString) return 0;
        const parsedDate = new Date(dateString);
        if (!Number.isNaN(parsedDate.getTime())) return parsedDate.getTime();
        const [day, month, year] = dateString.split(/[\/\- ]/); 
        if (!year) return 0;
        return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0).getTime();
    };

    const getInputTime = (dateString: string, isEnd: boolean = false) => {
        const [year, month, day] = dateString.split('-');
        const hour = isEnd ? 23 : 0;
        const min = isEnd ? 59 : 0;
        return new Date(Number(year), Number(month) - 1, Number(day), hour, min, 59).getTime();
    };

    const filteredTickets = tickets.filter(ticket => {
        const ticketDeadline = getTicketDeadline(ticket);
        const ticketStatus = getTicketStatus(ticket);
        const ticketTechnician = getTicketTechnician(ticket);

        const matchTech = filterTech.trim().length < 3 || ticketTechnician.toLowerCase().includes(filterTech.trim().toLowerCase());
        const dynamicPriority = getDashboardPriority(ticket);
        const matchPriority = filterPriority === 'All' || (dynamicPriority.toUpperCase() === filterPriority.toUpperCase());
        const matchStatus = filterStatus === 'All' || ticketStatus === filterStatus;

        let matchDate = true;
        if (startDate || endDate) {
            const ticketTime = getTicketTime(ticketDeadline);
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
    }).sort((a, b) => {
        // 1. Dapatkan status dengan aman (sekarang getTicketStatus sudah di-normalize)
        const statusA = (getTicketStatus(a) || "").toLowerCase().trim();
        const statusB = (getTicketStatus(b) || "").toLowerCase().trim();
        
        const isCompletedA = statusA === "completed";
        const isCompletedB = statusB === "completed";

        // 2. Paksa tiket yang SUDAH SELESAI ke urutan paling bawah
        if (isCompletedA && !isCompletedB) return 1;
        if (!isCompletedA && isCompletedB) return -1;

        // 3. Jika sama-sama belum selesai, urutkan berdasarkan bobot prioritas HIGH -> LOW
        const priorityA = getDashboardPriority(a);
        const priorityB = getDashboardPriority(b);
        
        return getPriorityWeight(priorityB, getTicketStatus(b)) - getPriorityWeight(priorityA, getTicketStatus(a));
    });

    // ================= STYLE HANDLERS =================
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-[#22c55e] border-emerald-200';
            case 'Reopen': return 'bg-amber-50 text-[#f59e0b] border-amber-200';
            case 'On Progress': return 'bg-blue-50 text-[#3b82f6] border-blue-200';
            case 'Assigned': return 'bg-rose-50 text-[#ef4444] border-rose-200';
            case 'On Check': return 'bg-purple-50 text-purple-600 border-purple-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans relative overflow-hidden">
            <div className="w-full max-w-[1100px] bg-[#3B82F6] rounded-[32px] shadow-[0_15px_30px_rgba(59,130,246,0.3)] flex flex-col px-8 py-5 mb-6 z-10">
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-blue-400/50 pb-5 mb-5 gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 md:ml-2">
                        <button onClick={() => navigate('/buat-tiket')} className="text-white hover:text-blue-200 font-bold text-[14px] md:text-[15px] transition-colors">Buat Tiket</button>
                        <div className="bg-white px-6 py-1.5 rounded-full shadow-sm">
                            <span className="text-[#1E40AF] font-black text-[14px] md:text-[15px] tracking-wide">Lihat Tiket</span>
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard-head')} className="flex items-center gap-2 bg-blue-800/40 hover:bg-blue-800/80 px-4 py-1.5 rounded-full transition-colors border-2 border-blue-900/50 shrink-0">
                        <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                        <span className="text-white font-black text-[11px] tracking-wider uppercase">Home</span>
                    </button>
                </div>

                {/* TABEL RINGKASAN TOP (TERMASUK ON CHECK) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Waiting', count: tickets.filter(t => getTicketStatus(t) === 'Assigned').length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'On Progress', count: tickets.filter(t => getTicketStatus(t) === 'On Progress').length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'On Check', count: tickets.filter(t => getTicketStatus(t) === 'On Check').length, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                        { label: 'Reopen', count: tickets.filter(t => getTicketStatus(t) === 'Reopen').length, icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                        { label: 'Completed', count: tickets.filter(t => getTicketStatus(t) === 'Completed').length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
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
                </div>
            </div>

            {/* ================= MAIN CONTENT AREA ================= */}
            <div className="w-full max-w-[1100px] flex flex-col gap-4">

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

                <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white shadow-xl border border-slate-100 rounded-[28px]
                    ${isFilterOpen ? 'max-h-[500px] p-6 opacity-100 mb-2' : 'max-h-0 p-0 opacity-0 border-transparent'}`}>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                        <div className="flex flex-col">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Nama Teknisi</label>
                            <div className="bg-slate-50 rounded-full border border-slate-200 px-4 py-2 flex items-center relative focus-within:border-blue-400">
                                <input type="text" value={filterTech} onChange={(e) => setFilterTech(e.target.value)} placeholder="Cari Teknisi" className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none z-10 placeholder-slate-400" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Priority</label>
                            <div className="bg-slate-50 rounded-full border border-slate-200 px-4 py-2 flex items-center relative focus-within:border-blue-400">
                                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer z-10">
                                    <option value="All">All Priority</option><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Status</label>
                            <div className="bg-slate-50 rounded-full border border-slate-200 px-4 py-2 flex items-center relative focus-within:border-blue-400">
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer z-10">
                                    <option value="All">All Status</option><option value="Assigned">Assigned</option><option value="Completed">Completed</option><option value="On Progress">On Progress</option><option value="Reopen">Reopen</option><option value="On Check">On Check</option>
                                </select>
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

                            {/* Header grid sejajar 5 kolom */}
                            <div className="grid grid-cols-5 gap-4 px-6 py-4 text-[#1E40AF] font-black text-[16px] border-b-[3px] border-slate-200 mb-2">
                                <div>Tasks</div>
                                <div>Status (Update)</div>
                                <div>Priority (Update)</div>
                                <div>Tanggal</div>
                                <div>Teknisi</div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {isLoadingTickets ? (
                                    <div className="py-16 text-center flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-500 mb-4"></div>
                                        <p className="text-slate-400 font-bold text-lg">Memuat data tiket...</p>
                                    </div>
                                ) : ticketLoadError ? (
                                    <div className="py-16 text-center flex flex-col items-center bg-rose-50/60 rounded-3xl">
                                        <svg className="w-16 h-16 text-rose-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" /></svg>
                                        <p className="text-rose-500 font-bold text-lg">{ticketLoadError}</p>
                                        <button onClick={fetchTickets} className="mt-4 px-5 py-2 bg-rose-600 text-white rounded-full text-xs font-black shadow-md hover:bg-rose-700 transition">
                                            Coba Lagi
                                        </button>
                                    </div>
                                ) : filteredTickets.length > 0 ? (
                                    filteredTickets.map((t, index) => {
                                        const ticketStatus = getTicketStatus(t);
                                        const isCompleted = ticketStatus === 'Completed';
                                        const ticketTask = getTicketTask(t);
                                        const dynamicPriority = getDashboardPriority(t);
                                        
                                        // Variabel mapping yang aman berdasarkan response backend
                                        const ticketTech = getTicketTechnician(t) || 'Belum Ditugaskan';
                                        const ticketDate = t.createdAt || t.deadline || t.date || '-';

                                        return (
                                            <div
                                                key={t.ticketCode || t.id || index}
                                                onClick={() => navigate('/ticket-detail', { state: t })}
                                                className={`grid grid-cols-5 gap-4 px-6 py-3.5 items-center rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                                                ${index % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-blue-50/80 border border-transparent hover:border-blue-100`}
                                            >
                                                <div>
                                                    <p className="text-[14px] font-black text-[#1E40AF]">{t.ticketCode || t.id}</p>
                                                    <p className="text-[12px] font-bold text-slate-400 mt-0.5 truncate">
                                                        {t.kodeMasalah && <span className="text-rose-500 mr-1">[{t.kodeMasalah}]</span>}
                                                        {ticketTask}
                                                    </p>
                                                </div>

                                                <div>
                                                    <div className={`inline-flex items-center rounded-full px-4 py-1.5 border text-[13px] font-black shadow-sm ${getStatusStyle(ticketStatus)}`}>
                                                        {ticketStatus}
                                                    </div>
                                                </div>

                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <div className={`inline-flex items-center rounded-full px-4 py-1.5 border text-[11px] font-black tracking-widest shadow-sm relative ${isCompleted ? 'bg-slate-50 text-slate-400 border-slate-200 shadow-none' : getPriorityBadgeStyle(dynamicPriority, ticketStatus)}`}>
                                                        {isCompleted ? 'NONE' : dynamicPriority}
                                                    </div>
                                                </div>

                                                {/* Kolom Tanggal */}
                                                <div>
                                                    <span className="text-[13px] font-bold text-slate-500">{ticketDate}</span>
                                                </div>

                                                {/* Kolom Profil Teknisi dengan Avatar Fallback */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                                        {t.avatar ? (
                                                            <img src={t.avatar} alt={ticketTech} className="w-full h-full object-cover" />
                                                        ) : (
                                                            ticketTech.charAt(0)
                                                        )}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-slate-600 truncate">{ticketTech}</span>
                                                </div>
                                            </div>
                                        );
                                    })
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