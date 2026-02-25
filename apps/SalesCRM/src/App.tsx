import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationSidebar } from "./components/NavigationSidebar";
import { ClientsListPage } from "./pages/ClientsListPage";
import { ContactsListPage } from "./pages/ContactsListPage";
import { DealsListPage } from "./pages/DealsListPage";
import { TasksListPage } from "./pages/TasksListPage";
import { UsersListPage } from "./pages/UsersListPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ConfirmEmailPage } from "./pages/ConfirmEmailPage";

export function App() {
  return (
    <div className="sidebar-layout">
      <NavigationSidebar />
      <main className="sidebar-main">
        <Routes>
          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="/clients" element={<ClientsListPage />} />
          <Route path="/contacts" element={<ContactsListPage />} />
          <Route path="/deals" element={<DealsListPage />} />
          <Route path="/tasks" element={<TasksListPage />} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/confirm-email" element={<ConfirmEmailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
