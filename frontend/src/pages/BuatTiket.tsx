import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CetakTiketGif from '../assets/assetcetaktiket.gif';
import { authApi } from '../api/authApi';
import { ticketApi } from '../api/ticketApi';

type EmployeeOption = {
    username: string;
    displayName: string;
};

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

    const getInitialDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatToDisplayDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-');
        if (!year || !month || !day) return dateString;
        return `${day}/${month}/${year}`;
    };

    const getApiData = (response: any) => response?.data ?? response;

    const getCreatedTicketCode = (response: any) => {
        const data = getApiData(response);
        return data?.ticketCode ?? response?.ticketCode ?? data?.id ?? response?.id ?? "001";
    };

    const mapBackendStatus = (status?: string) => {
        switch ((status ?? '').toLowerCase()) {
            case 'open':
                return 'Assigned';
            case 'on progress':
                return 'In Progress';
            case 'complete':
                return 'Completed';
            default:
                return status || 'Assigned';
        }
    };

    const syncCreatedTicketToLocalStorage = (response: any) => {
        const savedTicket = getApiData(response) ?? {};
        const selectedEmployee = employees.find(emp => emp.username === assignedEmployeeId);
        const ticketCode = getCreatedTicketCode(response);
        const assignedEmployee = savedTicket.assignedEmployee ?? {};

        const uiTicket = {
            id: ticketCode,
            ticketCode,
            ticketName: savedTicket.ticketName ?? ticketName,
            ticketDesc: savedTicket.ticketDesc ?? ticketDesc,
            task: savedTicket.ticketName ?? ticketName,
            fullDetail: savedTicket.ticketDesc ?? ticketDesc,
            status: mapBackendStatus(savedTicket.status),
            date: formatToDisplayDate(deadline),
            deadline: formatToDisplayDate(deadline),
            tech: assignedEmployee.employeeName ?? selectedEmployee?.displayName ?? assignedEmployeeId,
            assignedEmployeeId,
            assignedEmployeeName: assignedEmployee.employeeName ?? selectedEmployee?.displayName ?? '',
            avatar: 'https://i.pravatar.cc/150?img=11',
            dokumentasi: [],
            createdAt: new Date().toLocaleString(),
            assignedAt: new Date().toISOString(),
            reopenCount: 0,
            pointsEarned: 0,
        };

        let tickets: any[] = [];
        try {
            const savedTickets = localStorage.getItem('ticketsData');
            const parsedTickets = savedTickets ? JSON.parse(savedTickets) : [];
            tickets = Array.isArray(parsedTickets) ? parsedTickets : [];
        } catch {
            tickets = [];
        }

        const nextTickets = Array.isArray(tickets)
            ? [...tickets.filter((ticket: any) => ticket.ticketCode !== ticketCode && ticket.id !== ticketCode), uiTicket]
            : [uiTicket];

        localStorage.setItem('ticketsData', JSON.stringify(nextTickets));
    };

    // ================= STATE FORM =================
    const [ticketName, setTicketName] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [deadline, setDeadline] = useState(getInitialDate());
    const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
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
                    const status = emp.status || emp.accountStatus || '';
                    return role.toUpperCase().includes('EMPLOYEE') && status.toUpperCase() !== 'INACTIVE';
                });

                const processedList = staffList.map((emp: any) => {
                    // AMBIL USERNAME UNTUK VALUE (DI BALIK LAYAR)
                    const username = emp.userName || emp.username || '';
                    // AMBIL EMPLOYEE NAME UNTUK TAMPILAN (DI LAYAR UI)
                    const fullName = emp.employeeName || emp.employeename || username;

                    return { username, displayName: fullName };
                }).filter((emp: EmployeeOption) => emp.username);

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

            evidenceFiles.forEach((file) => {
                formData.append('files', file);
            });

            console.log("Payload yang dikirim ke BE:", Object.fromEntries(formData.entries()));

            const result = await ticketApi.createTicket(formData);
            syncCreatedTicketToLocalStorage(result);

            const code = getCreatedTicketCode(result);
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
        setDeadline(getInitialDate());
        if (employees.length > 0) {
            setAssignedEmployeeId(employees[0].username);
        } else {
            setAssignedEmployeeId('');
        }
        setEvidenceFiles([]);
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
                    {/* <button onClick={() => navigate('/ticket-detail')} className="text-blue-100 hover:text-white font-bold text-[14px] md:text-[15px]">Detail Tiket</button> */}
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
                    <form onSubmit={handleSubmit} className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Formulir Tiket Baru</h2>
                            <p className="text-sm font-semibold text-slate-500 mt-1">Lengkapi informasi di bawah ini untuk menugaskan perbaikan.</p>
                        </div>

                        {/* Nama Tiket */}
                        <div className="relative group">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Tiket <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    value={ticketName}
                                    onChange={(e) => setTicketName(e.target.value)}
                                    placeholder="Contoh: Jaringan Wi-Fi Lantai 2 Terputus"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 font-bold text-[14px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm placeholder:text-slate-400/80 placeholder:font-medium"
                                />
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="relative group">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Deskripsi Detail <span className="text-rose-500">*</span></label>
                            <textarea
                                value={ticketDesc}
                                onChange={(e) => setTicketDesc(e.target.value)}
                                rows={4}
                                placeholder="Jelaskan kronologi, letak spesifik, atau gejala kendala yang dialami..."
                                required
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-bold text-[14px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm resize-none placeholder:text-slate-400/80 placeholder:font-medium leading-relaxed"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Deadline */}
                            <div className="relative group">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Deadline <span className="text-rose-500">*</span></label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold text-[14px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm cursor-pointer"
                                />
                            </div>

                            {/* Assignee Selection */}
                            <div className="relative group">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Teknisi Bertugas <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={assignedEmployeeId}
                                        onChange={(e) => setAssignedEmployeeId(e.target.value)}
                                        required
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold text-[14px] outline-none appearance-none cursor-pointer hover:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm"
                                    >
                                        <option value="" disabled>
                                            {loadingEmployees ? 'Memuat Staff IT...' : 'Pilih Staff IT...'}
                                        </option>
                                        {employees.map(emp => (
                                            <option key={emp.username} value={emp.username}>
                                                {emp.displayName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center bg-white rounded-full p-1 shadow-sm border border-slate-100">
                                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upload Evidence */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Upload Bukti / Dokumentasi (Opsional)</label>
                            <label className={`mt-1 flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${evidenceFiles.length > 0 ? 'border-blue-400 bg-blue-50/50' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400 group'}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    {evidenceFiles.length > 0 ? (
                                        <>
                                            <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-2 shadow-sm">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <p className="text-sm font-bold text-blue-700">
                                                {evidenceFiles.length} file dipilih
                                            </p>
                                            <div className="mt-2 max-w-full space-y-1">
                                                {evidenceFiles.map((file) => (
                                                    <p key={`${file.name}-${file.lastModified}`} className="text-[12px] font-semibold text-blue-600 truncate max-w-[280px]">
                                                        {file.name}
                                                    </p>
                                                ))}
                                            </div>
                                            <p className="text-[11px] font-semibold text-blue-500/70 mt-2 uppercase tracking-widest">Klik untuk mengganti foto</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-white text-slate-400 group-hover:text-blue-500 rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            </div>
                                            <p className="mb-1 text-sm text-slate-600 font-bold"><span className="text-blue-500">Klik untuk mengunggah</span> </p>
                                            <p className="text-xs text-slate-400 font-medium">PNG, JPG atau JPEG </p>
                                        </>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    multiple
                                    accept="image/png, image/jpeg, image/jpg" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files ?? []);
                                        setEvidenceFiles(files);
                                    }}
                                />
                            </label>
                        </div>

                        {submitError && (
                            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200/60 p-4 rounded-2xl animate-in fade-in duration-300">
                                <div className="w-8 h-8 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p className="text-[13px] font-bold text-rose-600 leading-tight">{submitError}</p>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-slate-100 mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white py-4 rounded-2xl font-black text-[15px] shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        Buat Tiket Sekarang
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </button>
                            <button type="button" onClick={handleClear} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-[14px] transition-all active:scale-[0.98]">
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
