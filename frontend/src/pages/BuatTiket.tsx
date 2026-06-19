import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CetakTiketGif from '../assets/assetcetaktiket.gif';
import { authApi } from '../api/authApi';
import { ticketApi } from '../api/ticketApi';

export default function BuatTiket() {
    const navigate = useNavigate();

    // Helper konversi tanggal input HTML ke format bahasa Indonesia sesuai ekspektasi BE ("d MMMM yyyy")
    const formatToIndonesianDate = (dateString: string) => {
        if (!dateString) return "";
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        if (!year || !month || !day) return dateString;

        return `${day} ${months[month - 1]} ${year}`;
    };

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
    const [ticketName, setTicketName] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [deadline, setDeadline] = useState(getInitialDateTime());
    const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

    const [employees, setEmployees] = useState<any[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [noTaskPopup, setNoTaskPopup] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        setLoadingEmployees(true);
        authApi.getEmployees()
            .then((data: any) => {
                const list = Array.isArray(data) ? data : data?.data ?? [];

                const staffList = list.filter((emp: any) => {
                    const role = emp.roleName || emp.rolename || (emp.role && emp.role.roleName) || '';
                    return role.toUpperCase().includes('EMPLOYEE') || role.toUpperCase().includes('STAFF');
                });

                const processedList = staffList.map((emp: any) => {
                    // AMBIL USERNAME UNTUK VALUE (DI BALIK LAYAR)
                    const username = emp.username || emp.userName || '';
                    // AMBIL EMPLOYEE NAME UNTUK TAMPILAN (DI LAYAR UI)
                    const fullName = emp.employeeName || emp.employeename || username;

                    return { username, displayName: fullName };
                });

                setEmployees(processedList);

                if (processedList.length > 0) {
                    setAssignedEmployeeId(processedList[0].username);
                }
            })
            .catch(err => {
                console.error("Error loading employees:", err);
            })
            .finally(() => {
                setLoadingEmployees(false);
            });
    }, []);

    // ================= HANDLER =================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!assignedEmployeeId) {
            setSubmitError("Harap pilih Employee / Staff IT yang ditugaskan!");
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const formData = new FormData();
            formData.append('ticketName', ticketName);
            formData.append('ticketDesc', ticketDesc);
            formData.append('deadline', formatToIndonesianDate(deadline));

            // Mengirim username yang unik ke Backend
            formData.append('assignedEmployeeId', assignedEmployeeId);

            if (evidenceFile) {
                formData.append('files', evidenceFile);
            }

            console.log("Payload yang dikirim ke BE:", Object.fromEntries(formData.entries()));

            const result = await ticketApi.createTicket(formData);

            const payload = result?.data ?? result;
            const code = payload?.ticketCode ?? payload?.id ?? "001";
            setNoTaskPopup(String(code));

            setShowSuccessPopup(true);
            setTimeout(() => {
                setShowSuccessPopup(false);
                navigate('/lihat-tiket');
            }, 3000);
        } catch (err: any) {
            console.error("Error creating ticket:", err);
            setSubmitError(err?.response?.data?.message ?? err?.message ?? "Gagal membuat tiket.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setTicketName('');
        setTicketDesc('');
        setDeadline(getInitialDateTime());
        if (employees.length > 0) {
            setAssignedEmployeeId(employees[0].username);
        } else {
            setAssignedEmployeeId('');
        }
        setEvidenceFile(null);
        setSubmitError('');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 blur-[130px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none z-0"></div>

            {/* ================= SUCCESS POP UP ================= */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white p-8 rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex flex-col items-center border border-slate-100 max-w-[360px] w-full mx-4">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5">
                            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 text-center tracking-tight">Tiket Berhasil Dibuat!</h3>
                        <p className="text-slate-400 text-xs font-semibold text-center mt-1.5">Kendala Anda telah didaftarkan dalam sistem bantuan IT.</p>
                        <div className="mt-6 w-full bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/70 rounded-3xl p-5 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nomor Tiket Anda</p>
                            <p className="text-4xl font-black text-blue-900 mt-2 font-mono tracking-tighter">{noTaskPopup}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER TABS */}
            <div className="w-full max-w-[1100px] bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md rounded-[32px] px-6 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_15px_30px_rgba(59,130,246,0.3)] mb-8 z-10">
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 md:ml-2">
                    <div className="bg-white/20 border border-white/30 px-6 py-2 rounded-full text-white font-extrabold text-[14px] md:text-[15px] shadow-sm">
                        <span className="tracking-wide">Buat Tiket</span>
                    </div>
                    <button onClick={() => navigate('/ticket-detail')} className="text-blue-100 hover:text-white font-bold text-[14px] md:text-[15px]">Detail Tiket</button>
                    <button onClick={() => navigate('/lihat-tiket')} className="text-blue-100 hover:text-white font-bold text-[14px] md:text-[15px]">Lihat Tiket</button>
                </div>
                <button onClick={() => navigate('/dashboard-head')} className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2 rounded-full text-white font-bold text-[12px] uppercase tracking-wider shrink-0">Home</button>
            </div>

            {/* ================= MAIN CONTENT CARD ================= */}
            <div className="w-full max-w-[1100px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(15,23,42,0.06)] flex flex-col md:flex-row overflow-hidden z-10 border border-slate-100/80 min-h-[620px]">
                <div className="w-full md:w-5/12 bg-[#3B82F6] flex flex-col items-center justify-center p-10 border-r border-blue-500/20">
                    <img src={CetakTiketGif} alt="Animasi" className="w-full max-w-[300px] object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.15)]" />
                    <div className="mt-8 text-center">
                        <h3 className="text-white font-black text-2xl tracking-tight">Sistem Tiketing Cerdas</h3>
                        <p className="text-blue-100 font-semibold text-sm mt-3 px-4">Buat dan pantau tugas perbaikan dengan mudah dan cepat.</p>
                    </div>
                </div>

                <div className="w-full md:w-7/12 p-10 md:p-12 flex flex-col justify-center bg-white">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nama Tiket */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Nama Tiket <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={ticketName}
                                onChange={(e) => setTicketName(e.target.value)}
                                placeholder="Masukkan nama tiket..."
                                required
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-slate-800 font-semibold text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                            />
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Deskripsi <span className="text-rose-500">*</span></label>
                            <textarea
                                value={ticketDesc}
                                onChange={(e) => setTicketDesc(e.target.value)}
                                rows={4}
                                placeholder="Jelaskan kendala secara detail..."
                                required
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-4 text-slate-700 font-semibold text-[13px] outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Deadline */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Deadline <span className="text-rose-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-slate-700 font-bold text-[13px] outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm cursor-pointer"
                                />
                            </div>

                            {/* Assignee Selection */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Employee yang Ditugaskan <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={assignedEmployeeId}
                                        onChange={(e) => setAssignedEmployeeId(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-slate-700 font-bold text-[13px] outline-none appearance-none cursor-pointer hover:bg-slate-100/60 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    >
                                        <option value="" disabled>Pilih Staff IT...</option>
                                        {employees.map(emp => (
                                            /* VALUE TETEP USERNAME JAWABAN DARI BE (TIDAK BERUBAH) */
                                            <option key={emp.username} value={emp.username}>
                                                {/* DI LAYAR MUNCUL NAMA LENGKAP YANG ENYAK DILIAT */}
                                                {emp.displayName}
                                            </option>
                                        ))}
                                    </select>
                                    <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Upload Evidence */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Upload Evidence (PNG/JPG)</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 text-blue-600 font-bold text-xs px-4 py-3 rounded-xl cursor-pointer transition-all">
                                    <span>Pilih File</span>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setEvidenceFile(file);
                                        }}
                                        className="hidden"
                                    />
                                </label>
                                <span className="text-xs text-slate-500 font-semibold truncate max-w-[250px]">
                                    {evidenceFile ? evidenceFile.name : 'Belum ada file dipilih'}
                                </span>
                            </div>
                        </div>

                        {submitError && (
                            <p className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl">
                                {submitError}
                            </p>
                        )}

                        <div className="flex gap-4 pt-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-slate-300 text-white py-3.5 rounded-full font-black text-[14px]"
                            >
                                {isSubmitting ? 'Mengirim...' : 'Buat Tiket'}
                            </button>
                            <button type="button" onClick={handleClear} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-full font-black text-[14px]">
                                Reset Form
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}