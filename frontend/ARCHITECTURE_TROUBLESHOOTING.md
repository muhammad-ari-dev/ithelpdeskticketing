// ============================================================================
// ARCHITECTURE & TROUBLESHOOTING GUIDE
// ============================================================================

/**
 * 📊 VISUAL ARCHITECTURE
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                         App.tsx                                  │
 * │  ┌───────────────────────────────────────────────────────────┐  │
 * │  │          <AppProvider>                                    │  │
 * │  │  ┌─────────────────────────────────────────────────────┐  │  │
 * │  │  │     React Context ({users, currentUser, ...})      │  │  │
 * │  │  │                                                       │  │  │
 * │  │  │  State:                                              │  │  │
 * │  │  │  - users[] (9 default)                              │  │  │
 * │  │  │  - currentUser (null or logged in user)             │  │  │
 * │  │  │                                                       │  │  │
 * │  │  │  Functions:                                          │  │  │
 * │  │  │  - addUser()                                         │  │  │
 * │  │  │  - getStaffsByLeader(leaderId)                       │  │  │
 * │  │  │  - setCurrentUser()                                  │  │  │
 * │  │  └─────────────────────────────────────────────────────┘  │  │
 * │  │                          │                                  │  │
 * │  │         ┌────────────────┼────────────────┐                │  │
 * │  │         │                │                │                │  │
 * │  │    localStorage       useAppContext    useAppContext  │  │
 * │  │    (persistence)      (Component A)    (Component B)  │  │
 * │  └─────────────────────────────────────────────────────────┘  │
 * │         │                      │                │               │
 * │    ┌────▼────┐            ┌────▼────┐      ┌────▼────┐        │
 * │    │ Browser │            │Component│      │Component│        │
 * │    │ Storage │            │   A     │      │   B     │        │
 * │    └─────────┘            │ (Login) │      │(Dashboard)│      │
 * │                           └────┬────┘      └────┬────┘        │
 * │                                │                │              │
 * │                       [Auto sync on change]                   │
 * │                         [Real-time render]                    │
 * └─────────────────────────────────────────────────────────────────┘
 */

/**
 * 🔄 DATA FLOW DIAGRAM
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 1. INITIALIZATION                                           │
 * ├─────────────────────────────────────────────────────────────┤
 * │ AppProvider mounts                                          │
 * │    ↓                                                         │
 * │ Check localStorage.getItem('itTicketing_users')            │
 * │    ↓                                                         │
 * │ If exist: use from storage                                  │
 * │ If not: use defaultUsers (9 users)                         │
 * │    ↓                                                         │
 * │ setState(users) → render semua component                    │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 2. ADD USER FLOW                                            │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Admin: handleSubmit() → addUser(userData)                   │
 * │    ↓                                                         │
 * │ Context function:                                           │
 * │   - Validate username (unique, case-insensitive)           │
 * │   - Validate email (unique)                                │
 * │   - Create ID: USR + timestamp                             │
 * │   - Generate avatar from Pravatar                          │
 * │   ↓                                                          │
 * │ setUsers([...prevUsers, newUser])                          │
 * │    ↓                                                         │
 * │ useEffect dependency [users] trigger                        │
 * │    ↓                                                         │
 * │ localStorage.setItem('itTicketing_users', JSON.stringify)  │
 * │    ↓                                                         │
 * │ Return {success: true, message: '...'}                     │
 * │    ↓                                                         │
 * │ Admin: Reset form, show success message                     │
 * │    ↓                                                         │
 * │ ALL component subscribe ke Context: instant update!        │
 * │ - DashboardAdmin: re-render dengan user baru              │
 * │ - TambahUser: dropdown list langsung update               │
 * │ - DashboardHead: jika new user jadi staff, auto filter     │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 3. FILTER DATA FLOW (Role-based)                            │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Head IT Login                                               │
 * │    ↓                                                         │
 * │ setCurrentUser({id, username, role: 'HEAD_IT', ...})      │
 * │    ↓                                                         │
 * │ localStorage.setItem('itTicketing_currentUser', ...)       │
 * │    ↓                                                         │
 * │ DashboardHead component mount:                             │
 * │    ↓                                                         │
 * │ useEffect([currentUser, getStaffsByLeader])                │
 * │    ↓                                                         │
 * │ getStaffsByLeader(currentUser.id) → return array          │
 * │   Filter: users.filter(u =>                                 │
 * │     u.leaderId === currentUser.id &&                        │
 * │     u.role === 'STAFF_IT'                                   │
 * │   )                                                         │
 * │    ↓                                                         │
 * │ setAssignedStaffs(staffs)                                  │
 * │    ↓                                                         │
 * │ Render hanya staff yang menjadi tanggung jawab Head IT     │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 4. PERSISTENCE FLOW                                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ User add user / change data                                 │
 * │    ↓                                                         │
 * │ State updated (setUsers / changeUserStatus)                │
 * │    ↓                                                         │
 * │ useEffect([users]) trigger                                  │
 * │    ↓                                                         │
 * │ localStorage.setItem('itTicketing_users', users JSON)      │
 * │    ↓                                                         │
 * │ Page refresh / close & open browser                         │
 * │    ↓                                                         │
 * │ AppProvider init state dari localStorage                    │
 * │    ↓                                                         │
 * │ ✅ Data persist! Tetap sama seperti sebelum refresh        │
 * └─────────────────────────────────────────────────────────────┘
 */

