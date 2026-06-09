# IT Ticketing - React Context API Implementation Guide

## 📋 Overview
Panduan lengkap untuk menggunakan React Context API dalam sistem IT Ticketing untuk state management global dengan fitur sinkronisasi localStorage dan role-based data filtering.

---

## 🏗️ Arsitektur

### Data Structure
```typescript
// User dengan relasi leader/staff
interface User {
    id: string;
    namaLengkap: string;
    username: string;
    email: string;
    noTelepon: string;
    role: 'ADMIN' | 'HEAD_IT' | 'STAFF_IT';
    status: 'ACTIVE' | 'INACTIVE';
    avatar?: string;
    joinDate?: string;
    // Untuk Staff IT: ID Head IT yang memimpin
    leaderId?: string;
    // Untuk Head IT: Array ID Staff IT yang ditugaskan
    assignedStaffs?: string[];
}
```

### Context Structure
```typescript
interface AppContextType {
    // Data
    users: User[];
    currentUser: CurrentUser | null;
    
    // User Management Functions
    addUser(userData): { success: boolean; message: string };
    updateUser(id, userData): void;
    changeUserStatus(id, newStatus): void;
    
    // Filtering & Getter Functions
    getStaffsByLeader(leaderId): User[];
    getHeadITList(): User[];
    getStaffITList(): User[];
    getUserById(id): User | undefined;
    
    // Auth Functions
    setCurrentUser(user): void;
    logout(): void;
}
```

---

## 🚀 Quick Start

### 1. Setup AppProvider di App.tsx
```tsx
import { AppProvider } from './context/AppContext';

export default function App() {
    return (
        <AppProvider>
            <Router>
                {/* Routes */}
            </Router>
        </AppProvider>
    );
}
```

### 2. Import & Gunakan Hook di Component
```tsx
import { useAppContext } from '../context/AppContext';

function MyComponent() {
    const { users, currentUser, addUser } = useAppContext();
    
    // Gunakan sesuai kebutuhan
}
```

---

## 💡 Use Cases & Implementasi

### Use Case 1: Add User Baru (Admin di TambahUser.tsx)

**Scenario:** Admin menambahkan user baru (Staff IT atau Head IT) dengan validasi duplikasi username.

**Implementation:**
```tsx
import { useAppContext } from '../context/AppContext';

function TambahUser() {
    const { addUser, getHeadITList } = useAppContext();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Siapkan data user
        const newUserData = {
            namaLengkap: 'Ariana Azzahra',
            username: 'ariana.azzahra',
            email: 'ariana@gmail.com',
            noTelepon: '087889909110',
            role: 'HEAD_IT' as const,
            status: 'ACTIVE' as const,
            assignedStaffs: ['USR004', 'USR005']  // Jika HEAD_IT, assign staffs
        };
        
        // Gunakan addUser dari Context
        // Fitur validasi bawaan:
        // - Cek duplikasi username (case-insensitive)
        // - Cek duplikasi email
        // - Return { success: boolean, message: string }
        const result = addUser(newUserData);
        
        if (result.success) {
            console.log(result.message); // "User Ariana Azzahra berhasil ditambahkan!"
            // Reset form, navigate, etc.
        } else {
            console.log(result.message); // "Username "..." sudah terdaftar."
            // Show error UI
        }
    };
    
    return <form onSubmit={handleSubmit}>...</form>;
}
```

**Fitur Validasi:**
- ✅ Duplikasi username (case-insensitive)
- ✅ Duplikasi email
- ✅ Auto-generate ID dengan timestamp
- ✅ Auto-set default avatar (random dari Pravatar API)
- ✅ Auto-set joinDate dengan format Indonesia
- ✅ Sync otomatis ke localStorage

---

### Use Case 2: Head IT Dashboard - Filter Staff (DashboardHead.tsx)

**Scenario:** Head IT hanya melihat staff yang menjadi tanggung jawabnya (yang memiliki leaderId sesuai dengan ID Head IT yang login).

