import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CetakTiketGif from '../assets/assetcetaktiket.gif';
import { useUserContext } from '../context/UserContext';

export default function BuatTiket() {
    const navigate = useNavigate();
    const { getStaffs } = useUserContext();
    const activeStaffs = getStaffs().filter(s => s.status === 'Aktif');

    // Filter staff yang sedang tidak punya tugas aktif
    const existingTickets = JSON.parse(localStorage.getItem('ticketsData') || '[]');
    const busyTechs = existingTickets
        .filter((t: any) => t.status !== 'Completed')
        .map((t: any) => (t.tech || '').toLowerCase());
    
    const availableStaffs = activeStaffs.filter(s => !busyTechs.includes(s.name.toLowerCase()));

    const getInitialDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // ================= STATE FORM =================
    const [kodeMasalah, setKodeMasalah] = useState('');
    const [detailPesanan, setDetailPesanan] = useState('');
    const [teknisi, setTeknisi] = useState('');
    const [waktuSaatIni] = useState(getInitialDateTime());
    const [jatuhTempo, setJatuhTempo] = useState(getInitialDateTime());

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [noTaskPopup, setNoTaskPopup] = useState('');

    // Set teknisi awal secara otomatis jika data tersedia
    useEffect(() => {
        if (availableStaffs.length > 0 && !teknisi) {
            setTeknisi(availableStaffs[0].name);
        } else if (availableStaffs.length > 0 && !availableStaffs.find(s => s.name === teknisi)) {
            setTeknisi(availableStaffs[0].name);
        }
    }, [availableStaffs, teknisi]);

    // ================= HANDLER =================
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ambil tiket yang sudah ada
        const existingTickets = JSON.parse(localStorage.getItem('ticketsData') || '[]');
        
        // 1. Buat nomor antrean otomatis (urut berdasarkan data yang masuk)
        const antrianMasuk = existingTickets.length + 1;
        const autoNoTask = String(antrianMasuk).padStart(3, '0');
        
        setNoTaskPopup(autoNoTask);

        // 2. Format tanggal ke DD/MM/YYYY HH:mm
        const [datePart, timePart] = jatuhTempo.split('T');
        const [year, month, day] = datePart.split('-');
        const formattedDate = `${day}/${month}/${year} ${timePart || '00:00'}`;

        const [cDatePart, cTimePart] = waktuSaatIni.split('T');
        const [cYear, cMonth, cDay] = cDatePart.split('-');
        const formattedCreatedAt = `${cDay}/${cMonth}/${cYear} ${cTimePart || '00:00'}`;

        // 3. Tentukan Avatar Teknisi dari User Context
        const selectedStaff = availableStaffs.find(s => s.name === teknisi) || activeStaffs.find(s => s.name === teknisi);
        const avatarUrl = selectedStaff ? selectedStaff.avatar : 'https://i.pravatar.cc/150?img=15';

        // 4. Siapkan Objek Tiket Baru
        const newTicket = {
            id: autoNoTask, // Nomor antrean masuk otomatis
            kodeMasalah: kodeMasalah,
            task: detailPesanan.split('\n')[0].substring(0, 30), // Ambil baris pertama sebagai judul task
            status: 'Assigned', // Status awal tiket baru
            priority: 'LOW',
            date: formattedDate,
            createdAt: formattedCreatedAt,
            assignedAt: new Date().toISOString(), // Untuk patokan SLA 1
            pointsEarned: 0,
            tech: teknisi,
            avatar: avatarUrl,
            fullDetail: detailPesanan // Simpan detail utuh
        };

        // 5. Simpan ke Local Storage
        localStorage.setItem('ticketsData', JSON.stringify([...existingTickets, newTicket]));

        // 6. Tampilkan Popup & Alihkan Halaman
        setShowSuccessPopup(true);
        setTimeout(() => {
            setShowSuccessPopup(false);
            navigate('/lihat-tiket'); // Langsung arahkan ke Lihat Tiket untuk melihat hasilnya
        }, 3500);
    };

    const handleClear = () => {
        setKodeMasalah('');
        setDetailPesanan('');
        setJatuhTempo(getInitialDateTime());
    };

    const handleHome = () => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.role === 'ADMINISTRATOR') navigate('/dashboard-admin');
        else if (user.role === 'EMPLOYEE') navigate('/dashboard-staff');
        else navigate('/dashboard-head');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Ambient eye-comfort background glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 blur-[130px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none z-0"></div>

            {/* ================= SUCCESS POP UP ================= */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-opacity duration-300">
                    <div className="bg-white p-8 rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex flex-col items-center border border-slate-100 transform scale-100 max-w-[360px] w-full mx-4 animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-500/20">
                            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 text-center tracking-tight">Tiket Berhasil Dibuat!</h3>
                        <p className="text-slate-400 text-xs font-semibold text-center mt-1.5 leading-relaxed">
                            Kendala Anda telah didaftarkan dalam sistem bantuan IT.
                        </p>

                        <div className="mt-6 w-full bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/70 rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                            <div className="absolute top-[-20%] right-[-20%] w-24 h-24 rounded-full bg-blue-300/10 blur-xl pointer-events-none"></div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nomor Task Anda</p>
                            <p className="text-6xl font-black text-blue-900 mt-2 font-mono tracking-tighter drop-shadow-sm">{noTaskPopup}</p>
                        </div>

                        <div className="mt-8 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-xs font-bold text-slate-400">
                                Mengalihkan ke daftar tiket...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER TABS - Premium Cheerful Blue Glassmorphic */}
            <div className="w-full max-w-[1100px] bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md rounded-[32px] px-6 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_15px_30px_rgba(59,130,246,0.3)] mb-8 z-10">
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 md:ml-2">
                    <div className="bg-white/20 border border-white/30 px-6 py-2 rounded-full text-white font-extrabold text-[14px] md:text-[15px] shadow-sm">
                        <span className="tracking-wide">Buat Tiket</span>
                    </div>
                    <button onClick={() => navigate('/ticket-detail')} className="text-blue-100 hover:text-white font-bold text-[14px] md:text-[15px] transition-all hover:scale-105 duration-200">Detail Tiket</button>
                    <button onClick={() => navigate('/lihat-tiket')} className="text-blue-100 hover:text-white font-bold text-[14px] md:text-[15px] transition-all hover:scale-105 duration-200">Lihat Tiket</button>
                </div>
                <button onClick={handleHome} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2 rounded-full text-white font-bold text-[12px] uppercase transition-all tracking-wider shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                    Home
                </button>
            </div>

            {/* ================= MAIN CONTENT CARD ================= */}
            <div className="w-full max-w-[1100px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(15,23,42,0.06)] flex flex-col md:flex-row overflow-hidden z-10 border border-slate-100/80 min-h-[620px]">

                {/* --- KIRI: ILUSTRASI GIF --- */}
                <div className="w-full md:w-5/12 bg-[#3B82F6] flex flex-col items-center justify-center p-10 relative overflow-hidden border-r border-blue-500/20">
                    <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-white/10 blur-[50px] pointer-events-none"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-white/10 blur-[50px] pointer-events-none"></div>

                    <img
                        src={CetakTiketGif}
                        alt="Cetak Tiket Animasi"
                        className="w-full max-w-[300px] object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform duration-500"
                    />

                    <div className="relative z-10 mt-8 text-center">
                        <h3 className="text-white font-black text-2xl tracking-tight drop-shadow-sm">
                            Sistem Tiketing Cerdas
                        </h3>
                        <p className="text-blue-100 font-semibold text-sm mt-3 px-4 leading-relaxed">
                            Buat dan pantau tugas perbaikan dengan mudah dan cepat.
                        </p>
                    </div>
                </div>

                {/* --- KANAN: FORM BUAT TIKET --- */}
                <div className="w-full md:w-7/12 p-10 md:p-12 flex flex-col justify-center bg-white">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Kode Tiket Masalah */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Kode Tiket Masalah <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={kodeMasalah}
                                    onChange={(e) => setKodeMasalah(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-slate-800 font-semibold text-[14px] outline-none appearance-none cursor-pointer hover:bg-slate-100/60 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                >
                                    <option value="" disabled hidden>Pilih Kode Masalah...</option>
                                    <option value="ERR-001 (Hardware)">ERR-001 (Hardware)</option>
                                    <option value="ERR-002 (Software)">ERR-002 (Software)</option>
                                </select>
                                <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        {/* Detail Pesanan */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Detail Pesanan <span className="text-rose-500">*</span></label>
                            <textarea
                                value={detailPesanan}
                                onChange={(e) => setDetailPesanan(e.target.value)}
                                rows={4}
                                placeholder="Jelaskan kendala secara detail..."
                                required
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-4 text-slate-700 font-semibold text-[13px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Jatuh Tempo <span className="text-rose-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    value={jatuhTempo}
                                    onChange={(e) => setJatuhTempo(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-slate-700 font-bold text-[13px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all shadow-sm cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Profil Teknisi</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden border border-slate-200 z-10 pointer-events-none bg-blue-50 flex items-center justify-center shadow-sm">
                                        <span className="text-[11px] font-black text-blue-600">{teknisi.charAt(0)}</span>
                                    </div>
                                    <select
                                        value={teknisi}
                                        onChange={(e) => setTeknisi(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-12 pr-10 py-3.5 text-slate-700 font-bold text-[13px] outline-none appearance-none cursor-pointer hover:bg-slate-100/60 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    >
                                        {availableStaffs.length === 0 ? (
                                            <option value="">Semua teknisi sedang sibuk</option>
                                        ) : (
                                            availableStaffs.map(staff => (
                                                <option key={staff.id} value={staff.name}>{staff.name}</option>
                                            ))
                                        )}
                                    </select>
                                    <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>



                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Dokumentasi Kendala (Opsional)</label>
                            <div className="w-full h-28 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/20 transition-all group shadow-sm">
                                <div className="bg-blue-500/10 p-2 rounded-xl group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300 mb-2">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-black text-slate-400 group-hover:text-blue-600 transition-colors tracking-widest uppercase">Unggah File (PNG/JPG/PDF)</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-3">
                            <button
                                type="submit"
                                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white py-3.5 rounded-full font-black text-[14px] shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Pesan Tiket
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-full font-black text-[14px] transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Reset Form
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}