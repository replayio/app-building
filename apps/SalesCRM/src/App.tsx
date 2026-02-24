import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Sidebar from './components/Sidebar'
import ClientsListPage from './pages/ClientsListPage'
import TasksListPage from './pages/TasksListPage'
import ClientDetailPage from './pages/ClientDetailPage'
import PersonDetailPage from './pages/PersonDetailPage'
import DealDetailPage from './pages/DealDetailPage'
import DealsListPage from './pages/DealsListPage'

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="/login" element={<PlaceholderPage name="Login" />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<PlaceholderPage name="Dashboard" />} />
            <Route path="/clients" element={<ClientsListPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailPage />} />
            <Route path="/individuals/:individualId" element={<PersonDetailPage />} />
            <Route path="/deals" element={<DealsListPage />} />
            <Route path="/deals/:dealId" element={<DealDetailPage />} />
            <Route path="/tasks" element={<TasksListPage />} />
            <Route path="/reports" element={<PlaceholderPage name="Reports" />} />
            <Route path="/settings" element={<PlaceholderPage name="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-full p-6 max-sm:p-3">
      <h1 className="text-2xl font-semibold text-text-secondary">{name}</h1>
    </div>
  )
}

export default App