**Implementation:**
```tsx
import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

function DashboardHead() {
    const { currentUser, getStaffsByLeader } = useAppContext();
    const [assignedStaffs, setAssignedStaffs] = useState([]);
    
    useEffect(() => {
        if (currentUser && currentUser.role === 'HEAD_IT') {
            // getStaffsByLeader secara otomatis filter:
            // - Hanya users dengan role === 'STAFF_IT'
            // - Hanya users dengan leaderId === currentUser.id
            const staffs = getStaffsByLeader(currentUser.id);
            setAssignedStaffs(staffs);
        }
    }, [currentUser, getStaffsByLeader]);
    
    return (
        <div>
            <h2>Tim Saya ({assignedStaffs.length} staff)</h2>
            {assignedStaffs.map(staff => (
                <div key={staff.id}>
                    <h3>{staff.namaLengkap}</h3>
                    <p>{staff.email}</p>
                    <p>Status: {staff.status}</p>
                </div>
            ))}
        </div>
    );
}
```

**Features:**
- ✅ Auto-filter berdasarkan currentUser role
- ✅ Real-time update ketika staff ditambahkan/dihapus
- ✅ Role-based visibility enforcement

---

### Use Case 3: Admin Dashboard - Manage All Users (DashboardAdmin.tsx)

**Scenario:** Admin bisa melihat semua users dan ubah status mereka, data terupdate real-time.

**Implementation:**
```tsx
import { useAppContext } from '../context/AppContext';

function DashboardAdmin() {
    const { users, changeUserStatus } = useAppContext();
    
    const handleStatusChange = (userId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
        // Fungsi changeUserStatus otomatis:
        // - Update status
        // - Set inactiveDate jika status = 'INACTIVE'
        // - Sync ke localStorage
        changeUserStatus(userId, newStatus);
    };
    
    return (
        <div>
            <h2>Kelola Semua Users ({users.length})</h2>
            {users.map(user => (
                <div key={user.id}>
                    <h3>{user.namaLengkap}</h3>
                    <p>Role: {user.role}</p>
                    <p>Status: {user.status}</p>
                    {user.role === 'STAFF_IT' && (
                        <p>Leader: {user.leaderId}</p>
                    )}
                    
                    {/* Tombol ubah status */}
                    <button 
                        onClick={() => handleStatusChange(
                            user.id, 
                            user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                        )}
                    >
                        {user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                </div>
            ))}
        </div>
    );
}
```

---

### Use Case 4: Login & Set CurrentUser (Login.tsx)

**Scenario:** Saat login, set current user di Context untuk akses user info di seluruh app.

**Implementation:**
```tsx
import { useAppContext } from '../context/AppContext';

function Login() {
    const { users, setCurrentUser } = useAppContext();
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Cari user di Context
        const foundUser = users.find(u => u.username === username);
        
        if (foundUser && validatePassword(password)) {
            // Set current user di Context
            setCurrentUser({
                id: foundUser.id,
                username: foundUser.username,
                role: foundUser.role,
                namaLengkap: foundUser.namaLengkap
            });
            
            // Navigate berdasarkan role
            navigate(foundUser.role === 'ADMIN' ? '/dashboard-admin' : '/dashboard');
        }
    };
    
    return <form onSubmit={handleLogin}>...</form>;
}
```

**Data yang Disimpan:**
- ✅ Ke Context state (real-time access)
- ✅ Ke localStorage (persist across refreshes)
- ✅ Bisa diakses dari component mana pun

---

### Use Case 5: Get User by ID atau List By Role

**Scenario:** Mencari user tertentu atau mendapatkan list berdasarkan role.

