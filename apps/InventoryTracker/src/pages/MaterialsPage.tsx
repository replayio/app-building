import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMaterials, createMaterial } from "../slices/materialsSlice";
import { fetchCategories, createCategory } from "../slices/categoriesSlice";
import { fetchAccounts } from "../slices/accountsSlice";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { FilterSelect } from "@shared/components/FilterSelect";
import { MaterialsTable } from "../components/MaterialsTable";
import { CreateMaterialModal } from "../components/CreateMaterialModal";
import { CreateCategoryModal } from "../components/CreateCategoryModal";
import { MaterialsSearchBar } from "../components/MaterialsSearchBar";
import { MaterialsSortDropdown } from "../components/MaterialsSortDropdown";
import { MaterialsPagination } from "../components/MaterialsPagination";
import type { SortOption } from "../components/MaterialsSortDropdown";
import type { MaterialCategory, Account } from "../types";

const PAGE_SIZE = 8;

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

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);

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

  const handleCreateMaterial = async (data: {
    name: string;
    category_id: string;
    unit_of_measure: string;
    description: string;
  }) => {
    await dispatch(createMaterial(data));
    setCreateModalOpen(false);
  };

  const handleCreateCategory = async (data: {
    name: string;
    description: string;
  }) => {
    await dispatch(createCategory(data));
    setCreateCategoryModalOpen(false);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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
            onClick={() => setCreateModalOpen(true)}
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
            onClick={() => setCreateCategoryModalOpen(true)}
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
        <MaterialsSearchBar value={search} onChange={setSearch} />

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

        <MaterialsSortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {/* Materials Table */}
      <MaterialsTable
        materials={paginatedMaterials}
        categories={categories}
      />

      {/* Pagination */}
      <MaterialsPagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIdx}
        endIndex={endIdx}
        onPageChange={handlePageChange}
      />

      {/* Create Material Modal */}
      {createModalOpen && (
        <CreateMaterialModal
          categoryOptions={categoryOptionsForModal}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateMaterial}
        />
      )}

      {/* Create Category Modal */}
      {createCategoryModalOpen && (
        <CreateCategoryModal
          onClose={() => setCreateCategoryModalOpen(false)}
          onSubmit={handleCreateCategory}
        />
      )}
    </div>
  );
}
