// ============================================================================
// IMPLEMENTATION EXAMPLES - Cara Menggunakan useAppContext
// ============================================================================

// ====================
// CONTOH 1: Di TambahUser.tsx - Add New User dengan Validasi
// ====================

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export function TambahUserExample() {
    const { addUser, getHeadITList, getStaffITList } = useAppContext();
    const [formData, setFormData] = useState({
        namaLengkap: '',
        username: '',
        email: '',
        noTelepon: '',
        role: 'STAFF_IT' as const
    });
    const [selectedLeader, setSelectedLeader] = useState<any>(null);
    const [message, setMessage] = useState({ type: 'success' | 'error', text: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Siapkan user data
        const newUser = {
            namaLengkap: formData.namaLengkap,
            username: formData.username,
            email: formData.email,
            noTelepon: formData.noTelepon,
            role: formData.role,
            status: 'ACTIVE' as const,
            leaderId: formData.role === 'STAFF_IT' ? selectedLeader?.id : undefined
        };

        // Gunakan addUser dari Context
        // Fitur validasi otomatis:
        // - Cek duplikasi username (case-insensitive)
        // - Cek duplikasi email
        // - Auto-generate ID
        // - Auto-set avatar
        // - Auto-sync ke localStorage
        const result = addUser(newUser);

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            // Reset form
            setFormData({ namaLengkap: '', username: '', email: '', noTelepon: '', role: 'STAFF_IT' });
            setSelectedLeader(null);
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Error/Success Display */}
            {message.text && (
                <div className={message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}>
                    {message.text}
                </div>
            )}

            {/* Form Fields */}
            <input
                type="text"
                placeholder="Nama Lengkap"
                value={formData.namaLengkap}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                required
            />

            <input
                type="text"
                placeholder="Username (unique)"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
            />

            <input
                type="email"
                placeholder="Email (unique)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
            />

            <input
                type="tel"
                placeholder="Nomor Telepon"
                value={formData.noTelepon}
                onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                required
            />

            {/* Role Selection */}
            <select
                value={formData.role}
                onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value as 'STAFF_IT' | 'HEAD_IT' });
                    setSelectedLeader(null);
                }}
            >
                <option value="STAFF_IT">Staff IT</option>
                <option value="HEAD_IT">Head IT</option>
            </select>

            {/* Pilih Leader jika STAFF_IT */}
            {formData.role === 'STAFF_IT' && (
                <select
                    onChange={(e) => {
                        const leader = getHeadITList().find(l => l.id === e.target.value);
                        setSelectedLeader(leader || null);
                    }}
                >
                    <option value="">Pilih Leader</option>
                    {getHeadITList().map(l => (
                        <option key={l.id} value={l.id}>{l.namaLengkap}</option>
                    ))}
                </select>
            )}

            <button type="submit">Registrasi User</button>
        </form>
    );
}

// ====================
// CONTOH 2: Di DashboardHead.tsx - Filter Staff Berdasarkan Leader
// ====================

import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';