**Implementation:**
```tsx
import { useAppContext } from '../context/AppContext';

function MyComponent() {
    const { 
        getUserById,
        getHeadITList,
        getStaffITList,
        users 
    } = useAppContext();
    
    // Cari user by ID
    const user = getUserById('USR001');
    console.log(user.namaLengkap); // "Ariana"
    
    // Dapatkan semua Head IT
    const headITs = getHeadITList();
    console.log(headITs.length); // 3
    
    // Dapatkan semua Staff IT
    const staffs = getStaffITList();
    console.log(staffs.length); // 6
    
    // Dapatkan semua users
    console.log(users.length); // 9
    
    return <div>...</div>;
}
```

---

## 📱 UI Integration Examples

### Success Message (TambahUser.tsx)
```tsx
{successMessage && (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <p className="text-emerald-700 font-bold">{successMessage}</p>
    </div>
)}
```

### Error Message (Form Validation)
```tsx
{errorMessage && (
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
        <p className="text-rose-700 font-bold">{errorMessage}</p>
    </div>
)}
```

### Role Badge
```tsx
<div className={`px-3 py-1 rounded-full text-sm font-bold
    ${user.role === 'HEAD_IT' ? 'bg-rose-50 text-rose-600' : '...'}
`}>
    {user.role}
</div>
```

---

## 🔄 Data Flow

### 1. Add User Flow
```
Admin Input Form 
    ↓
addUser() di Context
    ↓
Validasi (duplikasi username/email)
    ↓
Create User Object dengan ID + joinDate
    ↓
Update state users[]
    ↓
Trigger useEffect → localStorage.setItem()
    ↓
DashboardAdmin & TambahUser render otomatis (real-time update)
```

### 2. Filter Data Flow
```
Head IT Login
    ↓
setCurrentUser() dengan leaderId
    ↓
DashboardHead useEffect trigger
    ↓
getStaffsByLeader(currentUser.id)
    ↓
Return array staff dengan leaderId === currentUser.id
    ↓
setAssignedStaffs() 
    ↓
Component render dengan filtered data
```

### 3. localStorage Sync
```
State berubah (addUser, updateUser, changeUserStatus)
    ↓
useEffect dengan dependency [users] trigger
    ↓
localStorage.setItem(STORAGE_KEY, users)
    ↓
Page refresh
    ↓
AppProvider init: localStorage.getItem() → initial state
    ↓
Data persist!
```

---

## 🎯 Best Practices

### 1. Selalu gunakan Type Safety
```tsx
// ✅ BENAR
const result = addUser({
    ...userData,
    role: 'HEAD_IT' as const
});

// ❌ SALAH
const result = addUser({
    ...userData,
    role: 'HEAD_IT' // Type error jika tidak const
});
```

### 2. Gunakan Filtering Functions, jangan manual filter di component
```tsx
// ✅ BENAR
const staffs = getStaffsByLeader(currentUser.id);

// ❌ SALAH
const staffs = users.filter(u => u.leaderId === currentUser.id);
// Kenapa tidak: logic tersentralisasi di satu tempat
```

### 3. Handle Error Cases
```tsx
// ✅ BENAR
const result = addUser(userData);
if (result.success) {
    // Success handling
} else {
    // Error handling dengan message
    setErrorMessage(result.message);
}

// ❌ SALAH
addUser(userData); // Tidak check result
```

### 4. Dependency Array di useEffect
```tsx
// ✅ BENAR
useEffect(() => {
    const staffs = getStaffsByLeader(currentUser.id);
    setAssignedStaffs(staffs);
}, [currentUser, getStaffsByLeader]);

// ❌ SALAH
useEffect(() => {
    const staffs = getStaffsByLeader(currentUser.id);
    setAssignedStaffs(staffs);
}, []); // Outdated currentUser reference
```

---

## 🔐 Security Notes

### Untuk Produksi:
1. **Jangan simpan password di localStorage** (currently: password hanya di registeredUser sementara)
2. **Gunakan JWT Token** dari backend untuk authentication
3. **Validasi di backend**, bukan hanya frontend
4. **Hash password** sebelum disimpan
5. **Encrypt sensitive data** di localStorage

