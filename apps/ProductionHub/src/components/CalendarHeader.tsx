import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { createRun, fetchRuns } from "../slices/runsSlice";
import { fetchRecipes } from "../slices/recipesSlice";
import type { Recipe } from "../types";

export type CalendarView = "Daily" | "Weekly" | "Monthly";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  statusFilter: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onStatusFilterChange: (status: string) => void;
}

const STATUS_OPTIONS = [
  "All",
  "On Track",
  "Material Shortage",
  "Scheduled",
  "In Progress",
  "Pending Approval",
];

const LEGEND_ITEMS: { label: string; color: string }[] = [
  { label: "On Track", color: "var(--status-on-track-text)" },
  { label: "Material Shortage", color: "var(--status-material-shortage-text)" },
  { label: "Scheduled", color: "var(--status-scheduled-text)" },
];

function formatPeriodLabel(date: Date, view: CalendarView): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const shortMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (view === "Monthly") {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  if (view === "Daily") {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  // Weekly: show week range
  const dayOfWeek = date.getDay();
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startLabel = `${shortMonths[startOfWeek.getMonth()]} ${startOfWeek.getDate()}`;
  const endLabel = `${shortMonths[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
  return `${startLabel} - ${endLabel}`;
}

export function CalendarHeader({
  currentDate,
  view,
  statusFilter,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onStatusFilterChange,
}: CalendarHeaderProps) {
  const dispatch = useAppDispatch();
  const [showNewRunModal, setShowNewRunModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div data-testid="calendar-header">
      <div className="calendar-header-top">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 className="page-title" data-testid="calendar-page-title">
            Production Calendar
          </h1>
          <span
            style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}
            data-testid="calendar-page-route"
          >
            /calendar
          </span>
        </div>
        <div className="calendar-header-actions">
          <div className="calendar-view-toggle" data-testid="calendar-view-toggle">
            {(["Daily", "Weekly", "Monthly"] as CalendarView[]).map((v) => (
              <button
                key={v}
                className={`calendar-view-btn${view === v ? " calendar-view-btn--active" : ""}`}
                data-testid={`calendar-view-${v.toLowerCase()}`}
                onClick={() => onViewChange(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            className="btn-primary"
            data-testid="new-production-run-btn"
            onClick={() => setShowNewRunModal(true)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="btn-text">New Production Run</span>
          </button>
        </div>
      </div>

      <div className="calendar-header-controls">
        <div className="calendar-nav-group">
          <button
            className="btn-secondary calendar-nav-btn"
            data-testid="calendar-prev-btn"
            onClick={onPrev}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="btn-text">Prev</span>
          </button>
          <button
            className="btn-secondary calendar-nav-btn"
            data-testid="calendar-today-btn"
            onClick={onToday}
          >
            Today
          </button>
          <button
            className="btn-secondary calendar-nav-btn"
            data-testid="calendar-next-btn"
            onClick={onNext}
          >
            <span className="btn-text">Next</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          <span className="calendar-period-label" data-testid="calendar-period-label">
            {formatPeriodLabel(currentDate, view)}
          </span>
        </div>

        <div className="calendar-filter-legend">
          <div className="calendar-filter-wrapper" style={{ position: "relative" }}>
            <button
              className="btn-secondary"
              data-testid="calendar-status-filter-btn"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filter by Status: {statusFilter}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {filterOpen && (
              <div className="calendar-filter-dropdown" data-testid="calendar-status-filter-dropdown">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`calendar-filter-option${statusFilter === opt ? " calendar-filter-option--active" : ""}`}
                    data-testid={`calendar-status-option-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => {
                      onStatusFilterChange(opt);
                      setFilterOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="calendar-legend" data-testid="calendar-legend">
            <span className="calendar-legend-label">Legend:</span>
            {LEGEND_ITEMS.map((item) => (
              <span
                key={item.label}
                className="calendar-legend-item"
                style={{ color: item.color }}
                data-testid={`calendar-legend-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span className="calendar-legend-dot" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showNewRunModal && (
        <NewRunModal
          onClose={() => setShowNewRunModal(false)}
          onSubmit={async (data) => {
            await dispatch(createRun(data));
            await dispatch(fetchRuns());
            setShowNewRunModal(false);
          }}
        />
      )}
    </div>
  );
}

interface NewRunModalProps {
  onClose: () => void;
  onSubmit: (data: {
    recipe_id: string;
    start_date: string;
    end_date: string;
    planned_quantity: number;
    unit: string;
    notes: string;
  }) => Promise<void>;
}

function NewRunModal({ onClose, onSubmit }: NewRunModalProps) {
  const dispatch = useAppDispatch();
  const recipes = useAppSelector((s) => s.recipes.items) as Recipe[];
  const [recipeId, setRecipeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("Units");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recipeSearchOpen, setRecipeSearchOpen] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState("");

  useEffect(() => {
    if (recipes.length === 0) {
      dispatch(fetchRecipes());
    }
  }, [dispatch, recipes.length]);

  const filteredRecipes = recipes.filter(
    (r: Recipe) =>
      r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      r.product.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  const selectedRecipe = recipes.find((r: Recipe) => r.id === recipeId);

  const handleSubmit = async () => {
    if (!startDate || !endDate) return;
    setSubmitting(true);
    await onSubmit({
      recipe_id: recipeId || "",
      start_date: startDate,
      end_date: endDate,
      planned_quantity: parseInt(quantity, 10) || 0,
      unit,
      notes: notes.trim(),
    });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" data-testid="new-run-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Production Run</h2>
          <button className="modal-close-btn" data-testid="new-run-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Recipe</label>
          <div style={{ position: "relative" }}>
            <input
              className="form-input"
              data-testid="new-run-recipe-input"
              type="text"
              value={recipeSearchOpen ? recipeSearch : (selectedRecipe ? `${selectedRecipe.name} (${selectedRecipe.product})` : "")}
              placeholder="Search recipes..."
              onFocus={() => {
                setRecipeSearchOpen(true);
                setRecipeSearch("");
              }}
              onChange={(e) => setRecipeSearch(e.target.value)}
            />
            {recipeSearchOpen && (
              <div className="calendar-filter-dropdown" style={{ maxHeight: 200, overflow: "auto", top: "100%", left: 0, right: 0 }}>
                {filteredRecipes.map((r: Recipe) => (
                  <button
                    key={r.id}
                    className="calendar-filter-option"
                    data-testid={`new-run-recipe-option-${r.id}`}
                    onClick={() => {
                      setRecipeId(r.id);
                      setRecipeSearchOpen(false);
                    }}
                  >
                    {r.name} ({r.product})
                  </button>
                ))}
                {filteredRecipes.length === 0 && (
                  <div style={{ padding: "8px 12px", fontSize: 13, color: "var(--text-muted)" }}>
                    No recipes found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date/Time</label>
            <input
              className="form-input"
              data-testid="new-run-start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date/Time</label>
            <input
              className="form-input"
              data-testid="new-run-end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Planned Quantity</label>
            <input
              className="form-input"
              data-testid="new-run-quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <input
              className="form-input"
              data-testid="new-run-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Units"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            data-testid="new-run-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
          />
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" data-testid="new-run-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            data-testid="new-run-submit-btn"
            disabled={!startDate || !endDate || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Creating..." : "Create Run"}
          </button>
        </div>
      </div>
    </div>
  );
}
