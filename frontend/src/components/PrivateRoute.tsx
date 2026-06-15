import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

function getSession() {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
}

/**
 * PrivateRoute — guards protected pages.
 *
 * - If no session exists → redirect to /
 * - If allowedRoles is specified and user role doesn't match → redirect to /
 * - Also listens for browser Back/Forward (bfcache pageshow) events to re-validate
 */
export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
    const location = useLocation();

    // Re-check auth when browser restores page from bfcache (back button)
    useEffect(() => {
        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                // Page was restored from bfcache — re-validate session
                const session = getSession();
                if (!session) {
                    window.location.replace('/');
                }
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    const session = getSession();

    if (!session) {
        // Not logged in → go to login, remember where they were trying to go
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(session.roleName)) {
        // Logged in but wrong role → redirect to login
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
