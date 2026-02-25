import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchRuns, updateRun } from "../slices/runsSlice";
import { CalendarHeader, type CalendarView } from "../components/CalendarHeader";
import { CalendarGrid } from "../components/CalendarGrid";
import { RunDetailsPopup } from "../components/RunDetailsPopup";
import type { ProductionRun } from "../types";

export function CalendarPage() {
  const dispatch = useAppDispatch();
  const { items: runs, loading, error } = useAppSelector((s) => s.runs);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("Monthly");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRun, setSelectedRun] = useState<ProductionRun | null>(null);

  useEffect(() => {
    dispatch(fetchRuns());
  }, [dispatch]);

  const handlePrev = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "Monthly") {
        next.setMonth(next.getMonth() - 1);
      } else if (view === "Weekly") {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "Monthly") {
        next.setMonth(next.getMonth() + 1);
      } else if (view === "Weekly") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
  }, [view]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleReschedule = useCallback(
    async (runId: string, daysDelta: number) => {
      const run = runs.find((r: ProductionRun) => r.id === runId);
      if (!run) return;

      const newStart = new Date(run.start_date);
      newStart.setDate(newStart.getDate() + daysDelta);
      const newEnd = new Date(run.end_date);
      newEnd.setDate(newEnd.getDate() + daysDelta);

      await dispatch(
        updateRun({
          id: runId,
          start_date: newStart.toISOString(),
          end_date: newEnd.toISOString(),
        })
      );
      dispatch(fetchRuns());
    },
    [dispatch, runs]
  );

  if (loading && runs.length === 0) {
    return (
      <div className="page-content" data-testid="calendar-page">
        <div className="loading-state">Loading calendar...</div>
      </div>
    );
  }

  if (error && runs.length === 0) {
    return (
      <div className="page-content" data-testid="calendar-page">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-content" data-testid="calendar-page">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        statusFilter={statusFilter}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setView}
        onStatusFilterChange={setStatusFilter}
      />
      <CalendarGrid
        currentDate={currentDate}
        view={view}
        runs={runs}
        statusFilter={statusFilter}
        onEventClick={setSelectedRun}
        onReschedule={handleReschedule}
      />
      {selectedRun && (
        <RunDetailsPopup
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
        />
      )}
    </div>
  );
}
