import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationSidebar } from "./components/NavigationSidebar";
import { ClientsListPage } from "./pages/ClientsListPage";
import { ClientDetailPage } from "./pages/ClientDetailPage";
import { ContactsListPage } from "./pages/ContactsListPage";
import { PersonDetailPage } from "./pages/PersonDetailPage";
import { DealsListPage } from "./pages/DealsListPage";
import { DealDetailPage } from "./pages/DealDetailPage";
import { TasksListPage } from "./pages/TasksListPage";
import { TaskDetailPage } from "./pages/TaskDetailPage";
import { UsersListPage } from "./pages/UsersListPage";
import { UserDetailPage } from "./pages/UserDetailPage";
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
          <Route path="/clients/:clientId" element={<ClientDetailPage />} />
          <Route path="/contacts" element={<ContactsListPage />} />
          <Route path="/individuals/:individualId" element={<PersonDetailPage />} />
          <Route path="/deals" element={<DealsListPage />} />
          <Route path="/deals/:dealId" element={<DealDetailPage />} />
          <Route path="/tasks" element={<TasksListPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
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