/**
 * 🐛 TROUBLESHOOTING GUIDE
 */

// ============================================================================
// PROBLEM 1: useAppContext harus digunakan di dalam AppProvider
// ============================================================================

/**
 * ❌ WRONG:
 * 
 * // App.tsx
 * export default function App() {
 *     return (
 *         <Router>
 *             <Routes>
 *                 <Route path="/" element={<MyComponent />} />
 *             </Routes>
 *         </Router>
 *     );
 * }
 * 
 * // MyComponent.tsx
 * function MyComponent() {
 *     const { users } = useAppContext(); // ❌ ERROR!
 *     // "useAppContext harus digunakan di dalam AppProvider"
 * }
 * 
 * ✅ CORRECT:
 * 
 * // App.tsx
 * import { AppProvider } from './context/AppContext';
 * 
 * export default function App() {
 *     return (
 *         <AppProvider>
 *             <Router>
 *                 <Routes>
 *                     <Route path="/" element={<MyComponent />} />
 *                 </Routes>
 *             </Router>
 *         </AppProvider>
 *     );
 * }
 */

// ============================================================================
// PROBLEM 2: Data tidak update di component lain (tidak real-time)
// ============================================================================

/**
 * ❌ WRONG (Local state):
 * 
 * function DashboardAdmin() {
 *     const [users, setUsers] = useState([...]); // ❌ Local state
 *
 *     return <div>Users: {users.length}</div>;
 * }
 * 
 * function TambahUser() {
 *     const [users, setUsers] = useState([...]);
 * 
 *     const handleAdd = () => {
 *         setUsers([...users, newUser]); // ❌ Hanya update local state
 *         // DashboardAdmin tidak tahu ada update!
 *     };
 * }
 * 
 * ✅ CORRECT (Global Context):
 * 
 * function DashboardAdmin() {
 *     const { users } = useAppContext(); // ✅ Context state
 *
 *     return <div>Users: {users.length}</div>;
 * }
 * 
 * function TambahUser() {
 *     const { addUser } = useAppContext();
 * 
 *     const handleAdd = () => {
 *         addUser(newUser); // ✅ Update global state
 *         // DashboardAdmin instant update!
 *     };
 * }
 */

// ============================================================================
// PROBLEM 3: Tampilan data tidak update setelah page refresh
// ============================================================================

/**
 * ❌ WRONG (Tidak sync ke localStorage):
 * 
 * function MyComponent() {
 *     const [users, setUsers] = useState([...]);
 *     
 *     const addUser = (user) => {
 *         setUsers([...users, user]); // Set state saja
 *         // Ketika page refresh, data ilang!
 *     };
 * }
 * 
 * ✅ CORRECT (AppContext auto-sync):
 * 
 * // AppContext.tsx sudah inline useEffect:
 * useEffect(() => {
 *     localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
 * }, [users]);
 * 
 * // Component tinggal:
 * function MyComponent() {
 *     const { addUser } = useAppContext();
 *     
 *     const handleAdd = (user) => {
 *         addUser(user); // ✅ Auto sync ke localStorage
 *         // Tetap ada setelah refresh!
 *     };
 * }
 */

