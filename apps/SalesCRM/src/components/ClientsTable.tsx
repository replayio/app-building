import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { deleteClient } from "../clientsSlice";
import type { Client } from "../clientsSlice";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";

function formatDealValue(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
}

function formatTaskDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "badge badge--success";
    case "inactive":
      return "badge badge--neutral";
    case "prospect":
      return "badge badge--warning";
    case "churned":
      return "badge badge--error";
    default:
      return "badge";
  }
}

interface ClientsTableProps {
  clients: Client[];
}

function ActionsMenu({ client }: { client: Client }) {
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
        data-testid={`client-actions-${client.id}`}
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
        <div className="action-menu" data-testid={`client-menu-${client.id}`}>
          <button
            className="action-menu-item"
            data-testid={`client-edit-${client.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              navigate(`/clients/${client.id}`);
            }}
            type="button"
          >
            Edit
          </button>
          <button
            className="action-menu-item action-menu-item--danger"
            data-testid={`client-delete-${client.id}`}
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
        title="Delete Client"
        message={`Are you sure you want to delete "${client.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          dispatch(deleteClient(client.id));
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const navigate = useNavigate();

  if (clients.length === 0) {
    return (
      <div className="clients-empty" data-testid="clients-table-empty">
        <p>No clients found matching your filters.</p>
      </div>
    );
  }

  return (
    <div data-testid="clients-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Client Name</th>
            <th className="max-md:hidden">Type</th>
            <th>Status</th>
            <th className="max-lg:hidden">Tags</th>
            <th className="max-md:hidden">Primary Contact</th>
            <th className="max-md:hidden">Open Deals</th>
            <th className="max-lg:hidden">Next Task</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              data-testid={`client-row-${client.id}`}
              className="clients-table-row"
              onClick={() => navigate(`/clients/${client.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td className="clients-name-cell">
                {client.name}
              </td>
              <td className="max-md:hidden">
                {client.type === "organization" ? "Organization" : "Individual"}
              </td>
              <td>
                <span className={statusBadgeClass(client.status)} data-testid={`client-status-${client.id}`}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
              </td>
              <td className="max-lg:hidden">
                {client.tags.length > 0 ? (
                  <span className="clients-tags">
                    {client.tags.map((tag) => (
                      <span key={tag} className="badge badge--info clients-tag-badge">
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : null}
              </td>
              <td className="max-md:hidden">
                {client.primaryContact
                  ? `${client.primaryContact.name} (${client.primaryContact.role || "N/A"})`
                  : "—"}
              </td>
              <td className="max-md:hidden">
                {client.openDeals.count > 0
                  ? `${client.openDeals.count} (Value: ${formatDealValue(client.openDeals.totalValue)})`
                  : "0"}
              </td>
              <td className="max-lg:hidden">
                {client.nextTask
                  ? `${client.nextTask.title} - ${formatTaskDate(client.nextTask.dueDate)}`
                  : "No task scheduled"}
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <ActionsMenu client={client} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
