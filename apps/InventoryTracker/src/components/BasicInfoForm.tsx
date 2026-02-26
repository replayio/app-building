import { useState, useRef, useEffect, useCallback } from "react";
import type { TransactionType } from "../types";

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: "transfer", label: "Transfer" },
  { value: "purchase", label: "Purchase" },
  { value: "consumption", label: "Consumption" },
  { value: "adjustment", label: "Adjustment" },
  { value: "production", label: "Production" },
];

export interface BasicInfoFormData {
  date: string;
  referenceId: string;
  description: string;
  transactionType: TransactionType | "";
}

interface BasicInfoFormProps {
  data: BasicInfoFormData;
  onChange: (data: BasicInfoFormData) => void;
  errors?: Record<string, string>;
}

export function BasicInfoForm({ data, onChange, errors }: BasicInfoFormProps) {
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
      setTypeOpen(false);
    }
  }, []);

  useEffect(() => {
    if (typeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [typeOpen, handleClickOutside]);

  const selectedType = TRANSACTION_TYPES.find(
    (t) => t.value === data.transactionType
  );

  return (
    <div data-testid="basic-info-form">
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        1. Basic Info
      </h2>
      <div className="section-card" style={{ marginBottom: 0 }}>
        <div className="section-card-body">
          <div
            data-testid="basic-info-fields"
            className="grid grid-cols-[1fr_1fr_2fr_1fr] max-md:grid-cols-2 max-sm:grid-cols-1 gap-4"
          >
        {/* Date field */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="txn-date">
            Date
          </label>
          <div style={{ position: "relative" }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              id="txn-date"
              data-testid="basic-info-date-input"
              type="date"
              className="form-input"
              style={{ paddingLeft: 32 }}
              value={data.date}
              onChange={(e) => onChange({ ...data, date: e.target.value })}
            />
          </div>
          {errors?.date && (
            <span
              data-testid="error-date"
              style={{ fontSize: 12, color: "var(--status-error)", marginTop: 4, display: "block" }}
            >
              {errors.date}
            </span>
          )}
        </div>

        {/* Reference ID field */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="txn-reference-id">
            Reference ID
          </label>
          <input
            id="txn-reference-id"
            data-testid="basic-info-reference-id-input"
            type="text"
            className="form-input"
            placeholder="TRX-20240523-001"
            value={data.referenceId}
            onChange={(e) =>
              onChange({ ...data, referenceId: e.target.value })
            }
          />
        </div>

        {/* Description field */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="txn-description">
            Description
          </label>
          <textarea
            id="txn-description"
            data-testid="basic-info-description-input"
            className="form-textarea"
            style={{ minHeight: 80, resize: "vertical" }}
            value={data.description}
            onChange={(e) =>
              onChange({ ...data, description: e.target.value })
            }
          />
        </div>

        {/* Transaction Type dropdown */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Transaction Type</label>
          <div
            ref={typeRef}
            className={`custom-dropdown${typeOpen ? " custom-dropdown--open" : ""}`}
            style={{ display: "block" }}
          >
            <button
              type="button"
              className="custom-dropdown-trigger"
              data-testid="basic-info-transaction-type-trigger"
              style={{ width: "100%", justifyContent: "space-between" }}
              onClick={() => setTypeOpen(!typeOpen)}
            >
              <span
                style={{
                  color: selectedType
                    ? "var(--text-secondary)"
                    : "var(--text-disabled)",
                }}
              >
                {selectedType ? selectedType.label : "Select type..."}
              </span>
              <svg
                className="custom-dropdown-chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {typeOpen && (
              <div
                className="custom-dropdown-menu"
                data-testid="basic-info-transaction-type-dropdown"
                style={{ width: "100%" }}
              >
                {TRANSACTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`custom-dropdown-item${
                      data.transactionType === t.value
                        ? " custom-dropdown-item--selected"
                        : ""
                    }`}
                    data-testid={`transaction-type-option-${t.value}`}
                    onClick={() => {
                      onChange({ ...data, transactionType: t.value });
                      setTypeOpen(false);
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors?.transactionType && (
            <span
              data-testid="error-transaction-type"
              style={{ fontSize: 12, color: "var(--status-error)", marginTop: 4, display: "block" }}
            >
              {errors.transactionType}
            </span>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
