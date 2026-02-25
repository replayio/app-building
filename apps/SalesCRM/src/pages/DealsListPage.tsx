import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchDeals, fetchDealClients, fetchDealUsers } from "../dealsSlice";
import type { Deal, DealClient, DealUser } from "../dealsSlice";
import { DealsListHeader } from "../components/DealsListHeader";
import { DealsSummaryCards } from "../components/DealsSummaryCards";
import { ViewToggle } from "../components/ViewToggle";
import { DealsFilters } from "../components/DealsFilters";
import { DealsTable } from "../components/DealsTable";
import { PipelineView } from "../components/PipelineView";
import { DealsPagination } from "../components/DealsPagination";
import { CreateDealModal } from "../components/CreateDealModal";
import { EditDealModal } from "../components/EditDealModal";

const PAGE_SIZE = 50;

interface DealsSliceState {
  items: Deal[];
  clients: DealClient[];
  users: DealUser[];
  loading: boolean;
  error: string | null;
}

function selectDeals(state: RootState) {
  return (state as unknown as { deals: DealsSliceState }).deals;
}

export function DealsListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: deals, clients, users, loading } = useSelector(selectDeals);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [view, setView] = useState<"table" | "pipeline">("table");
  const [stageFilter, setStageFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [sortBy, setSortBy] = useState("close_desc");
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchDeals());
    dispatch(fetchDealClients());
    dispatch(fetchDealUsers());
  }, [dispatch]);

  const clientOptions = useMemo(() => {
    return [
      { value: "", label: "All Clients" },
      ...clients.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [clients]);

  const filtered = useMemo(() => {
    let result = deals;

    // Search filter (deal name or client name)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.clientName && d.clientName.toLowerCase().includes(q))
      );
    }

    // Stage filter
    if (stageFilter) {
      result = result.filter((d) => d.stage === stageFilter);
    }

    // Client filter
    if (clientFilter) {
      result = result.filter((d) => d.clientId === clientFilter);
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Date range filter
    if (dateStart) {
      result = result.filter((d) => d.expectedCloseDate && d.expectedCloseDate >= dateStart);
    }
    if (dateEnd) {
      result = result.filter((d) => d.expectedCloseDate && d.expectedCloseDate <= dateEnd);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "close_desc": {
          const aDate = a.expectedCloseDate || "";
          const bDate = b.expectedCloseDate || "";
          return bDate.localeCompare(aDate);
        }
        case "close_asc": {
          const aDate = a.expectedCloseDate || "";
          const bDate = b.expectedCloseDate || "";
          return aDate.localeCompare(bDate);
        }
        case "value_desc":
          return (b.value || 0) - (a.value || 0);
        case "value_asc":
          return (a.value || 0) - (b.value || 0);
        case "name_asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [deals, search, stageFilter, clientFilter, statusFilter, dateStart, dateEnd, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter, clientFilter, statusFilter, dateStart, dateEnd, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading && deals.length === 0) {
    return (
      <div className="deals-page p-6 max-sm:p-3" data-testid="deals-list-page">
        <div className="page-header">
          <div>
            <div className="deals-breadcrumb">/deals</div>
            <h1 className="page-title">Deals List</h1>
          </div>
        </div>
        <div className="deals-loading">Loading deals...</div>
      </div>
    );
  }

  return (
    <div className="deals-page p-6 max-sm:p-3" data-testid="deals-list-page">
      <DealsListHeader onCreateDeal={() => setCreateModalOpen(true)} />

      <DealsSummaryCards deals={deals} />

      <div className="deals-controls">
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      <DealsFilters
        stage={stageFilter}
        onStageChange={setStageFilter}
        client={clientFilter}
        onClientChange={setClientFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        sort={sortBy}
        onSortChange={setSortBy}
        search={search}
        onSearchChange={setSearch}
        dateStart={dateStart}
        onDateStartChange={setDateStart}
        dateEnd={dateEnd}
        onDateEndChange={setDateEnd}
        clientOptions={clientOptions}
      />

      {view === "table" ? (
        <>
          <DealsTable
            deals={paginated}
            sort={sortBy}
            onSortChange={setSortBy}
            onEditDeal={(deal) => setEditDeal(deal)}
          />
          <DealsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <PipelineView deals={filtered} />
      )}

      <CreateDealModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        clients={clients}
        users={users}
      />

      <EditDealModal
        open={editDeal !== null}
        onClose={() => setEditDeal(null)}
        deal={editDeal}
        users={users}
      />
    </div>
  );
}
