import { Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage'
import AppPage from './pages/AppPage'
import RequestPage from './pages/RequestPage'
import StatusPage from './pages/StatusPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/apps/:id" element={<AppPage />} />
      <Route path="/request" element={<RequestPage />} />
      <Route path="/status" element={<StatusPage />} />
    </Routes>
  )
}

export default App
