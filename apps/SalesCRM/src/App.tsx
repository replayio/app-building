import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import ClientsListPage from './pages/ClientsListPage'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="/dashboard" element={<PlaceholderPage name="Dashboard" />} />
          <Route path="/clients" element={<ClientsListPage />} />
          <Route path="/clients/:clientId" element={<PlaceholderPage name="Client Detail" />} />
          <Route path="/individuals/:individualId" element={<PlaceholderPage name="Person Detail" />} />
          <Route path="/deals" element={<PlaceholderPage name="Deals" />} />
          <Route path="/deals/:dealId" element={<PlaceholderPage name="Deal Detail" />} />
          <Route path="/tasks" element={<PlaceholderPage name="Tasks" />} />
          <Route path="/reports" element={<PlaceholderPage name="Reports" />} />
          <Route path="/settings" element={<PlaceholderPage name="Settings" />} />
          <Route path="/login" element={<PlaceholderPage name="Login" />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-screen p-6 max-sm:p-3">
      <h1 className="text-2xl font-semibold text-text-secondary">{name}</h1>
    </div>
  )
}

export default App
