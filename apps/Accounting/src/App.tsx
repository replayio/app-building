import { Routes, Route, Navigate } from "react-router-dom";
import { AccountsPage } from "./pages/AccountsPage";
import { AccountDetailPage } from "./pages/AccountDetailPage";
import { ReportListPage } from "./pages/ReportListPage";
import { ReportDetailsPage } from "./pages/ReportDetailsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BudgetsPage } from "./pages/BudgetsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/accounts" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/accounts/:id" element={<AccountDetailPage />} />
      <Route path="/reports" element={<ReportListPage />} />
      <Route path="/reports/:id" element={<ReportDetailsPage />} />
      <Route path="/budgets" element={<BudgetsPage />} />
    </Routes>
  );
}
