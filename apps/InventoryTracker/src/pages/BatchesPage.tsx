import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchBatches } from "../slices/batchesSlice";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { FilterSelect } from "@shared/components/FilterSelect";
import type { Batch } from "../types";

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function statusDotColor(status: string): string {
  switch (status) {
    case "active":
      return "var(--accent-primary)";
    case "depleted":
      return "var(--status-error)";
    case "expired":
      return "var(--status-warning)";
    default:
      return "var(--text-muted)";
  }
}

export function BatchesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items: batches, loading } = useAppSelector((state) => state.batches);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBatches());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, materialFilter]);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "depleted", label: "Depleted" },
    { value: "expired", label: "Expired" },
  ];

  const materialOptions = useMemo(() => {
    const materialMap = new Map<string, string>();
    for (const b of batches) {
      if (b.material_id && b.material_name) {
        materialMap.set(b.material_id, b.material_name);
      }
    }
    const options = [{ value: "", label: "All Materials" }];
    for (const [id, name] of materialMap) {
      options.push({ value: id, label: name });
    }
    return options;
  }, [batches]);

  const filteredBatches = useMemo(() => {
    let filtered = [...batches];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          (b.material_name || "").toLowerCase().includes(q) ||
          (b.account_name || "").toLowerCase().includes(q) ||
          (b.lot_number || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (materialFilter) {
      filtered = filtered.filter((b) => b.material_id === materialFilter);
    }

    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return filtered;
  }, [batches, search, statusFilter, materialFilter]);

  const totalItems = filteredBatches.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalItems);
  const paginatedBatches = filteredBatches.slice(startIdx, endIdx);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (loading) {
    return (
      <div data-testid="batches-page" className="page-content p-6 max-sm:p-3">
        <div className="loading-state">Loading batches...</div>
      </div>
    );
  }

  return (
    <div data-testid="batches-page" className="page-content p-6 max-sm:p-3">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Batches" },
        ]}
      />

      <div className="page-header" style={{ marginTop: 16 }}>
        <h1 className="page-title">Batches</h1>
      </div>

      <div className="filter-bar" data-testid="batches-filter-bar">
        <div
          className="search-input-wrapper"
          style={{ flex: 1, maxWidth: 300 }}
        >
          <svg
            className="search-input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            data-testid="batches-search"
            type="text"
            placeholder="Search batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterSelect
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by Status"
          testId="status-filter"
        />

        <FilterSelect
          options={materialOptions}
          value={materialFilter}
          onChange={setMaterialFilter}
          placeholder="Filter by Material"
          testId="material-filter"
        />
      </div>

      <div className="section-card" data-testid="batches-table-card">
        <div className="section-card-body" style={{ padding: 0 }}>
          {paginatedBatches.length === 0 ? (
            <div className="empty-state" data-testid="batches-empty">
              <div className="empty-state-message">
                {batches.length === 0
                  ? "No batches found"
                  : "No batches match your filters"}
              </div>
            </div>
          ) : (
            <table className="data-table" data-testid="batches-data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Material</th>
                  <th>Account</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBatches.map((batch: Batch) => (
                  <tr
                    key={batch.id}
                    className="clickable"
                    data-testid={`batch-row-${batch.id}`}
                    onClick={() => navigate(`/batches/${batch.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <a
                        className="link"
                        data-testid={`batch-link-${batch.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/batches/${batch.id}`);
                        }}
                        href={`/batches/${batch.id}`}
                      >
                        {batch.id.substring(0, 13)}
                      </a>
                    </td>
                    <td>{batch.material_name || "—"}</td>
                    <td>{batch.account_name || "—"}</td>
                    <td>
                      {Number(batch.quantity).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {batch.unit}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: statusDotColor(batch.status),
                            display: "inline-block",
                          }}
                        />
                        {batch.status.charAt(0).toUpperCase() +
                          batch.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(batch.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="pagination" data-testid="batches-pagination">
          <button
            className="pagination-btn"
            data-testid="pagination-previous"
            disabled={safePage <= 1}
            onClick={() => handlePageChange(safePage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-btn ${page === safePage ? "pagination-btn--active" : ""}`}
              data-testid={`pagination-page-${page}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-btn"
            data-testid="pagination-next"
            disabled={safePage >= totalPages}
            onClick={() => handlePageChange(safePage + 1)}
          >
            Next
          </button>

          <span className="pagination-info" data-testid="pagination-showing">
            Showing {totalItems === 0 ? 0 : startIdx + 1}-{endIdx} of{" "}
            {totalItems} batches
          </span>
        </div>
      )}
    </div>
  );
}
