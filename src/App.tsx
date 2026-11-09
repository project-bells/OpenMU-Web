import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/public/HomePage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import UserLoginPage from "./pages/public/UserLoginPage";
import AdminGuard from "./components/admin/AdminGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import { I18nProvider } from "./i18n";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { UserDashboardProvider } from "./context/UserDashboardContext";
import UserLayout from "./layouts/UserLayout";
import UserExchangePage from "./pages/user/UserExchangePage";
import UserOverviewPage from "./pages/user/UserOverviewPage";
import UserHistoryPage from "./pages/user/UserHistoryPage";
import UserDonatePage from "./pages/user/UserDonatePage";

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AdminAuthProvider>
          <UserDashboardProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. Public / Marketing Layout (URL: /) */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                </Route>

                {/* 1. User Authentication Flow (URL: /login) */}
                <Route path="/login" element={<UserLoginPage />} />

                {/* 2. Admin / GM Flow (Hidden Behind URL: /admin/login) */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* 2 & 3. Protected Admin Dashboard with Sidebar + Topbar */}
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminLayout />
                    </AdminGuard>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>

                {/* 1. Player User Dashboard (URL: /user/dashboard) */}
                <Route path="/user" element={<UserLayout />}>
                  <Route index element={<Navigate to="/user/dashboard" replace />} />
                  <Route path="dashboard" element={<UserExchangePage />} />
                  <Route path="exchange" element={<UserExchangePage />} />
                  <Route path="overview" element={<UserOverviewPage />} />
                  <Route path="history" element={<UserHistoryPage />} />
                  <Route path="donate" element={<UserDonatePage />} />
                </Route>
                <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />

                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </UserDashboardProvider>
        </AdminAuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