### Current Implementation (Development):
```tsx
// Hanya untuk demo - password tidak disimpan globally
// Hanya di localStorage dengan key 'registeredUser' (sementara)
const isValidPassword = (...); // Validation logic di Login.tsx
```

---

## 🧪 Testing Examples

### Test Add User Validation
```tsx
const { addUser } = useAppContext();

// Test: Duplikasi username
const result1 = addUser({ username: 'ariana.17200', ... });
// result1.success === false
// result1.message === 'Username "ariana.17200" sudah terdaftar'

// Test: Username baru
const result2 = addUser({ username: 'user.baru', ... });
// result2.success === true
```

### Test Filter By Leader
```tsx
const { getStaffsByLeader, users } = useAppContext();

// Get staffs dari leader 'USR001'
const staffs = getStaffsByLeader('USR001');
// staffs.length === 2 (Azizah & Aldira)
// All staffs have leaderId === 'USR001'
```

---

## 📊 Default Data

Sistem sudah pre-loaded dengan 9 users:

### Head IT (3):
1. **Ariana** (USR001) → Lead: Azizah, Aldira
2. **Jamaludin Ishak** (USR002) → Lead: Federasi, Fadlan
3. **Febrian Anastesi** (USR003) → Lead: Laura

### Staff IT (6):
- Azizah Fatma (USR004) ← Ariana
- Aldira (USR005) ← Ariana
- Federasi Almando (USR006) ← Jamaludin
- Laura Zaina (USR007) ← Febrian
- Fadlan Jamirudin (USR008) ← Jamaludin
- Denzo (USR009) ← Ariana [INACTIVE]

---

## 🚨 Common Errors & Solutions

### Error: "useAppContext harus digunakan di dalam AppProvider"
```tsx
// ❌ TIDAK BEKERJA
// App.tsx tanpa AppProvider
<Router>
    <MyComponent /> // useAppContext() → ERROR
</Router>

// ✅ SOLUSI
<AppProvider>
    <Router>
        <MyComponent /> // useAppContext() → OK
    </Router>
</AppProvider>
```

### Error: Data tidak tersinkronisasi antar component
```tsx
// ❌ TIDAK BEKERJA
const [users, setUsers] = useState([]); // Local state

// ✅ SOLUSI
const { users } = useAppContext(); // Global state dengan sync
```

### Error: Duplikasi tidak terdeteksi
```tsx
// ❌ TIDAK BEKERJA
const isDuplicate = users.some(u => u.username === username);
// Hanya exact match, tidak case-insensitive

// ✅ BEKERJA (di Context)
const isDuplicate = users.some(
    u => u.username.toLowerCase() === username.toLowerCase()
);
```

---

## 📚 Files Modified

```
src/
├── context/
│   └── AppContext.tsx ✨ (New comprehensive implementation)
├── types/
│   └── index.ts ✏️ (Added User interface)
├── pages/
│   ├── App.tsx ✏️ (Added AppProvider)
│   ├── Login.tsx ✏️ (Use setCurrentUser from Context)
│   ├── TambahUser.tsx ✏️ (Use addUser, getHeadITList, getStaffITList)
│   ├── DashboardHead.tsx ✏️ (Use getStaffsByLeader for filtering)
│   └── DashboardAdmin.tsx (Can use changeUserStatus)
```

---

## 🎓 Learning Path

1. **Baca** AppContext.tsx lengkap
2. **Pahami** data structure & interface
3. **Lihat** contoh di TambahUser.tsx
4. **Coba** add user dan lihat real-time update
5. **Test** login dan lihat filtered data di DashboardHead
6. **Explore** fungsi-fungsi lain

---

## 📞 Support

Untuk pertanyaan atau issues:
1. Cek apakah menggunakan AppProvider di App.tsx
2. Cek console untuk error message
3. Lihat localStorage (DevTools → Application → Local Storage)
4. Verify User interface match dengan data

---

**Happy Coding! 🚀**