// ============================================================================
// PROBLEM 4: Duplikasi username/email tidak terdeteksi
// ============================================================================

/**
 * ❌ WRONG (Case-sensitive):
 * 
 * const isDuplicate = users.some(u => u.username === 'Ariana.17200');
 * // users.find('ariana.17200') → tidak match → tidak detect duplikasi!
 * 
 * ✅ CORRECT (Case-insensitive):
 * 
 * // AppContext sudah built-in:
 * const isDuplicate = users.some(
 *     u => u.username.toLowerCase() === username.toLowerCase()
 * );
 * 
 * // Atau gunakan addUser dari Context:
 * const result = addUser({username: 'Ariana.17200', ...});
 * if (!result.success) {
 *     console.log(result.message); // Auto-handled!
 * }
 */

// ============================================================================
// PROBLEM 5: Filter data Head IT tidak bekerja
// ============================================================================

/**
 * ❌ WRONG (Manual filter):
 * 
 * function DashboardHead() {
 *     const { users, currentUser } = useAppContext();
 *     const [staffs, setStaffs] = useState([]);
 *     
 *     useEffect(() => {
 *         // ❌ Manual filter tanpa dependency array error
 *         const filtered = users.filter(u => u.leaderId === currentUser?.id);
 *         setStaffs(filtered);
 *     }, []); // ❌ WRONG: dependency array empty!
 *     // currentUser berubah → tidak trigger filter
 * }
 * 
 * ✅ CORRECT (Gunakan helper function):
 * 
 * function DashboardHead() {
 *     const { currentUser, getStaffsByLeader } = useAppContext();
 *     const [staffs, setStaffs] = useState([]);
 *     
 *     useEffect(() => {
 *         if (currentUser && currentUser.role === 'HEAD_IT') {
 *             const filtered = getStaffsByLeader(currentUser.id);
 *             setStaffs(filtered);
 *         }
 *     }, [currentUser, getStaffsByLeader]); // ✅ Correct!
 * }
 */

// ============================================================================
// PROBLEM 6: currentUser tidak persist setelah refresh
// ============================================================================

/**
 * ❌ WRONG (Tidak simpan ke localStorage):
 * 
 * function Login() {
 *     const { setCurrentUser } = useAppContext();
 *     
 *     const handleLogin = () => {
 *         setCurrentUser(user); // ❌ Set Context saja
 *         // Refresh → currentUser hilang!
 *     };
 * }
 * 
 * ✅ CORRECT (AppContext auto-save):
 * 
 * // AppContext.tsx sudah inline useEffect:
 * useEffect(() => {
 *     if (currentUser) {
 *         localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
 *     } else {
 *         localStorage.removeItem(CURRENT_USER_KEY);
 *     }
 * }, [currentUser]);
 * 
 * // Component tinggal:
 * function Login() {
 *     const { setCurrentUser } = useAppContext();
 *     
 *     const handleLogin = () => {
 *         setCurrentUser(user); // ✅ Auto persist!
 *         // Tetap ada setelah refresh!
 *     };
 * }
 */

// ============================================================================
// PROBLEM 7: Dropdown list pemilihan leader/staff tidak update
// ============================================================================

/**
 * ❌ WRONG (Langsung gunakan DUMMY_DATA):
 * 
 * function TambahUser() {
 *     const DUMMY_LEADERS = [...]; // ❌ Static data
 *     
 *     return (
 *         <select>
 *             {DUMMY_LEADERS.map(l => (...))} {/* Tidak update */}
 *         </select>
 *     );
 * }
 * 
 * ✅ CORRECT (Gunakan helper function dari Context):
 * 
 * function TambahUser() {
 *     const { getHeadITList } = useAppContext();
 *     
 *     return (
 *         <select>
 *             {/* ✅ Auto-update dari Context */}
 *             {getHeadITList().map(l => (
 *                 <option key={l.id} value={l.id}>{l.namaLengkap}</option>
 *             ))}
 *         </select>
 *     );
 * }
 */

