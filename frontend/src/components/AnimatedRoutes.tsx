import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import DashboardHead from '../pages/DashboardHead';
import DashboardAdmin from '../pages/DashboardAdmin';
import DashboardStaff from '../pages/DashboardStaff';
import BuatTiket from '../pages/BuatTiket';
import Teknisi from '../pages/Teknisi';
import DetailTiket from '../pages/DetailTiket';
import LihatTiket from '../pages/LihatTiket';
import TambahUser from '../pages/TambahUser';
import Profile from '../pages/Profile';
import PageTransition from './PageTransition';
import SetPassword from "../pages/SetPassword";

// Route Guards
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute'; // Imported the clean, matching PublicRoute

export default function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public routes */}
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                
                {/* Protected from logged-in users: redirects active sessions back to their dashboard */}
                <Route path="/login" element={
                    <PublicRoute>
                        <PageTransition><Login /></PageTransition>
                    </PublicRoute>
                } />
                
                <Route path="/register" element={<Navigate to="/login" replace />} />
                <Route path="/set-password" element={<SetPassword />} />

                {/* Protected: LEAD only */}
                <Route path="/dashboard" element={
                    <PrivateRoute allowedRoles={['LEAD']}>
                        <PageTransition><DashboardHead /></PageTransition>
                    </PrivateRoute>
                } />

                {/* Protected: ADMIN only */}
                <Route path="/dashboard-admin" element={
                    <PrivateRoute allowedRoles={['ADMINISTRATOR']}>
                        <PageTransition><DashboardAdmin /></PageTransition>
                    </PrivateRoute>
                } />

                {/* Protected: STAFF_IT_LEADER only */}
                <Route path="/dashboard-staff" element={
                    <PrivateRoute allowedRoles={['STAFF_IT_LEADER']}>
                        <PageTransition><DashboardStaff /></PageTransition>
                    </PrivateRoute>
                } />

                {/* Protected: LEAD & ADMINISTRATOR */}
                <Route path="/buat-tiket" element={
                    <PrivateRoute allowedRoles={['LEAD', 'ADMINISTRATOR']}>
                        <PageTransition><BuatTiket /></PageTransition>
                    </PrivateRoute>
                } />
                <Route path="/teknisi" element={
                    <PrivateRoute allowedRoles={['LEAD', 'ADMINISTRATOR']}>
                        <PageTransition><Teknisi /></PageTransition>
                    </PrivateRoute>
                } />
                <Route path="/lihat-tiket" element={
                    <PrivateRoute allowedRoles={['LEAD', 'ADMINISTRATOR']}>
                        <PageTransition><LihatTiket /></PageTransition>
                    </PrivateRoute>
                } />
                <Route path="/tambah-user" element={
                    <PrivateRoute allowedRoles={['ADMINISTRATOR']}>
                        <PageTransition><TambahUser /></PageTransition>
                    </PrivateRoute>
                } />

                {/* Protected: all authenticated roles */}
                <Route path="/ticket-detail" element={
                    <PrivateRoute>
                        <PageTransition><DetailTiket /></PageTransition>
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute>
                        <PageTransition><Profile /></PageTransition>
                    </PrivateRoute>
                } />
            </Routes>
        </AnimatePresence>
    );
}