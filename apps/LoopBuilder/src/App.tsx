import { Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage'
import AppPage from './pages/AppPage'
import RequestPage from './pages/RequestPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/apps/:id" element={<AppPage />} />
      <Route path="/request" element={<RequestPage />} />
    </Routes>
  )
}

export default App
