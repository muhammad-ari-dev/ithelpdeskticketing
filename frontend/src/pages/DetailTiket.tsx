import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { calculateDynamicPriority, getPriorityBadgeStyle } from '../utils/ticketUtils';
import { authApi } from '../api/authApi';

export default function DetailTiket() {
    const navigate = useNavigate();
    const location = useLocation();

    const { users, getStaffs } = useUserContext();
    const activeStaffs = getStaffs().filter(s => s.status === 'Aktif');

    const TicketTimer = ({ assignedAt, takenAt, checkedAt, status, pointsEarned }: { assignedAt?: string, takenAt?: string, checkedAt?: string, status: string, pointsEarned?: number }) => {
        if (status === 'Completed') {
            const start = takenAt ? new Date(takenAt).getTime() : (assignedAt ? new Date(assignedAt).getTime() : 0);
            const end = checkedAt ? new Date(checkedAt).getTime() : new Date().getTime();
            
            // if (start > 0) {
            //     const diffMs = Math.max(0, end - start);
            //     const h = Math.floor(diffMs / (1000 * 60 * 60));
            //     const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
            //     return (
            //         <div className="mb-8 p-5 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between border-2 shadow-sm bg-emerald-50 border-emerald-200">
            //             <div className="flex items-center gap-4">
            //                 <div className="p-3 rounded-full bg-emerald-100 text-emerald-500">
            //                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            //                 </div>
            //                 <div>
            //                     <p className="text-[12px] font-black uppercase tracking-widest text-emerald-600">Tiket Selesai (History)</p>
            //                     <p className="text-[28px] font-black leading-none mt-1 text-emerald-600">
            //                         Waktu Pengerjaan: {h > 0 ? `${h}j ` : ''}{m}m
            //                     </p>
            //                 </div>
            //             </div>
            //             {pointsEarned !== undefined && (
            //                 <div className="mt-4 md:mt-0 flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
            //                     <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Poin Didapat:</span>
            //                     <span className="text-[18px] font-black text-emerald-600">+{pointsEarned}</span>
            //                 </div>
            //             )}
            //         </div>
            //     );
            // }
        }
        return null;
    };

    // ================= STATE & DATA =================
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Ambil data user yang sedang login dari localStorage
    const sessionRaw = localStorage.getItem('currentUser');
    const currentUser = sessionRaw ? JSON.parse(sessionRaw) : null;

    // Mengambil state dari navigasi LihatTiket (jika ada), jika tidak gunakan default
    const passedData = location.state as any;
    const ticketCode = passedData?.ticketCode || passedData?.id;

    const [ticketData, setTicketData] = useState({
        id: passedData?.id || '',
        noTask: passedData?.ticketCode || passedData?.id || '005',
        namaTiket: passedData?.ticketName || passedData?.task || 'Lepas Kabel Jaringan',
        teknisi: passedData?.assignedEmployeeName || passedData?.tech || 'Belum diatur',
        deadline: passedData?.deadline || passedData?.date || 'Belum diatur', 
        createdAt: passedData?.createdAt || passedData?.date || 'Belum diatur',
        kategori: passedData?.priority || 'HIGH',
        detailPesanan: passedData?.fullDetail || passedData?.task || 'Tidak ada detail pesanan.',
        dokumentasi: [] as string[],
        avatar: passedData?.avatar || 'https://i.pravatar.cc/150?img=15',
        status: passedData?.status || 'Assigned',
        assignedAt: passedData?.assignedAt || undefined,
        takenAt: passedData?.takenAt || undefined,
        checkedAt: passedData?.checkedAt || undefined,
        completedAt: passedData?.completedAt || undefined,
        pointsEarned: passedData?.pointsEarned || 0,
        reopenCount: passedData?.reopenCount || 0,
    });

    const mapBackendStatus = (statusStr: string) => {
        if (!statusStr) return 'Assigned';
        const s = statusStr.toLowerCase();
        if (s === 'open' || s === 'on checking') return 'Assigned';
        if (s === 'on progress' || s === 'in progress') return 'On Progress';
        if (s === 'on check') return 'On Check';
        if (s === 'complete' || s === 'completed') return 'Completed';
        if (s === 'reopen') return 'Reopen';
        return statusStr;
    };

    const fetchTicketDetails = async () => {
        if (!ticketCode) {
            setError("Kode tiket tidak ditemukan.");
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const response = await authApi.getTicket(ticketCode);
            const data = response.data;
            if (data) {
                setTicketData({
                    id: data.id || '',
                    noTask: data.ticketCode || data.id || '',
                    namaTiket: data.ticketName || '',
                    teknisi: data.assignedEmployeeName || 'Belum diatur',
                    deadline: data.deadline || 'Belum diatur',
                    createdAt: data.createdAt || 'Belum diatur',
                    kategori: data.status || 'HIGH',
                    detailPesanan: data.ticketDesc || '',
                    dokumentasi: data.evidences || [],
                    avatar: 'https://i.pravatar.cc/150?img=15',
                    status: mapBackendStatus(data.status),
                    assignedAt: data.assignedAt || undefined,
                    takenAt: data.takenAt || undefined,
                    checkedAt: data.checkedAt || undefined,
                    completedAt: data.completedAt || undefined,
                    pointsEarned: data.pointsEarned || 0,
                    reopenCount: data.reopenCount || 0,
                });
            } else {
                setError("Data tiket tidak ditemukan di server.");
            }
        } catch (err) {
            console.error("Error fetching ticket:", err);
            setError("Gagal memuat detail tiket dari backend.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [ticketCode]);

    // Update avatar berdasarkan teknisi yang dipilih dari context
    useEffect(() => {
        const staff = users.find(u => u.name === ticketData.teknisi);
        if (staff && staff.avatar) {
            setTicketData(prev => ({ ...prev, avatar: staff.avatar }));
        } else {
            // Fallback default jika tidak ada di context (misal staff dihapus)
            setTicketData(prev => ({ ...prev, avatar: 'https://i.pravatar.cc/150?img=11' }));
        }
    }, [ticketData.teknisi, users]);

    // ================= HANDLERS =================
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const tCode = ticketData.noTask || ticketCode;
        if (!tCode) return;

        try {
            await authApi.rejectTicket(tCode, ticketData.detailPesanan);
            setShowSuccessPopup(true);
            setTimeout(() => {
                setShowSuccessPopup(false);
                setIsEditing(false);
                fetchTicketDetails();
            }, 2000);
        } catch (err) {
            console.error("Gagal me-reopen tiket:", err);
            alert("Gagal memproses reopen tiket di server.");
        }
    };

    const handleComplete = async () => {
        await updateTicketStatus('Completed');
        navigate('/lihat-tiket');
    };

    const updateTicketStatus = async (newStatus: string) => {
        const tCode = ticketData.noTask || ticketCode;
        if (!tCode) return;

        try {
            if (newStatus === 'On Progress') {
                await authApi.startTicket(tCode);
            } else if (newStatus === 'On Check') {
                await authApi.submitToCheck(tCode, "Teknisi mengajukan pengecekan selesai");
            } else if (newStatus === 'Completed') {
                await authApi.approveTicket(tCode, "Head IT menyetujui tiket selesai");
            }
            await fetchTicketDetails();
        } catch (err) {
            console.error("Gagal memperbarui status tiket:", err);
            alert("Gagal memperbarui status tiket di server.");
        }
    };

    // ================= HELPERS =================

    // Helper to format DD/MM/YYYY HH:mm to YYYY-MM-DDTHH:mm for datetime-local input
    const toInputFormat = (dateStr: string) => {
        if (!dateStr || dateStr === 'Belum diatur') return '';
        const parts = dateStr.split(' ');
        if (parts.length < 1) return '';
        const dateParts = parts[0].split('/');
        if (dateParts.length !== 3) return dateStr; 
        const timePart = parts[1] || '00:00';
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timePart}`;
    };

    // Helper to format YYYY-MM-DDTHH:mm back to DD/MM/YYYY HH:mm for saving/display
    const toDisplayFormat = (inputStr: string) => {
        if (!inputStr) return '';
        const [datePart, timePart] = inputStr.split('T');
        if (!datePart) return inputStr;
        const parts = datePart.split('-');
        if (parts.length !== 3) return inputStr;
        return `${parts[2]}/${parts[1]}/${parts[0]} ${timePart || '00:00'}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
                <div className="flex flex-col items-center bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100 min-w-[320px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-slate-500 font-bold text-lg">Memuat detail tiket...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans px-4">
                <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center border border-slate-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-100">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Terjadi Kesalahan</h3>
                    <p className="text-sm font-bold text-slate-500 mt-2">{error}</p>
                    <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full text-sm shadow-md transition active:scale-95">
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans relative overflow-hidden">

            {/* ================= SUCCESS POPUP ================= */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center border border-slate-100 min-w-[320px] transform animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-[#22c55e] rounded-full flex items-center justify-center mb-4 shadow-[0_10px_25px_rgba(34,197,94,0.4)]">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 text-center">Tiket Diperbarui!</h3>
                        <p className="text-sm font-bold text-slate-500 mt-2 animate-pulse">Menyimpan perubahan...</p>
                    </div>
                </div>
            )}

            {/* ================= BLUE HEADER BLOCK ================= */}
            <div className="w-full max-w-[1100px] bg-[#3B82F6] rounded-[32px] shadow-[0_15px_30px_rgba(59,130,246,0.3)] flex flex-col px-6 md:px-8 py-5 mb-8 z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 md:ml-2">
                        {currentUser?.roleName !== 'EMPLOYEE' && (
                            <button onClick={() => navigate('/buat-tiket')} className="text-white hover:text-blue-200 font-bold text-[14px] md:text-[15px] transition-colors">Buat Tiket</button>
                        )}
                        {currentUser?.roleName !== 'EMPLOYEE' && (
                            <button onClick={() => navigate('/lihat-tiket')} className="text-white hover:text-blue-200 font-bold text-[14px] md:text-[15px] transition-colors">Lihat Tiket</button>
                        )}
                        <div className="bg-white px-6 py-1.5 rounded-full shadow-sm">
                            <span className="text-[#1E40AF] font-black text-[14px] md:text-[15px] tracking-wide">Detail Tiket</span>
                        </div>
                    </div>
                    <button onClick={() => navigate(currentUser?.roleName === 'EMPLOYEE' ? '/dashboard-staff' : '/dashboard-head')} className="flex items-center gap-2 bg-blue-800/40 hover:bg-blue-800/80 px-4 py-1.5 rounded-full transition-colors border-2 border-blue-900/50">
                        <div className="bg-white rounded-full p-0.5">
                            <svg className="w-3.5 h-3.5 text-blue-900" fill="currentColor" viewBox="0 0 24 24"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                        </div>
                        <span className="text-white font-black text-[11px] tracking-wider uppercase">Home</span>
                    </button>
                </div>
            </div>

            {/* ================= MAIN CONTENT CARD ================= */}
            <div className="w-full max-w-[1100px] bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100 min-h-[500px]">

                {isEditing ? (
                    /* ================= MODE EDIT TIKET ================= */
                    <form onSubmit={handleSaveEdit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-[900px] mx-auto">

                        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-5">
                            <div className="bg-[#f59e0b]/10 p-3 rounded-2xl text-[#f59e0b] shadow-sm">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Tiket (Reopen)</h2>
                                <p className="text-[13px] font-bold text-slate-400 mt-1">Perbarui detail tugas dan prioritas perbaikan.</p>
                            </div>
                        </div>

                        {/* Area Input Edit yang Presisi */}
                        <div className="bg-[#f8fafc] border border-slate-100 rounded-[32px] p-8 shadow-inner mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

                                {/* Kolom Kiri */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Tiket</label>
                                        <input
                                            type="text"
                                            value={ticketData.namaTiket}
                                            onChange={(e) => setTicketData({ ...ticketData, namaTiket: e.target.value })}
                                            required
                                            readOnly
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-slate-500 font-bold text-[14px] shadow-sm outline-none transition-all cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kategori / Priority</label>
                                        <input
                                            type="text"
                                            value={ticketData.kategori}
                                            readOnly
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-slate-500 font-bold text-[14px] shadow-sm outline-none transition-all cursor-not-allowed uppercase"
                                        />
                                    </div>
                                </div>

                                {/* Kolom Kanan */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Deadline Perbaikan</label>
                                        <input
                                            type="datetime-local"
                                            value={toInputFormat(ticketData.deadline)}
                                            onChange={(e) => setTicketData({ ...ticketData, deadline: toDisplayFormat(e.target.value) })}
                                            required
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-slate-800 font-bold text-[14px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Teknisi Ditugaskan</label>
                                        <div className="relative">
                                            <select
                                                value={ticketData.teknisi}
                                                onChange={(e) => setTicketData({ ...ticketData, teknisi: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-slate-800 font-bold text-[14px] shadow-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                            >
                                                {activeStaffs.length === 0 ? (
                                                    <option value="">Belum ada teknisi aktif</option>
                                                ) : (
                                                    activeStaffs.map(staff => (
                                                        <option key={staff.id} value={staff.name}>{staff.name}</option>
                                                    ))
                                                )}
                                            </select>
                                            <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width Teks Area */}
                                <div className="col-span-1 md:col-span-2 mt-2">
                                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Detail Pesanan Kendala</label>
                                    <textarea
                                        value={ticketData.detailPesanan}
                                        onChange={(e) => setTicketData({ ...ticketData, detailPesanan: e.target.value })}
                                        rows={6}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-700 font-semibold text-[14px] shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Upload Image Area */}
                                <div className="col-span-1 md:col-span-2 mt-2">
                                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Lampiran Dokumentasi</label>
                                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                        {ticketData.dokumentasi.map((img, i) => (
                                            <div key={i} className="w-[140px] h-[100px] shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
                                                <img src={img} alt={`Doc ${i}`} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setTicketData({ ...ticketData, dokumentasi: ticketData.dokumentasi.filter((_, idx) => idx !== i) })} className="absolute top-1 right-1 bg-white/90 text-rose-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-500 hover:text-white">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <label className="w-[140px] h-[100px] shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 cursor-pointer bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 transition-all">
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setTicketData({ ...ticketData, dokumentasi: [...ticketData.dokumentasi, URL.createObjectURL(file)] });
                                            }} className="hidden" />
                                            <svg className="w-6 h-6 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                            <span className="text-[11px] font-bold tracking-wide">Unggah Foto</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Simpan & Batal */}
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <button type="submit" className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white font-black py-4 rounded-full text-[15px] shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                Pesan Tiket Kembali
                            </button>
                            <button type="button" onClick={() => setIsEditing(false)} className="w-full md:w-auto md:px-12 bg-slate-200 hover:bg-slate-300 text-slate-600 font-black py-4 rounded-full text-[15px] transition-all active:scale-95">
                                Batal
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[950px] mx-auto">
                        {/* Komponen Timer SLA (Muncul jika status Assigned atau On Check) */}
                        <TicketTimer 
                        assignedAt={ticketData.assignedAt} 
                        takenAt={ticketData.takenAt} 
                        checkedAt={ticketData.checkedAt}
                        status={ticketData.status} 
                        pointsEarned={ticketData.pointsEarned}
                    />

                        {/* Header Info: Avatar Kiri, Info Kanan (Merapat) */}
                        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start mb-12">

                            {/* Kiri: Avatar Teknisi */}
                            <div className="flex flex-col items-center shrink-0 w-[180px]">
                                <div className="w-36 h-36 rounded-full border-4 border-slate-50 shadow-xl overflow-hidden bg-blue-600/90 flex items-center justify-center text-white text-[64px] font-black mb-5 relative group">
                                    <span className="group-hover:scale-110 transition-transform duration-500">
                                        {(ticketData.teknisi || "U").charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Teknisi Ditugaskan</p>
                                <p className="text-[18px] font-black text-blue-900 text-center leading-tight">{ticketData.teknisi}</p>
                            </div>

                            {/* Kanan: Grid Informasi Esensial (Presisi & Rapi) */}
                            <div className="flex flex-row flex-wrap gap-x-20 gap-y-10 mt-2">
                                {/* Kolom 1 */}
                                <div className="flex flex-col gap-10">
                                    <div>
                                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Deadline Perbaikan
                                        </p>
                                        <div className="bg-slate-50 py-2.5 px-6 rounded-xl border border-slate-100 inline-block shadow-sm">
                                            <p className="text-[16px] font-bold text-slate-700">{ticketData.deadline}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            Tingkat Prioritas
                                        </p>
                                        <div className={`inline-flex items-center rounded-full px-8 py-2 border text-[12px] font-black tracking-widest shadow-sm uppercase ${getPriorityBadgeStyle(calculateDynamicPriority(ticketData.deadline, ticketData.status, ticketData.completedAt, (ticketData.reopenCount && ticketData.reopenCount > 0) ? true : false), ticketData.status)}`}>
                                            {calculateDynamicPriority(ticketData.deadline, ticketData.status, ticketData.completedAt, (ticketData.reopenCount && ticketData.reopenCount > 0) ? true : false)}
                                        </div>
                                    </div>
                                </div>

                                {/* Kolom 2 */}
                                <div className="flex flex-col gap-10">
                                    <div>
                                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                            Nama Tiket
                                        </p>
                                        <div className="bg-slate-50 py-2.5 px-6 rounded-xl border border-slate-100 inline-block shadow-sm">
                                            <p className="text-[16px] font-bold text-slate-700">{ticketData.namaTiket}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Waktu Dibuat
                                        </p>
                                        <div className="bg-slate-50 py-2.5 px-6 rounded-xl border border-slate-100 inline-block shadow-sm">
                                            <p className="text-[16px] font-bold text-slate-700">{ticketData.createdAt}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Pengerjaan */}
                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm mb-8">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Timeline Pengerjaan
                            </h3>
                            <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
                                
                                {/* 1. ASSIGNED */}
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-slate-800 text-sm">Tiket Dibuat (Assigned)</p>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {ticketData.assignedAt ? new Date(ticketData.assignedAt).toLocaleString() : ticketData.createdAt}
                                        </p>
                                    </div>
                                </div>

                                {/* SISIPAN: JIKA TIKET SEDANG DIREOPEN & BELUM DIAMBIL LAGI */}
                                {ticketData.status === 'Reopen' && !ticketData.takenAt && (
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-pulse">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-amber-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-amber-50 p-4 rounded-2xl shadow-sm border border-amber-200">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="font-bold text-amber-700 text-sm">Tiket Dikembalikan (Reopen)</p>
                                            </div>
                                            <p className="text-xs text-amber-600 font-medium">Menunggu Staff mengambil ulang tugas ini.</p>
                                        </div>
                                    </div>
                                )}

                                {/* 2. TAKEN / IN PROGRESS */}
                                {ticketData.takenAt && (
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100 relative">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">Tiket Diambil (On Progress)</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{new Date(ticketData.takenAt).toLocaleString()}</p>
                                                </div>
                                                {/* {ticketData.assignedAt && (() => {
                                                    const diff = (new Date(ticketData.takenAt).getTime() - new Date(ticketData.assignedAt).getTime()) / (1000 * 60);
                                                    const isOnTime = diff <= 30;
                                                    return (
                                                        <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${isOnTime ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                            {isOnTime ? '+5 Poin (Tepat Waktu)' : '-5 Poin (Terlambat)'}
                                                        </div>
                                                    );
                                                })()} */}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. CHECKED / ON CHECK */}
                                {ticketData.checkedAt && (
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100 relative">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">Pengajuan Pengecekan (On Check)</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{new Date(ticketData.checkedAt).toLocaleString()}</p>
                                                </div>
                                                {/* {ticketData.takenAt && (() => {
                                                    const diff = (new Date(ticketData.checkedAt).getTime() - new Date(ticketData.takenAt).getTime()) / (1000 * 60);
                                                    const isOnTime = diff <= 15;
                                                    return (
                                                        <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${isOnTime ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                            {isOnTime ? '+10 Poin (Tepat Waktu)' : '-10 Poin (Terlambat)'}
                                                        </div>
                                                    );
                                                })()} */}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. COMPLETED */}
                                {ticketData.completedAt && (
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="font-bold text-emerald-800 text-sm">Tugas Selesai (Completed)</p>
                                            </div>
                                            <p className="text-xs text-emerald-600 font-medium">{new Date(ticketData.completedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* List Detail Kendala */}
                        <div className="mb-10 w-full">
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Detail Kendala & Tugas</p>
                            <div className="bg-[#f8fafc] border border-slate-100 rounded-[28px] p-8 shadow-inner min-h-[120px]">
                                <p className="text-[15px] font-semibold text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {ticketData.detailPesanan}
                                </p>
                            </div>
                        </div>

                        {/* Dokumentasi Visual */}
                        <div className="mb-12 w-full">
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Lampiran Dokumentasi</p>
                            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                                {ticketData.dokumentasi.map((img, i) => (
                                    <div key={i} onClick={() => setSelectedImage(img)} className="w-[280px] h-[180px] shrink-0 bg-slate-100 rounded-[24px] overflow-hidden shadow-md border-4 border-white group relative cursor-pointer">
                                        <img src={img} alt={`Dokumentasi ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tombol Aksi (Berbeda antara Head dan Staff) */}
                        {currentUser?.roleName === 'EMPLOYEE' ? (
                            <div className="mt-8 border-t border-slate-100 pt-8 w-full">
                                {ticketData.status === 'Assigned' || ticketData.status === 'Reopen' ? (
                                    <button 
                                        onClick={() => updateTicketStatus('On Progress')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-[15px] shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Ambil Penugasan
                                    </button>
                                ) : ticketData.status === 'On Progress' ? (
                                    <button 
                                        onClick={() => updateTicketStatus('On Check')}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl text-[15px] shadow-[0_4px_12px_rgba(147,51,234,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        Pengajuan On Check ke Head IT
                                    </button>
                                ) : ticketData.status === 'On Check' ? (
                                    <div className="w-full bg-purple-50 text-purple-600 border border-purple-200 font-black py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2 cursor-default">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                        Menunggu Pengecekan Head IT
                                    </div>
                                ) : (
                                    <div className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-black py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2 cursor-default">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        Tugas Telah Selesai
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-4 w-full mt-4">
                                {ticketData.status === 'On Check' && (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex-1 bg-[#F59E0B] hover:bg-amber-600 text-white font-black py-4 rounded-2xl text-[15px] shadow-[0_8px_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            Reopen
                                        </button>
                                        <button
                                            onClick={handleComplete}
                                            className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white font-black py-4 rounded-2xl text-[15px] shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                            Completed
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Image Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-[90vw] max-h-[90vh]">
                        <img 
                            src={selectedImage} 
                            alt="Dokumentasi Full" 
                            className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
                        />
                        <button 
                            className="absolute -top-4 -right-4 bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}