import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
    children: React.ReactNode;
}

interface CurrentUser {
    token: string;
    id: string;
    name: string;
    userName: string;
    email: string;
    roleName: 'ADMINISTRATOR' | 'LEAD' | 'STAFF_IT_LEADER' | string;
}

function getSession(): CurrentUser | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse session", e);
        return null;
    }
}

/**
 * PublicRoute — restricts authenticated users from visiting guest-only pages (like Login).
 *
 * - If a session exists → redirect them to their appropriate dashboard based on role.
 * - If no session exists → render the children components normally.
 * - Also listens for browser Back/Forward (bfcache pageshow) events to re-validate.
 */
export default function PublicRoute({ children }: PublicRouteProps) {

    // Re-check auth when browser restores page from bfcache (back button)
    useEffect(() => {
        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                const session = getSession();
                if (session && session.token) {
                    const roleName = session.roleName || jwtDecode<any>(session.token).roleName;
                    // Force dynamic redirect if they magically got back to login via bfcache
                    if (roleName === 'ADMINISTRATOR') window.location.replace('/dashboard-admin');
                    else if (roleName === 'LEAD') window.location.replace('/dashboard-head');
                    else if (roleName === 'EMPLOYEE') window.location.replace('/dashboard-staff');
                    else {
                        // Sesi rusak (tidak ada roleName), hapus otomatis dan kembali ke login
                        localStorage.removeItem('currentUser');
                        localStorage.removeItem('token');
                        window.location.replace('/');
                    }
                }
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    const session = getSession();

    // If logged in, send them away to their respective dashboard
    if (session && session.token) {
        const roleName = session.roleName || jwtDecode<any>(session.token).roleName;
        if (roleName === 'ADMINISTRATOR') return <Navigate to="/dashboard-admin" replace />;
        if (roleName === 'LEAD') return <Navigate to="/dashboard-head" replace />;
        if (roleName === 'EMPLOYEE') return <Navigate to="/dashboard-staff" replace />;
        // Jika sampai di sini, berarti sesi rusak/role tidak valid
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        
        // Sesi sudah dibersihkan, biarkan lanjut ke bawah untuk menampilkan halaman Login
    }

    // Not logged in → let them see the public page (e.g., Login Form)
    return <>{children}</>;
}