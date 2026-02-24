import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, X } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchTransactions } from '../../store/transactionsSlice';
import { fetchAccounts } from '../../store/accountsSlice';
import { fetchCategories } from '../../store/categoriesSlice';
import Breadcrumb from '../shared/Breadcrumb';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const DEFAULT_PAGE_SIZE = 10;

/* ---------- Pagination ---------- */

function TransactionsPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const start = (page - 1) * pageSize + 1;

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination" data-testid="transactions-pagination">
      <div className="pagination-info" data-testid="pagination-info">
        Showing {total > 0 ? start : 0} of {total} results
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          data-testid="pagination-first"
        >
          First
        </button>
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          data-testid="pagination-prev"
        >
          Previous
        </button>
        {pageNumbers.map((num) => (
          <button
            key={num}
            className={`pagination-btn${num === page ? ' active' : ''}`}
            onClick={() => onPageChange(num)}
            data-testid={`pagination-page-${num}`}
          >
            {num}
          </button>
        ))}
        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          data-testid="pagination-next"
        >
          Next
        </button>
        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          data-testid="pagination-last"
        >
          Last
        </button>
      </div>
      <div className="filter-group">
        <label>Rows per page:</label>
        <select
          className="form-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          data-testid="rows-per-page-select"
          style={{ width: 70 }}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function TransactionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { transactions, total, totalPages, loading } = useSelector(
    (state: RootState) => state.transactions
  );
  const { accounts } = useSelector((state: RootState) => state.accounts);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const loadTransactions = useCallback(() => {
    dispatch(
      fetchTransactions({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        accountIds: selectedAccountIds.length > 0 ? selectedAccountIds : undefined,
        materialIds: selectedMaterialIds.length > 0 ? selectedMaterialIds : undefined,
        type: typeFilter || undefined,
        search: search || undefined,
        sortBy,
        page: currentPage,
        pageSize,
      })
    );
  }, [dispatch, dateFrom, dateTo, selectedAccountIds, selectedMaterialIds, typeFilter, search, sortBy, currentPage, pageSize]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo, selectedAccountIds, selectedMaterialIds, typeFilter, search, sortBy, pageSize]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedAccountIds([]);
    setSelectedMaterialIds([]);
    setTypeFilter('');
    setSearch('');
    setSortBy('date_desc');
  };

  const handleAccountSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setSelectedAccountIds(selected);
  };

  return (
    <div data-testid="transactions-page">
      <div className="page-header">
        <h1 className="page-heading" data-testid="page-heading">Transactions</h1>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', testId: 'breadcrumb-home' },
            { label: 'Transactions', testId: 'breadcrumb-transactions' },
          ]}
        />
      </div>

      <div className="flex-between mb-4">
        <div />
        <button
          className="btn btn-primary"
          onClick={() => navigate('/transactions/new')}
          data-testid="new-transaction-btn"
        >
          <Plus />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" data-testid="transactions-filter-bar" style={{ flexWrap: 'wrap' }}>
        <div className="filter-group">
          <label>Date From:</label>
          <input
            type="date"
            className="form-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            data-testid="filter-date-from"
          />
        </div>
        <div className="filter-group">
          <label>Date To:</label>
          <input
            type="date"
            className="form-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            data-testid="filter-date-to"
          />
        </div>
        <div className="filter-group">
          <label>Involved Account(s):</label>
          <select
            className="form-select"
            multiple
            value={selectedAccountIds}
            onChange={handleAccountSelect}
            data-testid="filter-accounts-select"
            style={{ minHeight: 32, width: 160 }}
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Transaction Type:</label>
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            data-testid="filter-type-select"
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="consumption">Consumption</option>
            <option value="transfer">Transfer</option>
            <option value="production">Production</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
        <button
          className="btn btn-ghost"
          onClick={clearFilters}
          data-testid="clear-filters-btn"
        >
          <X />
          Clear Filters
        </button>
        <div className="filter-group" style={{ flex: 1, maxWidth: 250 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 28, width: '100%' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              data-testid="transactions-search-input"
            />
          </div>
        </div>
      </div>

      <div className="flex-between mb-2">
        <div className="filter-group">
          <label>Sort by:</label>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            data-testid="sort-by-select"
          >
            <option value="date_desc">Date (Newest First)</option>
            <option value="date_asc">Date (Oldest First)</option>
            <option value="id_asc">ID (A-Z)</option>
            <option value="id_desc">ID (Z-A)</option>
          </select>
        </div>
        <div className="pagination-info text-xs" data-testid="results-count">
          Showing {total > 0 ? (currentPage - 1) * pageSize + 1 : 0} of {total} results
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="table-empty">Loading...</div>
      ) : (
        <>
          <table className="data-table" data-testid="transactions-table">
            <thead>
              <tr>
                <th data-testid="th-date" style={{ cursor: 'pointer' }} onClick={() => setSortBy(sortBy === 'date_asc' ? 'date_desc' : 'date_asc')}>
                  Date {sortBy.startsWith('date') ? (sortBy === 'date_asc' ? '↑' : '↓') : ''}
                </th>
                <th>Transaction ID</th>
                <th>Description</th>
                <th>Accounts Affected</th>
                <th>Materials and Amounts</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty" data-testid="transactions-empty">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="clickable-row"
                    onClick={() => navigate(`/transactions/${txn.id}`)}
                    data-testid={`transaction-row-${txn.id}`}
                  >
                    <td data-testid={`txn-date-${txn.id}`}>{formatDate(txn.date)}</td>
                    <td>
                      <Link
                        to={`/transactions/${txn.id}`}
                        className="link"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`txn-id-${txn.id}`}
                      >
                        {txn.id}
                      </Link>
                    </td>
                    <td data-testid={`txn-desc-${txn.id}`}>{txn.description}</td>
                    <td data-testid={`txn-accounts-${txn.id}`}>{txn.accountsAffected}</td>
                    <td data-testid={`txn-materials-${txn.id}`}>{txn.materialsAndAmounts}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {total > 0 && (
            <TransactionsPagination
              page={currentPage}
              totalPages={totalPages || Math.ceil(total / pageSize)}
              total={total}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      )}
    </div>
  );
}
