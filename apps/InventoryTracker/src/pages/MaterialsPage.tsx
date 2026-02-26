import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMaterials, createMaterial } from "../slices/materialsSlice";
import { fetchCategories, createCategory } from "../slices/categoriesSlice";
import { fetchAccounts } from "../slices/accountsSlice";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { FilterSelect } from "@shared/components/FilterSelect";
import { MaterialsTable } from "../components/MaterialsTable";
import type { MaterialCategory, Account } from "../types";

const PAGE_SIZE = 8;

type SortOption =
  | "name-asc"
  | "name-desc"
  | "stock-asc"
  | "stock-desc"
  | "category-asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "stock-asc", label: "Stock (Low to High)" },
  { value: "stock-desc", label: "Stock (High to Low)" },
  { value: "category-asc", label: "Category (A-Z)" },
];

export function MaterialsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items: materials, loading } = useAppSelector(
    (state) => state.materials
  );
  const { items: categories } = useAppSelector((state) => state.categories);
  const { items: accounts } = useAppSelector((state) => state.accounts);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Create material modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [createUnit, setCreateUnit] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  // Create category modal state
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Sort dropdown state
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (accountFilter) {
      dispatch(fetchMaterials({ account_id: accountFilter }));
    } else {
      dispatch(fetchMaterials());
    }
  }, [dispatch, accountFilter]);

  // Reset to page 1 when filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, accountFilter, sortBy]);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortOpen]);

  const filteredAndSorted = useMemo(() => {
    let filtered = [...materials];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(q));
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((m) => m.category_id === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "stock-asc":
          return (a.stock ?? 0) - (b.stock ?? 0);
        case "stock-desc":
          return (b.stock ?? 0) - (a.stock ?? 0);
        case "category-asc":
          return (a.category_name || "").localeCompare(
            b.category_name || ""
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [materials, search, categoryFilter, sortBy]);

  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalItems);
  const paginatedMaterials = filteredAndSorted.slice(startIdx, endIdx);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All Categories" },
      ...categories.map((c: MaterialCategory) => ({ value: c.id, label: c.name })),
    ],
    [categories]
  );

  const accountOptions = useMemo(
    () => [
      { value: "", label: "All Accounts" },
      ...accounts.map((a: Account) => ({ value: a.id, label: a.name })),
    ],
    [accounts]
  );

  const categoryOptionsForModal = useMemo(
    () => categories.map((c: MaterialCategory) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const handleOpenCreateMaterial = () => {
    setCreateName("");
    setCreateCategoryId("");
    setCreateUnit("");
    setCreateDescription("");
    setCreateErrors({});
    setCreateModalOpen(true);
  };

  const handleCreateMaterial = async () => {
    const errors: Record<string, string> = {};
    if (!createName.trim()) errors.name = "Material Name is required";
    if (!createCategoryId) errors.category = "Category is required";
    if (!createUnit.trim()) errors.unit = "Unit of Measure is required";

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    await dispatch(
      createMaterial({
        name: createName.trim(),
        category_id: createCategoryId,
        unit_of_measure: createUnit.trim(),
        description: createDescription.trim(),
      })
    );
    setCreateModalOpen(false);
  };

  const handleOpenCreateCategory = () => {
    setNewCategoryName("");
    setCategoryError("");
    setCreateCategoryModalOpen(true);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError("Category Name is required");
      return;
    }
    await dispatch(
      createCategory({
        name: newCategoryName.trim(),
        description: "",
      })
    );
    setCreateCategoryModalOpen(false);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "";

  if (loading) {
    return (
      <div data-testid="materials-page" className="page-content p-6 max-sm:p-3">
        <div className="loading-state">Loading materials...</div>
      </div>
    );
  }

  return (
    <div data-testid="materials-page" className="page-content p-6 max-sm:p-3">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Materials" },
        ]}
      />

      <div className="page-header" style={{ marginTop: 16 }}>
        <h1 className="page-title">Materials</h1>
        <div className="page-header-actions">
          <button
            data-testid="new-material-btn"
            className="btn-primary"
            onClick={handleOpenCreateMaterial}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 16, height: 16 }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="max-sm:hidden">New Material</span>
          </button>
          <button
            data-testid="new-category-btn"
            className="btn-secondary"
            onClick={handleOpenCreateCategory}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 16, height: 16 }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="max-sm:hidden">New Category</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" data-testid="materials-filter-bar">
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
            data-testid="materials-search"
            type="text"
            placeholder="Search materials by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterSelect
          options={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
          placeholder="Filter by Category"
          testId="category-filter"
        />

        <FilterSelect
          options={accountOptions}
          value={accountFilter}
          onChange={setAccountFilter}
          placeholder="Filter by Account"
          testId="account-filter"
        />

        <div
          ref={sortRef}
          data-testid="sort-dropdown"
          className={`custom-dropdown ${sortOpen ? "custom-dropdown--open" : ""}`}
        >
          <button
            className="custom-dropdown-trigger"
            data-testid="sort-dropdown-trigger"
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
          >
            Sort by: {sortLabel}
            <svg
              className="custom-dropdown-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {sortOpen && (
            <div
              className="custom-dropdown-menu"
              data-testid="sort-dropdown-menu"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`custom-dropdown-item ${opt.value === sortBy ? "custom-dropdown-item--selected" : ""}`}
                  data-testid={`sort-option-${opt.value}`}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.value);
                    setSortOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Materials Table */}
      <MaterialsTable
        materials={paginatedMaterials}
        categories={categories}
      />

      {/* Pagination */}
      {totalItems > 0 && (
        <div
          className="pagination"
          data-testid="materials-pagination"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            paddingTop: 16,
          }}
        >
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

          <span
            className="pagination-info"
            data-testid="pagination-showing"
          >
            Showing {totalItems === 0 ? 0 : startIdx + 1}-{endIdx} of{" "}
            {totalItems} items
          </span>
        </div>
      )}

      {/* Create Material Modal */}
      {createModalOpen && (
        <div
          className="modal-overlay"
          data-testid="create-material-modal-overlay"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="modal-content"
            data-testid="create-material-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Create Material</h2>
              <button
                className="modal-close-btn"
                data-testid="create-material-modal-close"
                onClick={() => setCreateModalOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Material Name</label>
              <input
                className="form-input"
                data-testid="create-material-name"
                value={createName}
                onChange={(e) => {
                  setCreateName(e.target.value);
                  setCreateErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Enter material name"
              />
              {createErrors.name && (
                <p
                  data-testid="create-material-name-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {createErrors.name}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <FilterSelect
                options={categoryOptionsForModal}
                value={createCategoryId}
                onChange={(v) => {
                  setCreateCategoryId(v);
                  setCreateErrors((prev) => ({ ...prev, category: "" }));
                }}
                placeholder="Select category"
                testId="create-material-category"
              />
              {createErrors.category && (
                <p
                  data-testid="create-material-category-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {createErrors.category}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <input
                className="form-input"
                data-testid="create-material-unit"
                value={createUnit}
                onChange={(e) => {
                  setCreateUnit(e.target.value);
                  setCreateErrors((prev) => ({ ...prev, unit: "" }));
                }}
                placeholder="Enter unit of measure"
              />
              {createErrors.unit && (
                <p
                  data-testid="create-material-unit-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {createErrors.unit}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                data-testid="create-material-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                data-testid="create-material-cancel-btn"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                data-testid="create-material-submit-btn"
                onClick={handleCreateMaterial}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {createCategoryModalOpen && (
        <div
          className="modal-overlay"
          data-testid="create-category-modal-overlay"
          onClick={() => setCreateCategoryModalOpen(false)}
        >
          <div
            className="modal-content"
            data-testid="create-category-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Create Category</h2>
              <button
                className="modal-close-btn"
                data-testid="create-category-modal-close"
                onClick={() => setCreateCategoryModalOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                className="form-input"
                data-testid="create-category-name"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setCategoryError("");
                }}
                placeholder="Enter category name"
              />
              {categoryError && (
                <p
                  data-testid="create-category-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {categoryError}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                data-testid="create-category-cancel-btn"
                onClick={() => setCreateCategoryModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                data-testid="create-category-submit-btn"
                onClick={handleCreateCategory}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
