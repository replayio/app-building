import { useState } from "react";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import { useAppDispatch } from "../hooks";
import { updateRun } from "../slices/runsSlice";
import type { RunDetail, RunStatus } from "../types";

interface RunActionsProps {
  run: RunDetail;
}

export function RunActions({ run }: RunActionsProps) {
  const dispatch = useAppDispatch();
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isCancelled = run.status === "Cancelled";
  const isConfirmed = run.status === "Confirmed";

  const showAdjust = !isCancelled && !isConfirmed;
  const showConfirm = !isCancelled && !isConfirmed;
  const showCancel = !isCancelled;

  const handleConfirmRun = async () => {
    await dispatch(updateRun({ id: run.id, status: "Confirmed" as RunStatus }));
  };

  const handleCancelRun = async () => {
    await dispatch(updateRun({ id: run.id, status: "Cancelled" as RunStatus }));
    setShowCancelConfirm(false);
  };

  if (!showAdjust && !showConfirm && !showCancel) {
    return null;
  }

  return (
    <div data-testid="run-actions" className="run-actions-container">
      {showAdjust && (
        <button
          data-testid="adjust-quantities-btn"
          className="btn-primary"
          onClick={() => setShowQuantityModal(true)}
        >
          Adjust Quantities
        </button>
      )}
      {showConfirm && (
        <button
          data-testid="confirm-run-btn"
          className="btn-primary"
          onClick={handleConfirmRun}
        >
          Confirm Run
        </button>
      )}
      {showCancel && (
        <button
          data-testid="cancel-run-btn"
          className="btn-primary"
          onClick={() => setShowCancelConfirm(true)}
        >
          Cancel Run
        </button>
      )}

      {showQuantityModal && (
        <AdjustQuantityModal
          run={run}
          onClose={() => setShowQuantityModal(false)}
        />
      )}

      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel Production Run"
        message={`Are you sure you want to cancel run ${run.id}? This action cannot be undone.`}
        confirmLabel="Cancel Run"
        cancelLabel="Keep Run"
        onConfirm={handleCancelRun}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}

interface AdjustQuantityModalProps {
  run: RunDetail;
  onClose: () => void;
}

function AdjustQuantityModal({ run, onClose }: AdjustQuantityModalProps) {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(String(run.planned_quantity));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await dispatch(
      updateRun({
        id: run.id,
        planned_quantity: Number(quantity),
      })
    );
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      data-testid="adjust-quantity-modal"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Adjust Planned Quantity</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Planned Quantity ({run.unit})
            </label>
            <input
              data-testid="adjust-quantity-input"
              className="form-input"
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !quantity}
              data-testid="adjust-quantity-save"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
