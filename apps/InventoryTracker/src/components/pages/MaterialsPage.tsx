import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Eye, Pencil, Search } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchMaterials, createMaterial, updateMaterial } from '../../store/materialsSlice';
import { fetchCategories, createCategory } from '../../store/categoriesSlice';
import { fetchAccounts } from '../../store/accountsSlice';
import type { Material } from '../../types';
import Breadcrumb from '../shared/Breadcrumb';
import Modal from '../shared/Modal';

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

const PAGE_SIZE = 8;

/* ---------- Material Form Modal ---------- */

function MaterialFormModal({
  isOpen,
  onClose,
  onSave,
  editingMaterial,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; categoryId: string; unitOfMeasure: string; description: string }) => void;
  editingMaterial: Material | null;
  categories: { id: string; name: string }[];
}) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (editingMaterial) {
      setName(editingMaterial.name);
      setCategoryId(editingMaterial.categoryId);
      setUnitOfMeasure(editingMaterial.unitOfMeasure);
      setDescription(editingMaterial.description || '');
    } else {
      setName('');
      setCategoryId('');
      setUnitOfMeasure('');
      setDescription('');
    }
    setNameError('');
  }, [editingMaterial, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Material Name is required');
      return;
    }
    onSave({
      name: name.trim(),
      categoryId,
      unitOfMeasure: unitOfMeasure.trim(),
      description: description.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMaterial ? 'Edit Material' : 'New Material'}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} data-testid="modal-cancel-btn">
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} data-testid="modal-save-btn">
            Save
          </button>
        </>
      }
    >
      <div data-testid="material-form">
        <div className="form-group">
          <label className="form-label">Material Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="Enter material name"
            data-testid="material-name-input"
          />
          {nameError && <div className="form-error">{nameError}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            data-testid="material-category-select"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Unit of Measure</label>
          <input
            className="form-input"
            value={unitOfMeasure}
            onChange={(e) => setUnitOfMeasure(e.target.value)}
            placeholder="e.g., kg, units, meters"
            data-testid="material-uom-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            data-testid="material-description-input"
          />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Category Form Modal ---------- */

function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string }) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName('');
    setError('');
  }, [isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Category Name is required');
      return;
    }
    onSave({ name: name.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Category"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} data-testid="modal-cancel-btn">
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} data-testid="modal-save-btn">
            Save
          </button>
        </>
      }
    >
      <div data-testid="category-form">
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter category name"
            data-testid="category-name-input"
          />
          {error && <div className="form-error">{error}</div>}
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Pagination Component ---------- */

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination" data-testid="pagination">
      <div className="pagination-info" data-testid="pagination-info">
        Showing {start}-{end} of {total} items
      </div>
      <div className="pagination-controls">
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
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function MaterialsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { materials, total, totalPages, loading } = useSelector(
    (state: RootState) => state.materials
  );
  const { categories } = useSelector((state: RootState) => state.categories);
  const { accounts } = useSelector((state: RootState) => state.accounts);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const loadMaterials = useCallback(() => {
    dispatch(
      fetchMaterials({
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        accountId: accountFilter || undefined,
        sortBy,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
    );
  }, [dispatch, search, categoryFilter, accountFilter, sortBy, currentPage]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, accountFilter, sortBy]);

  const handleSaveMaterial = async (data: { name: string; categoryId: string; unitOfMeasure: string; description: string }) => {
    if (editingMaterial) {
      await dispatch(updateMaterial({ materialId: editingMaterial.id, data }));
    } else {
      await dispatch(createMaterial(data));
    }
    setMaterialModalOpen(false);
    setEditingMaterial(null);
    loadMaterials();
  };

  const handleSaveCategory = async (data: { name: string }) => {
    await dispatch(createCategory(data));
    setCategoryModalOpen(false);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setMaterialModalOpen(true);
  };

  return (
    <div data-testid="materials-page">
      <div className="page-header">
        <h1 className="page-heading" data-testid="page-heading">Materials</h1>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', testId: 'breadcrumb-home' },
            { label: 'Materials', testId: 'breadcrumb-materials' },
          ]}
        />
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-4" data-testid="materials-toolbar">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingMaterial(null);
            setMaterialModalOpen(true);
          }}
          data-testid="new-material-btn"
        >
          <Plus />
          <span>New Material</span>
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setCategoryModalOpen(true)}
          data-testid="new-category-btn"
        >
          <Plus />
          <span>New Category</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" data-testid="materials-filter-bar">
        <div className="filter-group" style={{ flex: 1, maxWidth: 300 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 28, width: '100%' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials by name..."
              data-testid="materials-search-input"
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Filter by Category:</label>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            data-testid="filter-category-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by Account:</label>
          <select
            className="form-select"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            data-testid="filter-account-select"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            data-testid="sort-by-select"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="stock_asc">Stock (Low to High)</option>
            <option value="stock_desc">Stock (High to Low)</option>
            <option value="category_asc">Category (A-Z)</option>
            <option value="category_desc">Category (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="table-empty">Loading...</div>
      ) : (
        <>
          <table className="data-table" data-testid="materials-table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Category</th>
                <th>Unit of Measure</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty" data-testid="materials-empty">
                    No materials found
                  </td>
                </tr>
              ) : (
                materials.map((mat) => (
                  <tr key={mat.id} data-testid={`material-row-${mat.id}`}>
                    <td data-testid={`material-name-${mat.id}`}>{mat.name}</td>
                    <td data-testid={`material-category-${mat.id}`}>{mat.categoryName}</td>
                    <td data-testid={`material-uom-${mat.id}`}>{mat.unitOfMeasure}</td>
                    <td data-testid={`material-stock-${mat.id}`}>{formatNumber(mat.stock)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/materials/${mat.id}`)}
                          title="View Detail"
                          data-testid={`view-material-${mat.id}`}
                        >
                          <Eye />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(mat)}
                          title="Edit"
                          data-testid={`edit-material-${mat.id}`}
                        >
                          <Pencil />
                        </button>
                        <Link
                          to={`/materials/${mat.id}`}
                          className="link"
                          data-testid={`view-detail-link-${mat.id}`}
                        >
                          View Detail
                        </Link>
                        <button
                          className="btn btn-ghost"
                          onClick={() => openEditModal(mat)}
                          data-testid={`edit-link-${mat.id}`}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {total > 0 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages || Math.ceil(total / PAGE_SIZE)}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      <MaterialFormModal
        isOpen={materialModalOpen}
        onClose={() => {
          setMaterialModalOpen(false);
          setEditingMaterial(null);
        }}
        onSave={handleSaveMaterial}
        editingMaterial={editingMaterial}
        categories={categories}
      />

      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
}
