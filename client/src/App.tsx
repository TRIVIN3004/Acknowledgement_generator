import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Pages
import { AuthPage } from './pages/AuthPage';
import { VerificationPage } from './pages/VerificationPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProjectManagement } from './pages/admin/ProjectManagement';
import { RoleManagement } from './pages/admin/RoleManagement';
import { MemberManagement } from './pages/admin/MemberManagement';
import { AcknowledgementDashboard } from './pages/admin/AcknowledgementDashboard';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';

// Member Pages
import { MemberDashboard } from './pages/member/MemberDashboard';
import { RoleAcceptancePage } from './pages/member/RoleAcceptancePage';
import { MyLettersPage } from './pages/member/MyLettersPage';
import { MemberProfile } from './pages/member/MemberProfile';

// Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'admin' | 'member' }> = ({
  children,
  allowedRole
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs font-semibold text-slate-400">Restoring PRDAMS Session...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {user && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify/:hash" element={<VerificationPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute allowedRole="admin">
                  <ProjectManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute allowedRole="admin">
                  <RoleManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedRoute allowedRole="admin">
                  <MemberManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/acknowledgements"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AcknowledgementDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute allowedRole="admin">
                  <ActivityLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Team Member Routes */}
            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute allowedRole="member">
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/roles"
              element={
                <ProtectedRoute allowedRole="member">
                  <RoleAcceptancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/letters"
              element={
                <ProtectedRoute allowedRole="member">
                  <MyLettersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/profile"
              element={
                <ProtectedRoute allowedRole="member">
                  <MemberProfile />
                </ProtectedRoute>
              }
            />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
