import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { deleteDeal } from "../dealsSlice";
import type { Deal } from "../dealsSlice";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";

function formatCurrency(value: number | null): string {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "On Track":
      return "badge badge--success";
    case "Needs Attention":
      return "badge badge--warning";
    case "At Risk":
      return "badge badge--error";
    case "Won":
      return "badge badge--success";
    case "Lost":
      return "badge badge--error";
    case "active":
      return "badge badge--success";
    default:
      return "badge badge--neutral";
  }
}

function formatStatus(status: string): string {
  if (status === "active") return "Active";
  return status;
}

interface DealsTableProps {
  deals: Deal[];
  sort: string;
  onSortChange: (value: string) => void;
  onEditDeal: (deal: Deal) => void;
}

function getSortDirection(sort: string): "desc" | "asc" | "none" {
  if (sort === "close_desc") return "desc";
  if (sort === "close_asc") return "asc";
  return "none";
}

function getSortArrow(direction: "desc" | "asc" | "none") {
  if (direction === "desc") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (direction === "asc") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 10V2M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 2v8M3 5l3-3 3 3M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionsMenu({ deal, onEdit }: { deal: Deal; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, handleClickOutside]);

  return (
    <div className="clients-actions-wrapper" ref={menuRef} style={{ position: "relative", zIndex: open ? 50 : 1 }}>
      <button
        className="btn btn--ghost clients-actions-btn"
        data-testid={`deal-actions-${deal.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="3" r="1" fill="currentColor" />
          <circle cx="7" cy="7" r="1" fill="currentColor" />
          <circle cx="7" cy="11" r="1" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="action-menu" data-testid={`deal-menu-${deal.id}`}>
          <button
            className="action-menu-item"
            data-testid={`deal-edit-${deal.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
            type="button"
          >
            Edit
          </button>
          <button
            className="action-menu-item"
            data-testid={`deal-view-${deal.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              navigate(`/deals/${deal.id}`);
            }}
            type="button"
          >
            View Details
          </button>
          <button
            className="action-menu-item action-menu-item--danger"
            data-testid={`deal-delete-${deal.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              setConfirmDelete(true);
            }}
            type="button"
          >
            Delete
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete Deal"
        message={`Are you sure you want to delete "${deal.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          dispatch(deleteDeal(deal.id));
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function DealsTable({ deals, sort, onSortChange, onEditDeal }: DealsTableProps) {
  const navigate = useNavigate();
  const sortDirection = getSortDirection(sort);

  function handleCloseDateSort() {
    if (sort === "close_desc") {
      onSortChange("close_asc");
    } else {
      onSortChange("close_desc");
    }
  }

  if (deals.length === 0) {
    return (
      <div className="deals-empty" data-testid="deals-table-empty">
        <p>No deals found matching your filters.</p>
      </div>
    );
  }

  return (
    <div data-testid="deals-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Deal Name</th>
            <th>Client</th>
            <th>Stage</th>
            <th>Owner</th>
            <th>Value</th>
            <th>
              <button
                className="deals-sort-header-btn"
                data-testid="close-date-sort"
                data-sort-direction={sortDirection}
                onClick={handleCloseDateSort}
                type="button"
              >
                Close Date
                {getSortArrow(sortDirection)}
              </button>
            </th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr
              key={deal.id}
              data-testid={`deal-row-${deal.id}`}
              className="deals-table-row"
              onClick={() => navigate(`/deals/${deal.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td className="deals-name-cell">{deal.name}</td>
              <td>{deal.clientName || "—"}</td>
              <td>{deal.stage}</td>
              <td>{deal.ownerName || "—"}</td>
              <td className="deals-value-cell">{deal.value != null ? formatCurrency(deal.value) : "—"}</td>
              <td>{deal.expectedCloseDate || "—"}</td>
              <td>
                <span className={statusBadgeClass(deal.status)} data-testid={`deal-status-${deal.id}`}>
                  {formatStatus(deal.status)}
                </span>
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <ActionsMenu deal={deal} onEdit={() => onEditDeal(deal)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
