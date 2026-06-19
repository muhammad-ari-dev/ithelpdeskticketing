import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

interface UserProfile { 
    id: string,
    name: string,
    username: string,
    roleName: string,
    roleDesc: string,
    avatar: string,
    joinDate: string,
    status: string,
    email: string,
    phone: string,
    staffIds: [],
    leaderId: string,
    password: string,
    points: string,
}

export default function Profile() {
    const navigate = useNavigate();
    //const { users } = useUserContext();
    const [user, setUser] = useState<UserProfile | null>(null);

    // Mengambil session yang sedang aktif
    //const currentUserSession = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // Sinkronisasi data real-time dengan UserContext
    //let user = users.find(u => String(u.id) === String(currentUserSession?.id));

    // Fallback khusus untuk akun hardcoded seperti 'admin' Master
    // if (!user && currentUserSession?.id) {
    //     user = {
    //         id: currentUserSession.id,
    //         name: currentUserSession.employeeName || 'System Administrator',
    //         username: currentUserSession.username || 'admin',
    //         roleName: currentUserSession.roleName || 'ADMIN',
    //         roleDesc: currentUserSession.roleDesc,
    //         avatar: 'https://i.pravatar.cc/150?img=68',
    //         joinDate: currentUserSession.createdAt,
    //         status: 'Aktif',
    //         email: currentUserSession.email,
    //         phone: '-',
    //         staffIds: [],
    //         leaderId: null,
    //         password: 'admin',
    //         points: 0,
    //     };
    // }
    const handleSignOut = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const response = await authApi.getProfile();
                
                const profileData = response.data?.data || response.data;

                setUser({
                    id: "",
                    name: profileData.employeeName || '-',
                    username: profileData.username || '-',
                    roleName: profileData.roleName || '-',
                    roleDesc: profileData.roleDesc || '-',
                    avatar: 'https://i.pravatar.cc/150?img=68',
                    joinDate: profileData.createdAt,
                    status: "",
                    email: "",
                    phone: "",
                    staffIds: [],
                    leaderId: "",
                    password: "",
                    points: "",
                });
            } catch (err) {
                console.error("Gagal memuat profil dari API:", err);
                handleSignOut();
            }
        };

        loadProfileData();
    }, []);

    // Form state untuk ganti password
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok dengan password baru!');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&._\-]{8,128}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Password baru minimal 8 karakter dan harus mengandung setidaknya 1 huruf besar, 1 huruf kecil, dan 1 angka.');
            return;
        }

        setIsSubmitting(true);
        try {
            await authApi.changePassword({
                oldPassword,
                newPassword,
                confirmPassword,
            });
            setSuccess('Password berhasil diperbarui!');
            
            // Reset form
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error('Gagal memperbarui password:', err);
            const backendMessage = err.response?.data?.message || err.response?.data || 'Gagal memperbarui password!';
            setError(backendMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans relative overflow-hidden flex justify-center">
            {/* Ambient eye-comfort background glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 blur-[130px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none z-0"></div>

            <div className="max-w-[1000px] w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Navigasi */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Kembali ke Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* KOLOM KIRI - Kartu Identitas Profil */}
                    <div className="col-span-1">
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[32px] p-8 flex flex-col items-center shadow-[0_15px_40px_rgba(30,58,138,0.03)] text-center">
                            <div className="relative mb-5">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                                    <img src={user.avatar || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-800">{user.name}</h2>
                            <p className="text-blue-500 font-bold text-sm mt-1 mb-4">@{user.username}</p>
                            
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black tracking-widest uppercase border border-indigo-100 mb-6">
                                {user.roleName}
                            </span>
                            
                            <div className="w-full h-px bg-slate-100 mb-6"></div>
                            
                            <div className="w-full flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-400">Bergabung Sejak</span>
                                <span className="font-extrabold text-slate-700">{user.joinDate || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN - Konten Utama */}
                    <div className="col-span-1 lg:col-span-2 space-y-8">
                        
                        {/* BLOK STATISTIK DINAMIS (Kondisional) */}
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[32px] p-8 shadow-[0_15px_40px_rgba(30,58,138,0.03)]">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Informasi Pekerjaan
                            </h3>
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 ms-7">
                                {user.roleDesc}
                            </h3>
                            {user.roleName === 'Staff IT' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                        <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-2">Total Poin Performa</p>
                                        <p className="text-4xl font-black text-blue-600">{user.points || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                        <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-2">Status Kesiapan</p>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mt-1 ${user.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {user.status || 'Aktif'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {user.roleName === 'Head IT' && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-black tracking-widest text-blue-400 uppercase mb-1">Total Staff Dikelola</p>
                                        <p className="text-3xl font-black text-blue-900">{user.staffIds?.length || 0} Orang</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                </div>
                            )}

                            {user.roleName === 'ADMIN' && (
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 flex items-center gap-4 text-white shadow-lg">
                                    <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center shrink-0 border border-slate-600">
                                        <span className="text-xl">🛡️</span>
                                    </div>
                                    <div>
                                        <p className="font-black tracking-wide text-sm">Hak Akses Eksklusif</p>
                                        <p className="text-slate-400 text-xs font-semibold mt-1">Master Admin Control - Sistem Kendali Penuh</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BLOK KEAMANAN (Password) */}
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[32px] p-8 shadow-[0_15px_40px_rgba(30,58,138,0.03)]">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Pengaturan Keamanan
                            </h3>
                                                     <form onSubmit={handlePasswordChange} className="space-y-4">
                                {error && (
                                    <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl border border-rose-100 flex items-center gap-2 animate-fade-in">
                                        <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}
                                {success && (
                                    <div className="p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-2xl border border-emerald-100 flex items-center gap-2 animate-fade-in">
                                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{success}</span>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password Lama</label>
                                    <input 
                                        type="password" 
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-700 font-bold text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password Baru</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-700 font-bold text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Konfirmasi Password</label>
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-700 font-bold text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className={`w-full sm:w-auto px-8 py-3.5 text-white font-black rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                            isSubmitting 
                                            ? 'bg-emerald-400 cursor-not-allowed' 
                                            : 'bg-[#22c55e] hover:bg-[#16a34a] shadow-[0_8px_20px_rgba(34,197,94,0.3)]'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                Simpan Password Baru
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
