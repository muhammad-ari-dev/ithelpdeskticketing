import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// ============================================================
// TIPE DATA
// ============================================================
export interface User {
    id: string; // Tetap string untuk standar data baru
    name: string;
    username: string;
    email: string;
    phone: string;
    role: 'Head IT' | 'Staff IT' | 'ADMIN';
    staffIds: string[];
    leaderId: string | null;
    joinDate: string;
    inactiveDate?: string;
    status: 'Aktif' | 'Non Aktif';
    avatar: string;
    password: string;
    points: number;
}

interface UserContextType {
    users: User[];
    addUser: (userData: Omit<User, 'id' | 'status' | 'avatar' | 'password' | 'inactiveDate' | 'points'>) => void;
    updateUserStatus: (userId: string | number, newStatus: 'Aktif' | 'Non Aktif') => void;
    updateUser: (userId: string | number, updatedData: Partial<User>) => void;
    removeUser: (userId: string | number) => void;
    getUserById: (userId: string | number) => User | undefined;
    getHeads: () => User[];
    getStaffs: () => User[];
    updateUserPoints: (userId: string | number, delta: number) => void;
}

// ============================================================
// SMTP SIMULATION
// ============================================================
function sendWelcomeEmail(email: string, username: string, password: string) {
    console.group('📧 [SMTP SIMULATION] Email Terkirim');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`TO: ${email}`);
    console.log(`SUBJECT: Selamat Datang di IT Helpdesk - Kredensial Login Anda`);
    console.log('─────────────────────────────────────');
    console.log(`Halo ${username},`);
    console.log(`Akun Anda telah berhasil dibuat oleh Admin.`);
    console.log(`Username : ${username}`);
    console.log(`Password : ${password}`);
    console.log(`\nSegera login di: http://localhost:5173/login`);
    console.log(`Harap ganti password setelah login pertama Anda.`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.groupEnd();
}

/*const STORAGE_KEY = 'itticketing_users';
function loadUsersFromStorage(): User[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // FIX: Jika data terbungkus array ganda [[...]], ratakan menjadi satu array [...]
            const flattened = Array.isArray(parsed[0]) ? parsed[0] : parsed;
            return Array.isArray(flattened) ? flattened : [];
        }
    } catch (e) {
        console.error("Gagal membaca data, mereset penyimpanan:", e);
        localStorage.removeItem(STORAGE_KEY); // Hapus data yang rusak
    }
    return [];
}*/

