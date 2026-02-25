import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchRunById, clearCurrentRun } from "../slices/runsSlice";
import { RunHeader } from "../components/RunHeader";
import { RunActions } from "../components/RunActions";
import { RawMaterialsTable } from "../components/RawMaterialsTable";
import { ForecastTable } from "../components/ForecastTable";
import { RunEquipmentTable } from "../components/RunEquipmentTable";
import { ExternalAppLinks } from "../components/ExternalAppLinks";

export function RunDetailsPage() {
  const { runId } = useParams<{ runId: string }>();
  const dispatch = useAppDispatch();
  const { currentRun, loading, error } = useAppSelector((state) => state.runs);

  useEffect(() => {
    if (runId) {
      dispatch(fetchRunById(runId));
    }
    return () => {
      dispatch(clearCurrentRun());
    };
  }, [dispatch, runId]);

  if (loading) {
    return (
      <div data-testid="run-details-page" className="page-content">
        <div className="loading-state">Loading run details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="run-details-page" className="page-content">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  if (!currentRun) {
    return (
      <div data-testid="run-details-page" className="page-content">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div data-testid="run-details-page">
      <div className="run-details-top-section">
        <div className="run-details-top-main">
          <RunHeader run={currentRun} />
        </div>
        <div className="run-details-top-actions">
          <RunActions run={currentRun} />
        </div>
      </div>
      <div className="page-content">
        <RawMaterialsTable
          materials={currentRun.materials}
          plannedQuantity={currentRun.planned_quantity}
        />
        <ForecastTable forecasts={currentRun.forecasts} />
        <RunEquipmentTable equipment={currentRun.equipment} />
        <ExternalAppLinks runId={currentRun.id} />
      </div>
    </div>
  );
}
