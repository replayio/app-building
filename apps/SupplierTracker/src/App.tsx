import { Routes, Route, Navigate } from "react-router-dom";
import { TopNavBar } from "./components/TopNavBar";
import { DashboardPage } from "./pages/DashboardPage";
import { SupplierDetailsPage } from "./pages/SupplierDetailsPage";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";

export function App() {
  return (
    <div className="app-shell">
      <TopNavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/suppliers/:supplierId" element={<SupplierDetailsPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
