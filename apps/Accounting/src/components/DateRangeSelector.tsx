import React from "react";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

function CalendarIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function getThisMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    start: formatDateISO(start),
    end: formatDateISO(end),
  };
}

function getLastQuarterRange(): { start: string; end: string } {
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
  const year = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const startMonth = prevQuarter * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return {
    start: formatDateISO(start),
    end: formatDateISO(end),
  };
}

function getYTDRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    start: formatDateISO(start),
    end: formatDateISO(now),
  };
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeSelectorProps): React.ReactElement {
  const applyPreset = (getter: () => { start: string; end: string }) => {
    const range = getter();
    onStartDateChange(range.start);
    onEndDateChange(range.end);
  };

  return (
    <div data-testid="date-range-selector">
      <div className="form-label" style={{ marginBottom: "8px" }}>Date Range</div>
      <div className="date-range-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Start Date</label>
          <div className="date-range-field">
            <span className="date-range-icon">
              <CalendarIcon />
            </span>
            <input
              type="date"
              className="form-input"
              data-testid="report-date-start"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">End Date</label>
          <div className="date-range-field">
            <span className="date-range-icon">
              <CalendarIcon />
            </span>
            <input
              type="date"
              className="form-input"
              data-testid="report-date-end"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="date-range-presets">
        <button
          type="button"
          className="date-range-preset-btn"
          data-testid="preset-this-month"
          onClick={() => applyPreset(getThisMonthRange)}
        >
          This Month
        </button>
        <button
          type="button"
          className="date-range-preset-btn"
          data-testid="preset-last-quarter"
          onClick={() => applyPreset(getLastQuarterRange)}
        >
          Last Quarter
        </button>
        <button
          type="button"
          className="date-range-preset-btn"
          data-testid="preset-ytd"
          onClick={() => applyPreset(getYTDRange)}
        >
          YTD
        </button>
      </div>
    </div>
  );
}
