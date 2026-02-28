import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Navbar } from './components/Navbar';
import { MainPage } from './pages/MainPage';
import { AppPage } from './pages/AppPage';
import { RequestPage } from './pages/RequestPage';

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/apps/:id" element={<AppPage />} />
          <Route path="/request" element={<RequestPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
