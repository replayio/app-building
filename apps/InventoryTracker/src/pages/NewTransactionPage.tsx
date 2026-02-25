import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchAccounts } from "../slices/accountsSlice";
import { fetchMaterials } from "../slices/materialsSlice";
import { createTransaction } from "../slices/transactionsSlice";
import { BasicInfoForm, type BasicInfoFormData } from "../components/BasicInfoForm";
import {
  QuantityTransfersSection,
  type TransferRow,
} from "../components/QuantityTransfersSection";
import {
  BatchAllocationSection,
  type BatchRow,
} from "../components/BatchAllocationSection";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function NewTransactionPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const accounts = useAppSelector((s) => s.accounts.items);
  const materials = useAppSelector((s) => s.materials.items);

  const [basicInfo, setBasicInfo] = useState<BasicInfoFormData>({
    date: todayISO(),
    referenceId: "",
    description: "",
    transactionType: "",
  });

  const [transfers, setTransfers] = useState<TransferRow[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchMaterials());
  }, [dispatch]);

  // Handle pre-filled data from navigation params
  useEffect(() => {
    const accountId = searchParams.get("account_id");
    const materialId = searchParams.get("material_id");
    const batchId = searchParams.get("batch_id");

    if (accountId && accounts.length > 0) {
      const account = accounts.find((a: { id: string; name: string }) => a.id === accountId);
      if (account) {
        setTransfers((prev) => {
          if (prev.length > 0) return prev;
          return [
            {
              id: `qt-prefill-${Date.now()}`,
              sourceAccountId: accountId,
              sourceAccountName: `${account.name} (${account.id.slice(0, 4)})`,
              destinationAccountId: "",
              destinationAccountName: "",
              amount: 0,
              unit: "unit",
              sourceBatchId: batchId || "",
            },
          ];
        });
      }
    }

    if (materialId && materials.length > 0) {
      const material = materials.find((m: { id: string; name: string; unit_of_measure: string }) => m.id === materialId);
      if (material) {
        setBatches((prev) => {
          if (prev.length > 0) return prev;
          return [
            {
              id: `ba-prefill-${Date.now()}`,
              materialId,
              materialName: material.name,
              amount: 0,
              unit: material.unit_of_measure,
            },
          ];
        });
      }
    }
  }, [searchParams, accounts, materials]);

  const hasUnsavedData = useCallback(() => {
    return (
      basicInfo.referenceId !== "" ||
      basicInfo.description !== "" ||
      basicInfo.transactionType !== "" ||
      transfers.length > 0 ||
      batches.length > 0
    );
  }, [basicInfo, transfers, batches]);

  const handleCancel = () => {
    if (hasUnsavedData()) {
      setShowCancelDialog(true);
    } else {
      navigate("/transactions");
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate("/transactions");
  };

  const handleStay = () => {
    setShowCancelDialog(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!basicInfo.date) {
      newErrors.date = "Date is required";
    }
    if (!basicInfo.transactionType) {
      newErrors.transactionType = "Transaction Type is required";
    }
    if (transfers.length === 0) {
      newErrors.transfers = "At least one quantity transfer is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      const result = await dispatch(
        createTransaction({
          date: basicInfo.date,
          reference_id: basicInfo.referenceId,
          description: basicInfo.description,
          transaction_type: basicInfo.transactionType,
          transfers: transfers.map((t) => ({
            source_account_id: t.sourceAccountId,
            destination_account_id: t.destinationAccountId,
            material_id: "",
            amount: t.amount,
            unit: t.unit,
            source_batch_id: t.sourceBatchId || undefined,
          })),
          batches_created: batches.map((b) => ({
            material_id: b.materialId,
            quantity: b.amount,
            unit: b.unit,
          })),
        })
      ).unwrap();

      navigate(`/transactions/${result.id}`);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="new-transaction-page" className="page-content p-6 max-sm:p-3">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title" data-testid="new-transaction-title">
          New Transaction
        </h1>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-secondary"
            data-testid="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            data-testid="post-button"
            disabled={submitting}
            onClick={handlePost}
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Form sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <BasicInfoForm
          data={basicInfo}
          onChange={setBasicInfo}
          errors={errors}
        />
        <QuantityTransfersSection
          transfers={transfers}
          onTransfersChange={setTransfers}
          accounts={accounts}
          errors={errors.transfers}
        />
        <BatchAllocationSection
          batches={batches}
          onBatchesChange={setBatches}
          materials={materials}
        />
      </div>

      <ConfirmDialog
        open={showCancelDialog}
        title="Cancel Transaction"
        message="Are you sure you want to cancel? Unsaved changes will be lost."
        confirmLabel="Confirm"
        cancelLabel="Stay"
        onConfirm={handleConfirmCancel}
        onCancel={handleStay}
      />
    </div>
  );
}
