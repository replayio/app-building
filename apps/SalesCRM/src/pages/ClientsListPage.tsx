import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchClients } from "../clientsSlice";
import type { Client } from "../clientsSlice";
import { ClientsListHeader } from "../components/ClientsListHeader";
import { ClientsSearchAndFilters } from "../components/ClientsSearchAndFilters";
import { ClientsTable } from "../components/ClientsTable";
import { ClientsPagination } from "../components/ClientsPagination";
import { AddClientModal } from "../components/AddClientModal";

const PAGE_SIZE = 50;

export function ClientsListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: clients, loading } = useSelector((state: RootState) => state.clients as { items: Client[]; loading: boolean; error: string | null });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("updated_desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  // Derive unique tag options from data
  const tagOptions = useMemo(() => {
    const tagSet = new Set<string>();
    clients.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    const sorted = Array.from(tagSet).sort();
    return [
      { value: "", label: "Tags: All" },
      ...sorted.map((t) => ({ value: t, label: t })),
    ];
  }, [clients]);

  // Derive unique source options from data
  const sourceOptions = useMemo(() => {
    const sourceSet = new Set<string>();
    clients.forEach((c) => {
      if (c.sourceType) sourceSet.add(c.sourceType);
    });
    const sorted = Array.from(sourceSet).sort();
    return [
      { value: "", label: "Source: All" },
      ...sorted.map((s) => ({ value: s, label: s })),
    ];
  }, [clients]);

  // Filter clients
  const filtered = useMemo(() => {
    let result = clients;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          (c.primaryContact && c.primaryContact.name.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Tag filter
    if (tagFilter) {
      result = result.filter((c) => c.tags.includes(tagFilter));
    }

    // Source filter
    if (sourceFilter) {
      result = result.filter((c) => c.sourceType === sourceFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "created_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "created_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "updated_desc":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [clients, search, statusFilter, tagFilter, sourceFilter, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, tagFilter, sourceFilter, sortBy]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading && clients.length === 0) {
    return (
      <div className="clients-page p-6 max-sm:p-3" data-testid="clients-list-page">
        <div className="page-header">
          <h1 className="page-title">Clients</h1>
        </div>
        <div className="clients-loading">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="clients-page p-6 max-sm:p-3" data-testid="clients-list-page">
      <ClientsListHeader onAddClient={() => setAddModalOpen(true)} />

      <ClientsSearchAndFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        tag={tagFilter}
        onTagChange={setTagFilter}
        source={sourceFilter}
        onSourceChange={setSourceFilter}
        sort={sortBy}
        onSortChange={setSortBy}
        tagOptions={tagOptions}
        sourceOptions={sourceOptions}
      />

      <ClientsTable clients={paginated} />

      <ClientsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

      <AddClientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
