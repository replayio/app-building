import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertTriangle,
  Grid3x3,
  ChevronRight,
  Plus,
  Calendar,
} from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchDashboardData, dismissAlert } from '../../store/dashboardSlice';
import { fetchCategories } from '../../store/categoriesSlice';
import type { LowInventoryAlert, DashboardCategoryOverview, Transaction } from '../../types';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/* ---------- Sub-components ---------- */

function DashboardPageHeader() {
  return (
    <div className="page-header">
      <h1 className="page-heading" data-testid="page-heading">Dashboard Overview</h1>
    </div>
  );
}

function DateRangeFilter({
  dateFrom,
  dateTo,
  onChange,
}: {
  dateFrom: string;
  dateTo: string;
  onChange: (from: string, to: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="filter-group" data-testid="date-range-filter">
      <label>Filter by Date:</label>
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-outline"
          onClick={() => setOpen(!open)}
          data-testid="date-range-btn"
        >
          <Calendar />
          <span>
            {dateFrom && dateTo
              ? `${formatDate(dateFrom)} - ${formatDate(dateTo)}`
              : 'Select date range'}
          </span>
        </button>
        {open && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 100,
              background: '#fff',
              border: '1px solid var(--bg-border-color)',
              borderRadius: 6,
              padding: 12,
              marginTop: 4,
              boxShadow: 'var(--shadow-elevation-1)',
            }}
            data-testid="date-range-picker"
          >
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={dateFrom}
                onChange={(e) => onChange(e.target.value, dateTo)}
                data-testid="date-from-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={dateTo}
                onChange={(e) => onChange(dateFrom, e.target.value)}
                data-testid="date-to-input"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setOpen(false)}
              data-testid="date-range-apply"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="filter-group" data-testid="category-filter">
      <label>Category Filter:</label>
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="category-filter-select"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function NewTransactionButton() {
  const navigate = useNavigate();
  return (
    <button
      className="btn btn-primary"
      onClick={() => navigate('/transactions/new')}
      data-testid="new-transaction-btn"
    >
      <Plus />
      <span>New Transaction</span>
    </button>
  );
}

function LowInventoryAlerts({
  alerts,
  onDismiss,
}: {
  alerts: LowInventoryAlert[];
  onDismiss: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="section" data-testid="low-inventory-alerts-section">
      <div className="section-header">
        <h2 className="section-title" data-testid="low-inventory-alerts-heading">
          <AlertTriangle />
          Low Inventory Alerts
        </h2>
      </div>
      {alerts.length === 0 ? (
        <div className="table-empty" data-testid="alerts-empty-state">
          No low inventory alerts
        </div>
      ) : (
        <div data-testid="alerts-list">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-row ${alert.severity}`}
              data-testid={`alert-row-${alert.id}`}
            >
              <div className={`alert-icon ${alert.severity}`}>
                <AlertTriangle />
              </div>
              <span className={`alert-severity ${alert.severity}`} data-testid={`alert-severity-${alert.id}`}>
                {alert.severity === 'critical' ? 'Critical' : 'Warning'}
              </span>
              <span className="alert-description" data-testid={`alert-description-${alert.id}`}>
                {alert.severity === 'critical'
                  ? `'${alert.materialName}' is critically low. Current: ${formatNumber(alert.currentStock)} ${alert.unit}. Reorder Point: ${formatNumber(alert.reorderPoint)} ${alert.unit}.`
                  : `'${alert.materialName}' is low. Current: ${formatNumber(alert.currentStock)} ${alert.unit}. Reorder Point: ${formatNumber(alert.reorderPoint)} ${alert.unit}.`}
              </span>
              <div className="alert-actions">
                <Link
                  to={`/materials/${alert.materialId}`}
                  className="btn btn-ghost"
                  data-testid={`alert-view-details-${alert.id}`}
                >
                  View Details
                  <ChevronRight />
                </Link>
                <button
                  className="btn btn-ghost"
                  onClick={() => onDismiss(alert.id)}
                  data-testid={`alert-dismiss-${alert.id}`}
                >
                  Dismiss
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    navigate(`/transactions/new?materialId=${alert.materialId}`)
                  }
                  data-testid={`alert-reorder-${alert.id}`}
                >
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MaterialsCategoriesOverview({
  categories,
}: {
  categories: DashboardCategoryOverview[];
}) {
  return (
    <div className="section" data-testid="materials-categories-section">
      <div className="section-header">
        <h2 className="section-title" data-testid="materials-categories-heading">
          <Grid3x3 />
          Materials Categories Overview
        </h2>
        <Link to="/materials" className="link" data-testid="view-all-categories-link">
          View All Categories
        </Link>
      </div>
      {categories.length === 0 ? (
        <div className="table-empty" data-testid="categories-empty-state">
          No material categories found
        </div>
      ) : (
        <div className="categories-grid" data-testid="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card" data-testid={`category-card-${cat.id}`}>
              <div className="category-name" data-testid={`category-name-${cat.id}`}>
                {cat.name}
              </div>
              <div className="category-stats" data-testid={`category-stats-${cat.id}`}>
                (Total: {formatNumber(cat.totalItems)} Items, {formatNumber(cat.totalUnits)} Units)
              </div>
              <div>
                {cat.topMaterials.map((mat) => (
                  <div key={mat.id} className="category-material">
                    <Link
                      to={`/materials/${mat.id}`}
                      data-testid={`category-material-link-${mat.id}`}
                    >
                      {mat.name}
                    </Link>
                    : {formatNumber(mat.quantity)} {mat.unit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentTransactionsTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="section" data-testid="recent-transactions-section">
      <div className="section-header">
        <h2 className="section-title" data-testid="recent-transactions-heading">
          Recent Transactions
        </h2>
        <Link
          to="/transactions"
          className="link"
          data-testid="view-all-transactions-link"
        >
          View All Transactions
        </Link>
      </div>
      <table className="data-table" data-testid="recent-transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Accounts Affected</th>
            <th>Materials & Amounts</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="table-empty" data-testid="transactions-empty-state">
                No recent transactions
              </td>
            </tr>
          ) : (
            transactions.map((txn) => (
              <tr key={txn.id} data-testid={`transaction-row-${txn.id}`}>
                <td data-testid={`transaction-date-${txn.id}`}>{formatDate(txn.date)}</td>
                <td data-testid={`transaction-ref-${txn.id}`}>{txn.referenceId}</td>
                <td data-testid={`transaction-accounts-${txn.id}`}>{txn.accountsAffected}</td>
                <td data-testid={`transaction-materials-${txn.id}`}>{txn.materialsAndAmounts}</td>
                <td>
                  <Link
                    to={`/transactions/${txn.id}`}
                    className="btn btn-ghost"
                    data-testid={`transaction-view-details-${txn.id}`}
                  >
                    View Full Details
                    <ChevronRight />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { alerts, categories, recentTransactions, loading } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { categories: allCategories } = useSelector(
    (state: RootState) => state.categories
  );

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadData = useCallback(() => {
    const params: { dateFrom?: string; dateTo?: string; categoryId?: string } = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (categoryFilter) params.categoryId = categoryFilter;
    dispatch(fetchDashboardData(params));
  }, [dispatch, dateFrom, dateTo, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleDismiss = (alertId: string) => {
    dispatch(dismissAlert(alertId));
  };

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  return (
    <div data-testid="dashboard-page">
      <DashboardPageHeader />

      <div className="filter-bar" data-testid="dashboard-filter-bar">
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={handleDateChange}
        />
        <CategoryFilter
          categories={allCategories}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
        <div className="ml-auto">
          <NewTransactionButton />
        </div>
      </div>

      {loading ? (
        <div className="table-empty">Loading...</div>
      ) : (
        <>
          <LowInventoryAlerts
            alerts={alerts.filter((a) => !a.dismissed)}
            onDismiss={handleDismiss}
          />
          <MaterialsCategoriesOverview categories={categories} />
          <RecentTransactionsTable transactions={recentTransactions} />
        </>
      )}
    </div>
  );
}
