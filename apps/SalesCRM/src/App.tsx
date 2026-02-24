import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import ClientsListPage from './pages/ClientsListPage'
import ClientDetailPage from './pages/ClientDetailPage'
import PersonDetailPage from './pages/PersonDetailPage'
import DealsListPage from './pages/DealsListPage'
import DealDetailPage from './pages/DealDetailPage'
import TasksListPage from './pages/TasksListPage'
import TaskDetailPage from './pages/TaskDetailPage'
import ContactsListPage from './pages/ContactsListPage'
import SettingsPage from './pages/SettingsPage'
import UsersListPage from './pages/UsersListPage'
import UserDetailPage from './pages/UserDetailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ConfirmEmailPage from './pages/ConfirmEmailPage'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { loadSession } from './store/slices/authSlice'

function App() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    if (token && !user) {
      dispatch(loadSession())
    }
  }, [dispatch, token, user])

  return (
    <>
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
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
        </Routes>
      </main>
    </>
  )
}

export default App
