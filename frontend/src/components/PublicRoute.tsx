import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
    children: React.ReactNode;
}

interface CurrentUser {
    id: string;
    name: string;
    userName: string;
    email: string;
    roleName: 'ADMINISTRATOR' | 'LEAD' | 'STAFF_IT_LEADER' | string;
    token: string;
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
                    // Force dynamic redirect if they magically got back to login via bfcache
                    if (session.roleName === 'ADMINISTRATOR') window.location.replace('/dashboard-admin');
                    else if (session.roleName === 'LEAD') window.location.replace('/dashboard');
                    else if (session.roleName === 'STAFF_IT_LEADER') window.location.replace('/dashboard-staff');
                    else window.location.replace('/profile');
                }
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    const session = getSession();

    // If logged in, send them away to their respective dashboard
    if (session && session.token) {
        if (session.roleName === 'ADMINISTRATOR') return <Navigate to="/dashboard-admin" replace />;
        if (session.roleName === 'LEAD') return <Navigate to="/dashboard" replace />;
        if (session.roleName === 'STAFF_IT_LEADER') return <Navigate to="/dashboard-staff" replace />;
        
        return <Navigate to="/profile" replace />;
    }

    // Not logged in → let them see the public page (e.g., Login Form)
    return <>{children}</>;
}