// ============================================================
// CONTEXT
// ============================================================
const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);

    // Sync ke localStorage setiap kali users berubah
    /*useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }, [users]);*/

    // Tambah user baru
    const addUser = (userData: Omit<User, 'id' | 'status' | 'avatar' | 'password' | 'inactiveDate' | 'points'>) => {
        const newId = `u${Date.now()}`;
        const defaultPassword = 'password123';
        const avatarNum = Math.floor(Math.random() * 70) + 1;

        let formattedJoinDate = userData.joinDate;
        if (userData.joinDate && userData.joinDate.includes('-')) {
            const [y, m, d] = userData.joinDate.split('-');
            formattedJoinDate = `${d}/${m}/${y}`;
        }

        const newUser: User = {
            id: newId,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            staffIds: userData.staffIds || [],
            leaderId: userData.leaderId || null,
            joinDate: formattedJoinDate,
            status: 'Aktif',
            avatar: `https://i.pravatar.cc/150?img=${avatarNum}`,
            password: defaultPassword,
            points: 0,
        };

        setUsers(prev => {
            let updated = [...prev, newUser];

            // Jika Staff IT, update leader's staffIds
            if (newUser.role === 'Staff IT' && newUser.leaderId) {
                updated = updated.map(u =>
                    String(u.id) === String(newUser.leaderId)
                        ? { ...u, staffIds: [...u.staffIds, newId] }
                        : u
                );
            }

            // Jika Head IT, update tiap staff yang dipilih untuk leaderId
            if (newUser.role === 'Head IT' && newUser.staffIds.length > 0) {
                updated = updated.map(u =>
                    newUser.staffIds.includes(String(u.id))
                        ? { ...u, leaderId: newId }
                        : u
                );
            }

            return updated;
        });

        sendWelcomeEmail(userData.email, userData.username, defaultPassword);
    };

    // Ubah status user (Mendukung tipe string dan number untuk toleransi ID dummy)
    const updateUserStatus = (userId: string | number, newStatus: 'Aktif' | 'Non Aktif') => {
        const today = new Date();
        const inactiveDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        const targetIdStr = String(userId);

        setUsers(prev => {
            // Update status dan hapus relasi bagi user yang dinonaktifkan
            let updated = prev.map(u => {
                if (String(u.id) === targetIdStr) {
                    return {
                        ...u,
                        status: newStatus,
                        inactiveDate: newStatus === 'Non Aktif' ? inactiveDate : undefined,
                        // Putuskan relasi jika di-nonaktifkan
                        leaderId: newStatus === 'Non Aktif' ? null : u.leaderId,
                        staffIds: newStatus === 'Non Aktif' ? [] : u.staffIds
                    };
                }
                return u;
            });

            // Bersihkan jejak referensi user ini dari karyawan lain jika dia Non Aktif
            if (newStatus === 'Non Aktif') {
                updated = updated.map(u => {
                    if (u.leaderId === targetIdStr) {
                        return { ...u, leaderId: null };
                    }
                    if (u.staffIds.includes(targetIdStr)) {
                        return { ...u, staffIds: u.staffIds.filter(id => id !== targetIdStr) };
                    }
                    return u;
                });
            }

            return updated;
        });
    };

    // Hapus user serta bersihkan referensi relasi mereka agar tidak rusak
    const removeUser = (userId: string | number) => {
        const targetIdStr = String(userId);

        setUsers(prev => {
            // 1. Filter keluar user yang dihapus
            const filtered = prev.filter(u => String(u.id) !== targetIdStr);

            // 2. Bersihkan jejak ID user tersebut dari relasi karyawan lain
            return filtered.map(u => {
                // Jika yang dihapus adalah Leader, set leaderId staff-nya kembali menjadi null
                if (u.leaderId === targetIdStr) {
                    return { ...u, leaderId: null };
                }
                // Jika yang dihapus adalah Staff, hapus ID staff tersebut dari list staffIds si Leader
                if (u.staffIds.includes(targetIdStr)) {
                    return { ...u, staffIds: u.staffIds.filter(id => id !== targetIdStr) };
                }
                return u;
            });
        });
    };

    // Update keseluruhan data user termasuk logika sinkronisasi Leader dan Staff
    const updateUser = (userId: string | number, updatedData: Partial<User>) => {
        setUsers(prev => {
            let updated = prev;
            const targetIdStr = String(userId);
            const currentUserData = prev.find(u => String(u.id) === targetIdStr);
            if (!currentUserData) return prev;

            // Sinkronisasi relasi: Staff IT mengubah leaderId
            if (updatedData.leaderId !== undefined && updatedData.leaderId !== currentUserData.leaderId) {
                updated = updated.map(u => {
                    // Hapus dari staffIds leader lama
                    if (currentUserData.leaderId && String(u.id) === String(currentUserData.leaderId)) {
                        return { ...u, staffIds: u.staffIds.filter(id => id !== targetIdStr) };
                    }
                    // Tambahkan ke staffIds leader baru
                    if (updatedData.leaderId && String(u.id) === String(updatedData.leaderId)) {
                        return { ...u, staffIds: [...u.staffIds, targetIdStr] };
                    }
                    return u;
                });
            }

            // Sinkronisasi relasi: Head IT mengubah staffIds
            if (updatedData.staffIds !== undefined) {
                const oldStaffs = currentUserData.staffIds || [];
                const newStaffs = updatedData.staffIds || [];
                const addedStaffs = newStaffs.filter(id => !oldStaffs.includes(id));
                const removedStaffs = oldStaffs.filter(id => !newStaffs.includes(id));

                updated = updated.map(u => {
                    if (removedStaffs.includes(String(u.id))) {
                        return { ...u, leaderId: null };
                    }
                    if (addedStaffs.includes(String(u.id))) {
                        return { ...u, leaderId: targetIdStr };
                    }
                    return u;
                });
            }

            // Update user target
            return updated.map(u => {
                if (String(u.id) === targetIdStr) {
                    return { ...u, ...updatedData };
                }
                return u;
            });
        });
    };

    const updateUserPoints = (userId: string | number, delta: number) => {
        setUsers(prev => prev.map(u => {
            if (String(u.id) === String(userId)) {
                // Jangan biarkan poin di bawah 0 jika tidak diinginkan, tapi dalam sistem sanksi poin bisa minus.
                // Disini kita membolehkan poin negatif.
                return { ...u, points: (u.points || 0) + delta };
            }
            return u;
        }));
    };

    const getUserById = (userId: string | number) => users.find(u => String(u.id) === String(userId));
    const getHeads = () => users.filter(u => u.role === 'Head IT');
    const getStaffs = () => users.filter(u => u.role === 'Staff IT');

    return (
        <UserContext.Provider value={{ users, addUser, updateUserStatus, updateUser, removeUser, getUserById, getHeads, getStaffs, updateUserPoints }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUserContext harus dipakai di dalam <UserProvider>');
    return ctx;
};