// ============================================================================
// PROBLEM 8: Form field names tidak match dengan state
// ============================================================================

/**
 * ❌ WRONG (Inconsistent naming):
 * 
 * const [formData, setFormData] = useState({
 *     namaLengkap: '',
 *     userName: '', // ❌ camelCase tidak konsisten
 *     email: ''
 * });
 * 
 * // Saat submit:
 * addUser({
 *     ...formData,
 *     username: formData.userName // ❌ Mapping manual, mudah typo
 * });
 * 
 * ✅ CORRECT (Consistent naming):
 * 
 * const [formData, setFormData] = useState({
 *     namaLengkap: '',
 *     username: '', // ✅ Match dengan User interface
 *     email: ''
 * });
 * 
 * // Saat submit:
 * addUser(formData); // ✅ Direct mapping, no error!
 */

// ============================================================================
// DEBUGGING CHECKLIST
// ============================================================================

/**
 * Ketika ada error atau data tidak terlihat, check ini:
 * 
 * 1. ✓ AppProvider ada di App.tsx?
 *    > App.tsx line 1-5: import AppProvider
 *    > App.tsx line 15: <AppProvider>
 * 
 * 2. ✓ Component import useAppContext?
 *    > import { useAppContext } from '../context/AppContext';
 * 
 * 3. ✓ Dependency array benar?
 *    > useEffect(() => {...}, [currentUser, getStaffsByLeader]);
 *    > Jangan []! (outdated reference)
 * 
 * 4. ✓ DevTools localStorage check:
 *    > F12 → Application → Local Storage
 *    > Key: 'itTicketing_users' (data all users)
 *    > Key: 'itTicketing_currentUser' (logged in user)
 * 
 * 5. ✓ Console check:
 *    > console.log(users); // Should return array
 *    > console.log(currentUser); // Should return object or null
 * 
 * 6. ✓ Function call correct?
 *    > addUser({...}) // Return {success, message}
 *    > getStaffsByLeader(leaderId) // Return User[]
 *    > setCurrentUser(user) // Void
 * 
 * 7. ✓ Component mount?
 *    > useEffect(() => {...}, []); // Check console.log
 * 
 * 8. ✓ Re-render trigger?
 *    > State change → dependency array → useEffect → console.log
 */

// ============================================================================
// COMMON PATTERNS & BEST PRACTICES
// ============================================================================

/**
 * ✅ Pattern 1: Always check currentUser before use
 * 
 * function MyComponent() {
 *     const { currentUser } = useAppContext();
 *     
 *     if (!currentUser) {
 *         return <div>Loading...</div>;
 *     }
 *     
 *     return <div>Welcome, {currentUser.namaLengkap}</div>;
 * }
 */

/**
 * ✅ Pattern 2: Handle error from addUser
 * 
 * const handleAdd = () => {
 *     const result = addUser(userData);
 *     
 *     if (result.success) {
 *         showSuccessMessage(result.message);
 *     } else {\n *         showErrorMessage(result.message);
 *     }
 * };
 */

/**
 * ✅ Pattern 3: Filter with validation
 * 
 * useEffect(() => {
 *     if (currentUser?.role === 'HEAD_IT') {
 *         const staffs = getStaffsByLeader(currentUser.id);
 *         setData(staffs);
 *     }
 * }, [currentUser, getStaffsByLeader]);
 */

/**
 * ✅ Pattern 4: Real-time search/filter
 * 
 * const [search, setSearch] = useState('');
 * const { users } = useAppContext();
 * 
 * const filtered = users.filter(u =>
 *     u.namaLengkap.toLowerCase().includes(search.toLowerCase())
 * );
 */

/**
 * ✅ Pattern 5: Conditional rendering by role
 * 
 * {currentUser?.role === 'ADMIN' && (
 *     <button>Add User</button>
 * )}
 * 
 * {currentUser?.role === 'HEAD_IT' && (
 *     <div>Tim Anda: {assignedStaffs.length}</div>
 * )}
 */

export {};

