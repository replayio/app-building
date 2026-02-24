import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './components/pages/DashboardPage';
import AccountsPage from './components/pages/AccountsPage';
import AccountDetailPage from './components/pages/AccountDetailPage';
import MaterialsPage from './components/pages/MaterialsPage';
import MaterialDetailPage from './components/pages/MaterialDetailPage';
import BatchDetailPage from './components/pages/BatchDetailPage';
import TransactionsPage from './components/pages/TransactionsPage';
import TransactionDetailPage from './components/pages/TransactionDetailPage';
import NewTransactionPage from './components/pages/NewTransactionPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/materials/:materialId" element={<MaterialDetailPage />} />
        <Route path="/batches/:batchId" element={<BatchDetailPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/new" element={<NewTransactionPage />} />
        <Route path="/transactions/:transactionId" element={<TransactionDetailPage />} />
      </Route>
    </Routes>
  );
}
