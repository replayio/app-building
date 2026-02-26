import { useState, useRef, useEffect } from "react";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onChange: (dateFrom: string, dateTo: string) => void;
  label?: string;
  className?: string;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const dateOnly = dateStr.split("T")[0];
  const d = new Date(dateOnly + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function DateRangeFilter({ dateFrom, dateTo, onChange, label = "Filter by Date:", className = "filter-bar" }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState(dateFrom);
  const [tempTo, setTempTo] = useState(dateTo);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleApply = () => {
    onChange(tempFrom, tempTo);
    setIsOpen(false);
  };

  return (
    <div data-testid="date-range-filter" className={className} ref={popoverRef} style={{ position: "relative" }}>
      <span data-testid="date-range-filter-label" className="filter-label">{label}</span>
      <button
        data-testid="date-range-picker"
        className="custom-dropdown-trigger"
        onClick={() => {
          setTempFrom(dateFrom);
          setTempTo(dateTo);
          setIsOpen(!isOpen);
        }}
        type="button"
      >
        <svg
          data-testid="date-range-calendar-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 16, height: 16 }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{dateFrom || dateTo ? `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}` : "Select date range"}</span>
      </button>
      {isOpen && (
        <div
          data-testid="date-range-calendar-popover"
          className="custom-dropdown-menu"
          style={{ padding: 16, minWidth: 280 }}
        >
          <div className="form-group">
            <label className="form-label" htmlFor="date-range-start">Start Date</label>
            <input
              data-testid="date-range-start"
              id="date-range-start"
              type="date"
              className="form-input"
              value={tempFrom}
              onChange={(e) => setTempFrom(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="date-range-end">End Date</label>
            <input
              data-testid="date-range-end"
              id="date-range-end"
              type="date"
              className="form-input"
              value={tempTo}
              onChange={(e) => setTempTo(e.target.value)}
            />
          </div>
          <button
            data-testid="date-range-apply"
            className="btn-primary"
            onClick={handleApply}
            type="button"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
