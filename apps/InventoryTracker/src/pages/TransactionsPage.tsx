import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchTransactions } from "../slices/transactionsSlice";
import { fetchAccounts } from "../slices/accountsSlice";
import { fetchMaterials } from "../slices/materialsSlice";
import { TransactionsPageHeader } from "../components/TransactionsPageHeader";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { AccountFilter } from "../components/AccountFilter";
import { MaterialFilter } from "../components/MaterialFilter";
import { TransactionTypeFilter } from "../components/TransactionTypeFilter";
import { TransactionsSearchBar } from "../components/TransactionsSearchBar";
import { TransactionsTable } from "../components/TransactionsTable";
import { TransactionsPagination } from "../components/TransactionsPagination";
import type { TransactionSortOption } from "../components/TransactionsTable";
import type { QuantityTransfer } from "../types";

const DEFAULT_ROWS_PER_PAGE = 10;

export function TransactionsPage() {
  const dispatch = useAppDispatch();

  const { items: transactions, loading } = useAppSelector((state) => state.transactions);
  const { items: accounts } = useAppSelector((state) => state.accounts);
  const { items: materials } = useAppSelector((state) => state.materials);

  // Filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [transactionType, setTransactionType] = useState("");
  const [search, setSearch] = useState("");

  // Sort and pagination state
  const [sortBy, setSortBy] = useState<TransactionSortOption>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchAccounts());
    dispatch(fetchMaterials());
  }, [dispatch]);

  // Reset to page 1 when any filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo, selectedAccountIds, selectedMaterialIds, transactionType, search, sortBy, rowsPerPage]);

  // Client-side filtering
  const filteredAndSorted = useMemo(() => {
    let filtered = [...transactions];

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((t) => {
        const tDate = t.date.split("T")[0];
        return tDate >= dateFrom;
      });
    }
    if (dateTo) {
      filtered = filtered.filter((t) => {
        const tDate = t.date.split("T")[0];
        return tDate <= dateTo;
      });
    }

    // Account filter (multi-select): show transactions involving ANY of the selected accounts
    if (selectedAccountIds.length > 0) {
      filtered = filtered.filter((t) => {
        if (!t.transfers || t.transfers.length === 0) return false;
        return t.transfers.some(
          (tr: QuantityTransfer) =>
            selectedAccountIds.includes(tr.source_account_id) ||
            selectedAccountIds.includes(tr.destination_account_id)
        );
      });
    }

    // Material filter (multi-select): show transactions involving ANY of the selected materials
    if (selectedMaterialIds.length > 0) {
      filtered = filtered.filter((t) => {
        if (!t.transfers || t.transfers.length === 0) return false;
        return t.transfers.some((tr: QuantityTransfer) => selectedMaterialIds.includes(tr.material_id));
      });
    }

    // Transaction type filter
    if (transactionType) {
      filtered = filtered.filter((t) => t.transaction_type === transactionType);
    }

    // Search filter (case-insensitive, matches reference_id or description)
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.reference_id && t.reference_id.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.id.toLowerCase().includes(q)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at);
        case "date-asc":
          return a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at);
        case "id-desc":
          return (b.reference_id || b.id).localeCompare(a.reference_id || a.id);
        case "id-asc":
          return (a.reference_id || a.id).localeCompare(b.reference_id || b.id);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, dateFrom, dateTo, selectedAccountIds, selectedMaterialIds, transactionType, search, sortBy]);

  // Pagination calculations
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, totalItems);
  const paginatedTransactions = filteredAndSorted.slice(startIdx, endIdx);

  const handleDateRangeChange = useCallback((from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  }, []);

  const handleClearFilters = useCallback(() => {
    setDateFrom("");
    setDateTo("");
    setSelectedAccountIds([]);
    setSelectedMaterialIds([]);
    setTransactionType("");
    setSearch("");
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = useCallback((rows: number) => {
    setRowsPerPage(rows);
  }, []);

  if (loading) {
    return (
      <div data-testid="transactions-page" className="page-content p-6 max-sm:p-3">
        <div className="loading-state">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div data-testid="transactions-page" className="page-content p-6 max-sm:p-3">
      <TransactionsPageHeader />

      {/* Filters section */}
      <div data-testid="transactions-filters" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }} data-testid="filters-label">Filters</span>
          <button
            data-testid="clear-filters-btn"
            className="btn-ghost"
            onClick={handleClearFilters}
            type="button"
            style={{ fontSize: 13, color: "var(--accent-primary)" }}
          >
            Clear Filters
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, alignItems: "start" }}>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateRangeChange}
            label="Date Range"
            className=""
          />
          <AccountFilter
            accounts={accounts}
            selectedAccountIds={selectedAccountIds}
            onChange={setSelectedAccountIds}
          />
          <MaterialFilter
            materials={materials}
            selectedMaterialIds={selectedMaterialIds}
            onChange={setSelectedMaterialIds}
          />
          <TransactionTypeFilter
            value={transactionType}
            onChange={setTransactionType}
          />
        </div>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <TransactionsSearchBar value={search} onChange={setSearch} />
      </div>

      {/* Transactions table */}
      <TransactionsTable
        transactions={paginatedTransactions}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalFiltered={totalItems}
        startIndex={startIdx}
        endIndex={endIdx}
      />

      {/* Pagination */}
      <TransactionsPagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIdx}
        endIndex={endIdx}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
}
