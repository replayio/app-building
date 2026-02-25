interface ViewToggleProps {
  view: "table" | "pipeline";
  onViewChange: (view: "table" | "pipeline") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="view-tabs" data-testid="view-toggle">
      <button
        className={`view-tab ${view === "table" ? "view-tab--active" : ""}`}
        data-testid="view-toggle-table"
        onClick={() => onViewChange("table")}
        type="button"
      >
        Table View
      </button>
      <button
        className={`view-tab ${view === "pipeline" ? "view-tab--active" : ""}`}
        data-testid="view-toggle-pipeline"
        onClick={() => onViewChange("pipeline")}
        type="button"
      >
        Pipeline View
      </button>
    </div>
  );
}