export function DashboardHeadExample() {
    const { currentUser, getStaffsByLeader } = useAppContext();
    const [assignedStaffs, setAssignedStaffs] = useState<User[]>([]);

    useEffect(() => {
        if (currentUser && currentUser.role === 'HEAD_IT') {
            // getStaffsByLeader otomatis filter:
            // - Hanya role === 'STAFF_IT'
            // - Hanya leadership === currentUser.id
            const staffs = getStaffsByLeader(currentUser.id);
            setAssignedStaffs(staffs);
        }
    }, [currentUser, getStaffsByLeader]);

    return (
        <div>
            <h2>Tim Anda ({assignedStaffs.length} staff)</h2>

            {assignedStaffs.length === 0 ? (
                <p>Belum ada staff yang ditugaskan.</p>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {assignedStaffs.map(staff => (
                        <div key={staff.id} className="card">
                            <img src={staff.avatar} alt={staff.namaLengkap} />
                            <h3>{staff.namaLengkap}</h3>
                            <p>{staff.email}</p>
                            <p>Status: <span className={staff.status === 'ACTIVE' ? 'green' : 'red'}>
                                {staff.status}
                            </span></p>
                            <p>Bergabung: {staff.joinDate}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ====================
// CONTOH 3: Di DashboardAdmin.tsx - Manage All Users & Change Status
// ====================

import { useAppContext } from '../context/AppContext';

export function DashboardAdminExample() {
    const { users, changeUserStatus } = useAppContext();

    const handleStatusToggle = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' as const : 'ACTIVE' as const;
            changeUserStatus(userId, newStatus);
            // Data otomatis update di seluruh component yang subscribe ke Context
        }
    };

    return (
        <div>
            <h2>Kelola Semua Users ({users.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Email</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>
                                <img src={user.avatar} alt={user.namaLengkap} width={30} />
                                {user.namaLengkap}
                            </td>
                            <td>{user.role}</td>
                            <td>
                                <span className={user.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}>
                                    {user.status}
                                </span>
                            </td>
                            <td>{user.email}</td>
                            <td>
                                <button onClick={() => handleStatusToggle(user.id)}>
                                    {user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ====================
// CONTOH 4: Di Login.tsx - Set Current User
// ====================

import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function LoginExample() {
    const navigate = useNavigate();
    const { users, setCurrentUser } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Cari user di Context
        const foundUser = users.find(
            u => u.username.toLowerCase() === username.toLowerCase()
        );

        if (foundUser) {
            // Set current user di Context
            // Data akan:
            // - Tersimpan di Context state (real-time access di component)
            // - Disimpan ke localStorage (persist across refreshes)
            setCurrentUser({
                id: foundUser.id,
                username: foundUser.username,
                role: foundUser.role,
                namaLengkap: foundUser.namaLengkap
            });

            // Navigate berdasarkan role
            const redirectUrl = foundUser.role === 'ADMIN' ? '/dashboard-admin' : '/dashboard';
            navigate(redirectUrl);
        } else {
            alert('Username atau password salah');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Login</button>
        </form>
    );
}

// ====================
// CONTOH 5: Get User By ID atau List By Role
// ====================

import { useAppContext } from '../context/AppContext';

export function DataFetchingExample() {
    const { getUserById, getHeadITList, getStaffITList, users } = useAppContext();

    // Get specific user
    const getSpecificUser = () => {
        const user = getUserById('USR001');
        console.log('User:', user?.namaLengkap); // "Ariana"
    };

    // Get all by role
    const getAllHeadITs = () => {
        const heads = getHeadITList();
        console.log('Total Head IT:', heads.length); // 3
        heads.forEach(h => console.log(`- ${h.namaLengkap}`));
    };

    const getAllStaffs = () => {
        const staffs = getStaffITList();
        console.log('Total Staff IT:', staffs.length); // 6
    };

    // Get all users
    const getAllUsers = () => {
        console.log('Total users:', users.length); // 9
    };

    return (
        <div>
            <button onClick={getSpecificUser}>Get Specific User</button>
            <button onClick={getAllHeadITs}>Get Head ITs</button>
            <button onClick={getAllStaffs}>Get Staffs</button>
            <button onClick={getAllUsers}>Get All Users</button>
        </div>
    );
}

// ====================
// CONTOH 6: Update User Data
// ====================

import { useAppContext } from '../context/AppContext';

export function UpdateUserExample() {
    const { updateUser, getUserById } = useAppContext();

    const handleUpdateUser = (userId: string) => {
        // Update bisa untuk field apapun
        updateUser(userId, {
            email: 'newemail@gmail.com',
            noTelepon: '081234567890'
        });
        // Data otomatis sync ke localStorage
    };

    return (
        <button onClick={() => handleUpdateUser('USR001')}>
            Update Ariana Email
        </button>
    );
}

// ====================
// CONTOH 7: Logout
// ====================

import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function LogoutExample() {
    const navigate = useNavigate();
    const { logout } = useAppContext();

    const handleLogout = () => {
        logout();
        // - Clear currentUser dari Context
        // - Clear localStorage CURRENT_USER_KEY
        navigate('/login');
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

// ====================
// CONTOH 8: Real-time Sync Demo
// ====================

import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

/**
 * Demo: Ketika satu component add user, langsung terlihat di component lain
 * - Component A: Add user baru
 * - Component B: Otomatis render dengan user baru (tanpa refresh)
 */

function ComponentA() {
    const { addUser } = useAppContext();

    const handleAddNewUser = () => {
        addUser({
            namaLengkap: 'User Baru',
            username: 'user.baru',
            email: 'user@baru.com',
            noTelepon: '081234567890',
            role: 'STAFF_IT',
            status: 'ACTIVE',
            leaderId: 'USR001'
        });
    };

    return (
        <button onClick={handleAddNewUser}>
            Add User di Component A
        </button>
    );
}

function ComponentB() {
    const { users } = useAppContext();

    return (
        <div>
            <h3>Lihat Users di Component B ({users.length})</h3>
            <ul>
                {users.map(u => (
                    <li key={u.id}>{u.namaLengkap}</li>
                ))}
            </ul>
            {/* Ketika ComponentA add user, list di sini instan update! */}
        </div>
    );
}

// Usage:
// <ComponentA />
// <ComponentB /> {/* Akan lihat update real-time dari ComponentA */}

export { ComponentA, ComponentB };

