import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../assets/logolandscape.png';
import { useUserContext, type User } from '../context/UserContext';
import { authApi } from '../api/authApi';

interface BackendEmployee {
    id?: string;
    employeeName?: string;
    userName?: string;
    email?: string;
    noHp?: string;
    roleName?: string;
    roleDesc?: string;
    accountStatus?: string;
    createdAt?: string;
    updatedAt?: string;
    leaderName?: string;
    leadID?: string;
}

const normalizeRoleName = (roleName?: string): User['roleName'] => {
    const normalized = roleName?.toUpperCase();
    if (normalized === 'LEAD') return 'Head IT';
    if (normalized === 'ADMINISTRATOR' || normalized === 'ADMIN') return 'ADMIN';
    return 'Staff IT';
};

const normalizeStatus = (accountStatus?: string, updatedAt?: string): User['status'] => {
    if (accountStatus?.toUpperCase() === 'INACTIVE' || updatedAt) return 'Non Aktif';
    return 'Aktif';
};

const mapEmployeeToUser = (employee: BackendEmployee, index: number): User & { leaderName?: string } => {
    const roleName = normalizeRoleName(employee.roleName);
    const status = normalizeStatus(employee.accountStatus, employee.updatedAt);

    return {
        id: employee.id || employee.userName || `employee-${index}`,
        name: employee.employeeName || '-',
        username: employee.userName || '-',
        email: employee.email || '-',
        phone: employee.noHp || '-',
        roleName,
        roleDesc: employee.roleDesc || employee.roleName || roleName,
        staffIds: [],
        leaderId: employee.leadID || null,
        joinDate: employee.createdAt || '-',
        inactiveDate: employee.updatedAt,
        status,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(employee.userName || employee.employeeName || String(index))}`,
        password: '',
        points: 0,
        leaderName: employee.leaderName,
    };
};

// ============================================================
// KOMPONEN GELOMBANG BIRU
// ============================================================
const BlueWave = () => (
    <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 170" className="w-full h-[130px]" preserveAspectRatio="none">
            <defs>
                <filter id="waveHeadShadow">
                    <feDropShadow dx="0" dy="-6" stdDeviation="12" floodColor="#3B82F6" floodOpacity="0.15" />
                </filter>
            </defs>
            <path fill="#3B82F6" filter="url(#waveHeadShadow)" d="M0,120 C240,170 480,60 720,110 C960,160 1180,50 1440,100 L1440,170 L0,170 Z" opacity="0.28" />
            <path fill="#2563EB" d="M0,145 C180,110 360,165 540,135 C720,105 900,158 1080,125 C1200,105 1360,155 1440,142 L1440,170 L0,170 Z" opacity="0.42" />
        </svg>
    </div>
);

export default function DashboardAdmin() {
    const navigate = useNavigate();
    const { users: contextUsers, removeUser, updateUser, getStaffs } = useUserContext();
    const contextUsersRef = useRef(contextUsers);

    // ================= STATE =================
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Role');
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [users, setUsers] = useState<(User & { leaderName?: string })[]>([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [employeeLoadError, setEmployeeLoadError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<(User & { leaderName?: string }) | null>(null);
    const [deleteConfirmUser, setDeleteConfirmUser] = useState<(User & { leaderName?: string }) | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    
    // Edit State
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState<{name: string, username: string, email: string, phone: string, leaderId?: string | null, staffIds?: string[]}>({ name: '', username: '', email: '', phone: '', leaderId: null, staffIds: [] });

    // Session dari localStorage
    const sessionRaw = localStorage.getItem('currentUser');
    const currentUser = sessionRaw ? JSON.parse(sessionRaw) : { id: 'admin', username: 'Admin Master', roleName: 'ADMINISTRATOR' };
    
    // ================= FUNGSI =================
    useEffect(() => {
        const loadEmployees = async () => {
            setIsLoadingEmployees(true);
            setEmployeeLoadError(null);

            try {
                const response = await authApi.getEmployees();
                const employeeList = Array.isArray(response) ? response : response?.data ?? [];
                setUsers(employeeList.map(mapEmployeeToUser));
            } catch (error) {
                console.error('[getEmployees] error:', error);
                setEmployeeLoadError('Gagal memuat data karyawan dari backend.');
                setUsers(contextUsersRef.current);
            } finally {
                setIsLoadingEmployees(false);
            }
        };

        loadEmployees();
    }, []);

    const openEditModal = (user: User) => {
        setEditFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            leaderId: user.leaderId || null,
            staffIds: user.staffIds || []
        });
        setEditUser(user);
    };


    const handleRemoveUser = (user: User) => {
        removeUser(user.id);
        setUsers(prev => prev.filter(item => String(item.id) !== String(user.id)));
        setDeleteConfirmUser(null);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;
        updateUser(editUser.id, editFormData);
        setEditUser(null);
    };

    const handleSignOut = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    // Filter Data
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All Role' || user.roleName === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Statistik
    const totalAktif = users.filter(u => u.status === 'Aktif').length;
    const totalHeadIT = users.filter(u => u.roleName === 'Head IT').length;
    const totalStaff = users.filter(u => u.roleName === 'Staff IT').length;

    return (
        <div className="flex h-screen bg-[#F0F6FF] font-sans overflow-hidden relative">

            {/* Ambient blobs */}
            <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-200/20 blur-[130px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-indigo-200/15 blur-[100px] pointer-events-none z-0" />

            {/* ============ OVERLAY MOBILE ============ */}
            {isSidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* ============ SIDEBAR BIRU ============ */}
            <div className={`fixed md:relative z-50 h-full ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20'} bg-gradient-to-b from-blue-600 via-blue-600 to-indigo-700 shadow-2xl transition-all duration-300 ease-in-out flex flex-col shrink-0 border-r border-blue-500/30`}>

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="hidden md:block absolute -right-3.5 top-8 bg-white text-slate-800 rounded-full p-1.5 shadow-md hover:scale-110 hover:text-blue-600 transition-all border border-slate-100 z-50"
                >
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${!isSidebarOpen && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="h-24 flex items-center justify-center border-b border-blue-500/30 mt-2 pb-4 px-3 relative overflow-hidden">
                    <div className={`flex items-center justify-start transition-all duration-300 ${isSidebarOpen ? 'w-full h-16' : 'w-12 h-12'}`}>
                        <img
                            src={LogoImg}
                            alt="Logo IT Helpdesk"
                            className={`transition-all duration-300 origin-left drop-shadow-md filter brightness-110 max-w-none ${isSidebarOpen ? 'h-full object-contain scale-[2.9] ml-2' : 'h-full object-cover scale-[2.5] ml-1.5'}`}
                        />
                    </div>
                </div>

                <div className="flex-1 py-6 flex flex-col gap-2.5 px-3.5 overflow-y-auto">
                    <div
                        onClick={() => setActiveMenu('dashboard')}
                        className={`flex items-center cursor-pointer transition-all duration-300 group ${isSidebarOpen ? 'gap-3.5 px-4 py-3 rounded-xl' : 'justify-center w-12 h-12 rounded-xl mx-auto'} ${activeMenu === 'dashboard' ? 'bg-white/20 text-white border-l-[3.5px] border-white' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        {isSidebarOpen && <span className="whitespace-nowrap text-[13px] tracking-wide uppercase font-bold">Dashboard</span>}
                    </div>

                    <div
                        onClick={() => navigate('/profile')}
                        className={`flex items-center cursor-pointer transition-all duration-300 group ${isSidebarOpen ? 'gap-3.5 px-4 py-3 rounded-xl' : 'justify-center w-12 h-12 rounded-xl mx-auto'} text-blue-100/80 hover:bg-white/10 hover:text-white`}
                    >
                        <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {isSidebarOpen && <span className="whitespace-nowrap text-[13px] tracking-wide uppercase font-bold">Profile</span>}
                    </div>

                    <div
                        onClick={() => { setActiveMenu('tambah-user'); navigate('/tambah-user'); }}
                        className={`flex items-center cursor-pointer transition-all duration-300 group ${isSidebarOpen ? 'gap-3.5 px-4 py-3 rounded-xl' : 'justify-center w-12 h-12 rounded-xl mx-auto'} ${activeMenu === 'tambah-user' ? 'bg-white/20 text-white border-l-[3.5px] border-white' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        {isSidebarOpen && <span className="whitespace-nowrap text-[13px] tracking-wide uppercase font-bold">Tambah User</span>}
                    </div>
                    {/* Sign Out Button in Sidebar */}
                    <div
                        onClick={handleSignOut}
                        className="mt-auto flex items-center gap-3.5 text-blue-100/80 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-100 group"
                    >
                        <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span className={`whitespace-nowrap text-[13px] tracking-wide transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>SIGN OUT</span>
                    </div>
                </div>
            </div>

            {/* ============ MAIN CONTENT ============ */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <BlueWave />

                {/* Navbar Mobile */}
                <div className="md:hidden bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm z-30 border-b border-slate-100">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black uppercase tracking-widest text-[#3B82F6]">Welcome Back</p>
                            <p className="text-sm font-extrabold text-slate-800">{currentUser.username}</p>
                        </div>
                        <div 
                            onClick={() => navigate('/profile')}
                            className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center p-0.5 shadow-inner cursor-pointer hover:scale-105 transition-transform"
                        >
                            <img src={users.find(u => u.name === currentUser.username)?.avatar || 'https://i.pravatar.cc/150?img=68'} alt="User" className="w-full h-full rounded-full object-cover" />
                        </div>
                    </div>
                </div>

                <div className="px-8 pt-6 pb-0 shrink-0 z-20">
                    <div className="bg-white/80 backdrop-blur-md rounded-[28px] border border-white/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_8px_30px_rgba(59,130,246,0.06)]">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="bg-slate-50 border border-slate-200/80 rounded-full px-5 py-2.5 flex items-center gap-2.5 w-64 focus-within:ring-2 focus-within:ring-blue-300/50 focus-within:border-blue-400 focus-within:bg-white transition-all shadow-sm">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Cari nama karyawan..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 w-full placeholder-slate-400"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-slate-50 border border-slate-200/80 rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 appearance-none cursor-pointer pr-9 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                >
                                    <option>All Role</option>
                                    <option>Head IT</option>
                                    <option>Staff IT</option>
                                </select>
                                <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* <button
                                onClick={() => navigate('/tambah-user')}
                                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all font-bold text-sm active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Tambah User
                            </button> */}
                        </div>

                        <div className="hidden md:flex items-center gap-4 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-200/60 shadow-sm">
                            <div className="text-right">
                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-600">Welcome Back</p>
                                <p className="text-[14px] font-extrabold text-slate-800">{currentUser.username}</p>
                            </div>
                            <div 
                                onClick={() => navigate('/profile')}
                                className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-white cursor-pointer hover:scale-105 transition-transform"
                            >
                                <img src={users.find(u => u.name === currentUser.username)?.avatar || 'https://i.pravatar.cc/150?img=68'} alt="User" className="w-full h-full rounded-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pt-5 pb-2 shrink-0 z-10">
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total Aktif', value: totalAktif, color: 'text-[#3B82F6]', bg: 'bg-blue-50 border-blue-100', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                            { label: 'Head IT Aktif', value: totalHeadIT, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                            { label: 'Staff IT Aktif', value: totalStaff, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                        ].map((s, i) => (
                            <div key={i} className={`${s.bg} border rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm`}>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                    <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl ${s.bg} border flex items-center justify-center`}>
                                    <svg className={`w-5 h-5 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pt-4 pb-8 relative z-10">
                    {employeeLoadError && (
                        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-5 py-3 text-sm font-bold">
                            {employeeLoadError}
                        </div>
                    )}

                    {isLoadingEmployees ? (
                        <div className="bg-white/70 rounded-3xl border border-slate-100 p-16 flex flex-col items-center text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50 mb-4"></div>
                            <p className="text-slate-400 font-bold text-sm">Memuat data karyawan...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="bg-white/70 rounded-3xl border border-slate-100 p-16 flex flex-col items-center text-center">
                            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-slate-400 font-bold text-sm">Karyawan tidak ditemukan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {paginatedUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white/90 backdrop-blur-sm rounded-[28px] p-6 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(59,130,246,0.04)] border border-slate-100/80 hover:border-blue-100 hover:shadow-[0_15px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-300 relative z-10"
                                >
                                    <div className="relative inline-block">
                                        <div className="w-20 h-20 rounded-full shadow-sm overflow-hidden bg-white border-[3px] border-white ring-2 ring-slate-100">
                                            <img src={user.avatar} alt={user.name} className={`w-full h-full object-cover transition-all ${user.status === 'Non Aktif' ? 'grayscale opacity-70' : ''}`} />
                                        </div>
                                        <div className={`absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 border-white shadow-sm z-10 ${user.status === 'Aktif' ? 'bg-[#22c55e]' : 'bg-rose-500'}`} />
                                    </div>

                                    <h3 className="mt-4 text-[17px] font-black text-slate-800 leading-tight">{user.name}</h3>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">@{user.username}</p>

                                    <div className={`mt-2.5 px-3.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border shadow-sm ${user.roleName === 'Head IT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {user.roleName}
                                    </div>

                                    <div className="mt-4 w-full bg-slate-50 rounded-xl border border-slate-100 px-4 py-2.5 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bergabung</p>
                                            <p className="text-[11px] font-bold text-slate-600">{user.joinDate}</p>
                                        </div>
                                        {user.status === 'Non Aktif' ? (
                                            <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Diberhentikan</p>
                                                <p className="text-[11px] font-bold text-rose-600">{user.inactiveDate || user.joinDate}</p>
                                            </div>
                                        ) : user.roleName === 'Staff IT' && (
                                            <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leader</p>
                                                <p className="text-[11px] font-bold text-slate-600 truncate max-w-[100px]">{user.leaderName || (user.leaderId ? users.find(u => String(u.id) === String(user.leaderId))?.name || 'Terhubung' : '-')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* TOMBOL AKSI LANGSUNG (TANPA DROPDOWN) */}
                                    <div className="mt-5 flex items-center justify-center gap-2 w-full">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUser(user)}
                                            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2 rounded-full text-[11px] font-bold transition-colors active:scale-95 cursor-pointer"
                                        >
                                            Lihat
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openEditModal(user)}
                                            className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-500 hover:text-indigo-600 flex items-center justify-center transition-all active:scale-95 shrink-0"
                                            title="Edit Profil"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>

                                        {/* <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateUserStatus(user);
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[11px] font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer ${user.status === 'Aktif' ? 'bg-[#3B82F6] hover:bg-[#2563EB]' : 'bg-rose-500 hover:bg-rose-600'}`}
                                            title={user.status === 'Aktif' ? 'Klik untuk Non Aktifkan' : 'Klik untuk Aktifkan'}
                                        >
                                            {user.status}
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </button> */}

                                        {user.status === 'Non Aktif' && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (String(user.id) === String(currentUser.id)) {
                                                        setAlertMessage('Keamanan Terjaga: Anda tidak diperbolehkan men-delete akun Admin Anda sendiri!');
                                                        return;
                                                    }
                                                    setDeleteConfirmUser(user);
                                                }}
                                                className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-500 hover:text-rose-600 flex items-center justify-center transition-all active:scale-95 shrink-0"
                                                title="Hapus Permanen"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-5 flex items-center justify-center gap-2 w-full">
                                        <button
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[11px] font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer bg-[#3B82F6] hover:bg-[#2563EB]`}
                                            title={'Reset Password'}
                                        >
                                            Reset Password
                                        </button>
                                        <button
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[11px] font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer bg-rose-500 hover:bg-rose-600`}
                                            title={'Non Aktifkan'}
                                        >
                                            Non Aktifkan
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ================= PAGINATION ================= */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center pb-8">
                            <div className="bg-white/80 backdrop-blur-sm rounded-full flex items-center px-4 py-2 gap-2 shadow-sm border border-slate-200/50">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-50 font-bold transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm transition-colors ${currentPage === page ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-50 font-bold transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= MODAL PROFIL KARYAWAN ================= */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in transition-opacity" 
                        onClick={() => setSelectedUser(null)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative z-10 animate-scale-up overflow-hidden border border-white/80 ring-1 ring-slate-100/50">

                        {/* Modal Header Cover */}
                        <div className={`h-36 w-full relative ${selectedUser.status === 'Aktif' ? 'bg-gradient-to-br from-blue-500 via-[#3B82F6] to-blue-700' : 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700'}`}>
                            {/* Decorative element inside cover */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                            
                            <button 
                                type="button" 
                                onClick={() => setSelectedUser(null)} 
                                className="absolute top-4 right-4 text-white hover:bg-white/25 p-2 rounded-full transition-all backdrop-blur-md cursor-pointer active:scale-95 shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="absolute top-5 left-6">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-md ${selectedUser.status === 'Aktif' ? 'bg-white/20 text-white border-white/30' : 'bg-rose-500/80 text-white border-rose-400/50'}`}>
                                    {selectedUser.status === 'Aktif' ? '• Karyawan Aktif' : 'Karyawan Non Aktif'}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pb-8 pt-0 relative bg-white">
                            {/* Avatar Section */}
                            <div className="absolute -top-16 left-8 flex items-end">
                                <div className="w-[120px] h-[120px] rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <img 
                                        src={selectedUser.avatar} 
                                        alt="Avatar" 
                                        className={`w-full h-full object-cover -rotate-3 hover:rotate-0 transition-transform duration-300 ${selectedUser.status === 'Non Aktif' ? 'grayscale opacity-80' : ''}`} 
                                    />
                                </div>
                                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-[3px] border-white shadow-md z-10 ${selectedUser.status === 'Aktif' ? 'bg-[#22c55e]' : 'bg-rose-500'}`}></div>
                            </div>

                            {/* User Info Section */}
                            <div className="mt-[4.5rem]">
                                <h2 className="text-[26px] font-black text-slate-800 tracking-tight leading-none">{selectedUser.name}</h2>
                                <p className="text-sm font-bold text-blue-500 mt-1.5">@{selectedUser.username}</p>

                                <div className="flex flex-wrap gap-2.5 mt-5">
                                    <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black tracking-widest uppercase border shadow-sm ${selectedUser.roleName === 'Head IT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {selectedUser.roleName}
                                    </span>
                                    {selectedUser.roleName === 'Staff IT' && (selectedUser.leaderName || selectedUser.leaderId) && (
                                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black tracking-widest uppercase border border-blue-100 flex items-center gap-1.5 shadow-sm">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                            Leader: {selectedUser.leaderName || users.find(u => String(u.id) === String(selectedUser.leaderId))?.name || 'Terhubung'}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-7 space-y-3.5">
                                    {/* Email Card */}
                                    <div className="group bg-slate-50 hover:bg-white rounded-[20px] p-4 border border-slate-100 hover:border-blue-100 hover:shadow-[0_8px_20px_rgba(59,130,246,0.06)] transition-all duration-300 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[16px] bg-blue-100/70 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-inner">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Karyawan</p>
                                            <p className="text-[14px] font-bold text-slate-700 mt-0.5 truncate max-w-[200px]">{selectedUser.email}</p>
                                        </div>
                                    </div>

                                    {/* Join Date Card */}
                                    <div className="group bg-slate-50 hover:bg-white rounded-[20px] p-4 border border-slate-100 hover:border-green-100 hover:shadow-[0_8px_20px_rgba(34,197,94,0.06)] transition-all duration-300 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[16px] bg-green-100/70 text-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-inner">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Bergabung</p>
                                            <p className="text-[14px] font-bold text-slate-700 mt-0.5">{selectedUser.joinDate}</p>
                                        </div>
                                    </div>

                                    {/* Inactive Date Card (If Applicable) */}
                                    {selectedUser.status === 'Non Aktif' && (
                                        <div className="group bg-rose-50/50 hover:bg-white rounded-[20px] p-4 border border-rose-100 hover:border-rose-200 hover:shadow-[0_8px_20px_rgba(244,63,94,0.08)] transition-all duration-300 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[16px] bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-inner">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Diberhentikan</p>
                                                <p className="text-[14px] font-bold text-rose-700 mt-0.5">{selectedUser.inactiveDate || selectedUser.joinDate}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Warning Message for Inactive User */}
                                {selectedUser.status === 'Non Aktif' && (
                                    <div className="mt-6 px-5 py-4 bg-slate-50/80 border-l-4 border-rose-400 rounded-r-[16px] flex gap-3 items-start">
                                        <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                                            Karyawan ini telah dinonaktifkan dari sistem. Relasi dengan karyawan lain telah diputus dan akses login <strong className="text-rose-500">tidak diperbolehkan</strong>.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL KONFIRMASI DELETE ================= */}
            {deleteConfirmUser && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in transition-opacity" onClick={() => setDeleteConfirmUser(null)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-[340px] shadow-2xl relative z-10 animate-scale-up overflow-hidden p-6 text-center border border-white">
                        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Hapus Karyawan?</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                            Apakah Anda yakin ingin menghapus <strong className="text-slate-700">{deleteConfirmUser.name}</strong> secara permanen? Data yang telah dihapus tidak dapat dikembalikan.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmUser(null)}
                                className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all text-sm"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleRemoveUser(deleteConfirmUser);
                                }}
                                className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all shadow-md shadow-rose-200 text-sm"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL PERINGATAN UMUM ================= */}
            {alertMessage && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in transition-opacity" onClick={() => setAlertMessage(null)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-[340px] shadow-2xl relative z-10 animate-scale-up overflow-hidden p-6 text-center border border-white">
                        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Peringatan</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                            {alertMessage}
                        </p>
                        <button
                            type="button"
                            onClick={() => setAlertMessage(null)}
                            className="w-full py-2.5 rounded-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold transition-all shadow-md shadow-blue-200 text-sm"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MODAL EDIT KARYAWAN ================= */}
            {editUser && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in transition-opacity" onClick={() => setEditUser(null)}></div>
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative z-10 animate-scale-up overflow-hidden border border-white p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Edit Karyawan</h3>
                                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Perbarui Data Dasar</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.username}
                                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">No. Handphone</label>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Alamat Email</label>
                                <input
                                    type="email"
                                    required
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                                />
                            </div>

                            {/* Pilihan Leader (Khusus Staff IT) */}
                            {/* {editUser.roleName === 'Staff IT' && (
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Pilih Leader (Head IT)</label>
                                    <select
                                        value={editFormData.leaderId || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, leaderId: e.target.value || null })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="">— Tidak Terhubung (Lepas Leader) —</option>
                                        {getHeads().filter(h => h.status === 'Aktif').map(head => (
                                            <option key={head.id} value={head.id}>{head.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )} */}

                            {/* Pilihan Staffs (Khusus Head IT) */}
                            {editUser.roleName === 'Head IT' && (
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Pilih Staff IT (Bawahan)</label>
                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-2.5">
                                        {getStaffs().filter(s => s.status === 'Aktif' || editFormData.staffIds?.includes(String(s.id))).length === 0 ? (
                                            <p className="text-xs text-slate-400 italic text-center py-2">Tidak ada Staff IT Aktif tersedia.</p>
                                        ) : (
                                            getStaffs()
                                                .filter(s => s.status === 'Aktif' || editFormData.staffIds?.includes(String(s.id)))
                                                .map(staff => {
                                                    const isSelected = editFormData.staffIds?.includes(String(staff.id));
                                                    const isOwnedByOther = staff.leaderId && staff.leaderId !== String(editUser.id);
                                                    return (
                                                        <label key={staff.id} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected || false}
                                                                    onChange={(e) => {
                                                                        const current = editFormData.staffIds || [];
                                                                        if (e.target.checked) {
                                                                            setEditFormData({ ...editFormData, staffIds: [...current, String(staff.id)] });
                                                                        } else {
                                                                            setEditFormData({ ...editFormData, staffIds: current.filter(id => id !== String(staff.id)) });
                                                                        }
                                                                    }}
                                                                    className="w-5 h-5 rounded-[6px] border-slate-300 text-indigo-500 focus:ring-indigo-400 transition-all cursor-pointer peer"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{staff.name}</span>
                                                                {isOwnedByOther && !isSelected && (
                                                                    <span className="text-[10px] font-bold text-rose-400">Sudah terhubung ke leader lain</span>
                                                                )}
                                                            </div>
                                                        </label>
                                                    );
                                                })
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditUser(null)}
                                    className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all shadow-[0_8px_20px_rgba(99,102,241,0.25)] text-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
