import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ClientsListPage } from './pages/ClientsListPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { PersonDetailPage } from './pages/PersonDetailPage'
import { DealsListPage } from './pages/DealsListPage'
import { DealDetailPage } from './pages/DealDetailPage'
import { TasksListPage } from './pages/TasksListPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { SettingsPage } from './pages/SettingsPage'
import { UsersListPage } from './pages/UsersListPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { ContactsListPage } from './pages/ContactsListPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ConfirmEmailPage } from './pages/ConfirmEmailPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/clients" replace />} />
        <Route path="/clients" element={<ClientsListPage />} />
        <Route path="/clients/:clientId" element={<ClientDetailPage />} />
        <Route path="/contacts" element={<ContactsListPage />} />
        <Route path="/individuals/:individualId" element={<PersonDetailPage />} />
        <Route path="/deals" element={<DealsListPage />} />
        <Route path="/deals/:dealId" element={<DealDetailPage />} />
        <Route path="/tasks" element={<TasksListPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/:userId" element={<UserDetailPage />} />
        <Route path="/auth/confirm-email" element={<ConfirmEmailPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
