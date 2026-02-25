import { useState, useCallback } from "react";
import type { ProductionRun, RunStatus } from "../types";
import type { CalendarView } from "./CalendarHeader";

interface CalendarGridProps {
  currentDate: Date;
  view: CalendarView;
  runs: ProductionRun[];
  statusFilter: string;
  onEventClick: (run: ProductionRun) => void;
  onReschedule: (runId: string, daysDelta: number) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getEventClass(status: RunStatus): string {
  switch (status) {
    case "On Track":
      return "calendar-event-card calendar-event-card--on-track";
    case "Material Shortage":
      return "calendar-event-card calendar-event-card--material-shortage";
    case "Scheduled":
      return "calendar-event-card calendar-event-card--scheduled";
    case "In Progress":
      return "calendar-event-card calendar-event-card--in-progress";
    case "Pending Approval":
      return "calendar-event-card calendar-event-card--pending-approval";
    case "Confirmed":
      return "calendar-event-card calendar-event-card--confirmed";
    case "Cancelled":
      return "calendar-event-card calendar-event-card--cancelled";
    case "Completed":
      return "calendar-event-card calendar-event-card--completed";
    default:
      return "calendar-event-card";
  }
}

function getStatusIcon(status: RunStatus): React.ReactNode {
  if (status === "On Track") {
    return (
      <svg className="calendar-event-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === "Material Shortage") {
    return (
      <svg className="calendar-event-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6z" />
        <rect x="11" y="10" width="2" height="4" />
        <rect x="11" y="16" width="2" height="2" />
      </svg>
    );
  }
  return null;
}

function formatEventLabel(run: ProductionRun): string {
  const product = run.product_name || "Unknown";
  const recipe = run.recipe_name || "No Recipe";
  return `${product} (${recipe}) | ${run.planned_quantity} ${run.unit} | Status: ${run.status}`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function getDaysBetween(start: Date, end: Date): number {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function getWeekDates(date: Date): Date[] {
  const dayOfWeek = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - dayOfWeek);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function getRunsForDay(runs: ProductionRun[], date: Date): ProductionRun[] {
  return runs.filter((run) => {
    const start = new Date(run.start_date);
    const end = new Date(run.end_date);
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return targetDay >= startDay && targetDay <= endDay;
  });
}

function getRunsForHour(runs: ProductionRun[], date: Date, hour: number): ProductionRun[] {
  return runs.filter((run) => {
    const start = new Date(run.start_date);
    const end = new Date(run.end_date);
    const slotStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
    const slotEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour + 1);
    return start < slotEnd && end > slotStart;
  });
}

interface RescheduleState {
  runId: string;
  daysDelta: number;
  x: number;
  y: number;
  targetDate: Date;
}

export function CalendarGrid({
  currentDate,
  view,
  runs,
  statusFilter,
  onEventClick,
  onReschedule,
}: CalendarGridProps) {
  const [, setDragRunId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [rescheduleConfirm, setRescheduleConfirm] = useState<RescheduleState | null>(null);

  const filteredRuns = statusFilter === "All"
    ? runs
    : runs.filter((r) => r.status === statusFilter);

  const today = new Date();

  const handleDragStart = useCallback((e: React.DragEvent, runId: string) => {
    setDragRunId(runId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", runId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(dateKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetDate: Date) => {
      e.preventDefault();
      setDragOverDate(null);
      const runId = e.dataTransfer.getData("text/plain");
      if (!runId) return;

      const run = runs.find((r) => r.id === runId);
      if (!run) return;

      const startDate = new Date(run.start_date);
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const daysDelta = getDaysBetween(startDay, target);

      if (daysDelta === 0) {
        setDragRunId(null);
        return;
      }

      setRescheduleConfirm({
        runId,
        daysDelta,
        x: e.clientX,
        y: e.clientY,
        targetDate,
      });
      setDragRunId(null);
    },
    [runs]
  );

  const confirmReschedule = useCallback(() => {
    if (!rescheduleConfirm) return;
    onReschedule(rescheduleConfirm.runId, rescheduleConfirm.daysDelta);
    setRescheduleConfirm(null);
  }, [rescheduleConfirm, onReschedule]);

  const cancelReschedule = useCallback(() => {
    setRescheduleConfirm(null);
  }, []);

  const formatRescheduleDate = (date: Date): string => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  if (view === "Monthly") {
    const cells = getMonthGrid(currentDate);
    const month = currentDate.getMonth();

    return (
      <div data-testid="calendar-grid">
        <div className="calendar-grid-monthly">
          <div className="calendar-grid-header">
            {DAY_NAMES.map((name) => (
              <div key={name} className="calendar-day-header" data-testid={`calendar-header-${name.toLowerCase()}`}>
                {name}
              </div>
            ))}
          </div>
          <div className="calendar-grid-body">
            {cells.map((cellDate, idx) => {
              const dateKey = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
              const isDimmed = cellDate.getMonth() !== month;
              const isToday = isSameDay(cellDate, today);
              const isDragOver = dragOverDate === dateKey;
              const dayRuns = getRunsForDay(filteredRuns, cellDate);

              return (
                <div
                  key={idx}
                  className={`calendar-day-cell${isDimmed ? " calendar-day-cell--dimmed" : ""}${isToday ? " calendar-day-cell--today" : ""}${isDragOver ? " calendar-day-cell--drag-over" : ""}`}
                  data-testid={`calendar-day-${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`}
                  onDragOver={(e) => handleDragOver(e, dateKey)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, cellDate)}
                >
                  <div className={`calendar-day-number${isToday ? " calendar-day-number--today" : ""}`}>
                    {cellDate.getDate()}
                  </div>
                  {dayRuns.map((run) => {
                    const startDate = new Date(run.start_date);
                    const endDate = new Date(run.end_date);
                    const spanDays = getDaysBetween(startDate, endDate) + 1;
                    const isStart = isSameDay(cellDate, startDate);
                    const isSpanning = spanDays > 1;

                    // For multi-day events, calculate span width within the current week row
                    let spanStyle: React.CSSProperties = {};
                    if (isSpanning && isStart) {
                      const dayOfWeek = cellDate.getDay();
                      const remainingInWeek = 7 - dayOfWeek;
                      const visibleSpan = Math.min(spanDays, remainingInWeek);
                      spanStyle = {
                        width: `calc(${visibleSpan * 100}% + ${(visibleSpan - 1) * 1}px)`,
                        position: "relative",
                        zIndex: 2,
                      };
                    }

                    // Only render event on start day (for multi-day) or every day for single-day
                    if (isSpanning && !isStart) {
                      // For multi-day, check if this is the start of a week row continuation
                      if (cellDate.getDay() === 0) {
                        const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                        const cellDay = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                        const remainingDays = getDaysBetween(cellDay, endDay) + 1;
                        const visibleSpan = Math.min(remainingDays, 7);
                        spanStyle = {
                          width: `calc(${visibleSpan * 100}% + ${(visibleSpan - 1) * 1}px)`,
                          position: "relative",
                          zIndex: 2,
                        };
                      } else {
                        return null;
                      }
                    }

                    return (
                      <div
                        key={run.id}
                        className={`${getEventClass(run.status)}${isSpanning ? " calendar-event-card--span" : ""}`}
                        style={spanStyle}
                        data-testid={`calendar-event-${run.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, run.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(run);
                        }}
                      >
                        {getStatusIcon(run.status)}
                        <span className="calendar-event-text">{formatEventLabel(run)}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {rescheduleConfirm && (
          <RescheduleTooltip
            targetDate={formatRescheduleDate(rescheduleConfirm.targetDate)}
            x={rescheduleConfirm.x}
            y={rescheduleConfirm.y}
            onConfirm={confirmReschedule}
            onCancel={cancelReschedule}
          />
        )}
      </div>
    );
  }

  if (view === "Weekly") {
    const weekDates = getWeekDates(currentDate);

    return (
      <div data-testid="calendar-grid">
        <div className="calendar-grid-weekly">
          <div className="calendar-weekly-header">
            <div className="calendar-time-label-header"></div>
            {weekDates.map((d, i) => {
              const isToday2 = isSameDay(d, today);
              return (
                <div
                  key={i}
                  className={`calendar-weekly-day-header${isToday2 ? " calendar-weekly-day-header--today" : ""}`}
                  data-testid={`calendar-weekly-header-${DAY_NAMES[i].toLowerCase()}`}
                >
                  {DAY_NAMES[i]} {d.getDate()}
                </div>
              );
            })}
          </div>
          <div className="calendar-weekly-body">
            {HOURS.map((hour) => (
              <div key={hour} className="calendar-time-row">
                <div className="calendar-time-label">{formatHour(hour)}</div>
                {weekDates.map((d, dayIdx) => {
                  const hourRuns = getRunsForHour(filteredRuns, d, hour);
                  return (
                    <div
                      key={dayIdx}
                      className="calendar-time-cell"
                      data-testid={`calendar-weekly-cell-${DAY_NAMES[dayIdx].toLowerCase()}-${hour}`}
                    >
                      {hourRuns.map((run) => {
                        // Only render at start hour to avoid duplicates
                        const startH = new Date(run.start_date).getHours();
                        const startDay = new Date(run.start_date);
                        if (isSameDay(d, startDay) && startH !== hour) return null;
                        if (!isSameDay(d, startDay) && hour !== 0) return null;

                        return (
                          <div
                            key={run.id}
                            className={getEventClass(run.status)}
                            data-testid={`calendar-event-${run.id}`}
                            onClick={() => onEventClick(run)}
                          >
                            {getStatusIcon(run.status)}
                            <span className="calendar-event-text">{formatEventLabel(run)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {rescheduleConfirm && (
          <RescheduleTooltip
            targetDate={formatRescheduleDate(rescheduleConfirm.targetDate)}
            x={rescheduleConfirm.x}
            y={rescheduleConfirm.y}
            onConfirm={confirmReschedule}
            onCancel={cancelReschedule}
          />
        )}
      </div>
    );
  }

  // Daily view
  return (
    <div data-testid="calendar-grid">
      <div className="calendar-grid-daily">
        <div className="calendar-daily-header">
          <div className="calendar-time-label-header"></div>
          <div className="calendar-daily-day-header" data-testid="calendar-daily-header">
            {DAY_NAMES[currentDate.getDay()]} {currentDate.getDate()}
          </div>
        </div>
        <div className="calendar-daily-body">
          {HOURS.map((hour) => {
            const hourRuns = getRunsForHour(filteredRuns, currentDate, hour);
            return (
              <div key={hour} className="calendar-daily-time-row">
                <div className="calendar-time-label">{formatHour(hour)}</div>
                <div
                  className="calendar-daily-time-cell"
                  data-testid={`calendar-daily-cell-${hour}`}
                >
                  {hourRuns.map((run) => {
                    const startH = new Date(run.start_date).getHours();
                    const startDay = new Date(run.start_date);
                    if (isSameDay(currentDate, startDay) && startH !== hour) return null;
                    if (!isSameDay(currentDate, startDay) && hour !== 0) return null;

                    return (
                      <div
                        key={run.id}
                        className={getEventClass(run.status)}
                        data-testid={`calendar-event-${run.id}`}
                        onClick={() => onEventClick(run)}
                      >
                        {getStatusIcon(run.status)}
                        <span className="calendar-event-text">{formatEventLabel(run)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {rescheduleConfirm && (
        <RescheduleTooltip
          targetDate={formatRescheduleDate(rescheduleConfirm.targetDate)}
          x={rescheduleConfirm.x}
          y={rescheduleConfirm.y}
          onConfirm={confirmReschedule}
          onCancel={cancelReschedule}
        />
      )}
    </div>
  );
}

interface RescheduleTooltipProps {
  targetDate: string;
  x: number;
  y: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function RescheduleTooltip({ targetDate, x, y, onConfirm, onCancel }: RescheduleTooltipProps) {
  return (
    <div
      className="reschedule-tooltip"
      data-testid="reschedule-tooltip"
      style={{ left: x, top: y }}
    >
      <div className="reschedule-tooltip-text" data-testid="reschedule-tooltip-text">
        Reschedule to {targetDate}?
      </div>
      <div className="reschedule-tooltip-actions">
        <button
          className="btn-secondary"
          data-testid="reschedule-cancel-btn"
          onClick={onCancel}
          style={{ height: 28, fontSize: 12, padding: "0 10px" }}
        >
          Cancel
        </button>
        <button
          className="btn-primary"
          data-testid="reschedule-confirm-btn"
          onClick={onConfirm}
          style={{ height: 28, fontSize: 12, padding: "0 10px" }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
