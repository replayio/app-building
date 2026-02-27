import type { Batch } from "../types";

interface BatchOverviewProps {
  batch: Batch;
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ThermometerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

interface PropertyRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  testId: string;
}

function PropertyRow({ icon, label, value, testId }: PropertyRowProps) {
  return (
    <div
      data-testid={testId}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      <span
        className="batch-property-label"
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-muted)",
          minWidth: 120,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

export function BatchOverview({ batch }: BatchOverviewProps) {
  const hasLocation = !!batch.location;
  const hasLotNumber = !!batch.lot_number;
  const hasExpiration = !!batch.expiration_date;
  const hasQualityGrade = !!batch.quality_grade;
  const hasStorageCondition = !!batch.storage_condition;

  return (
    <div data-testid="batch-overview">
      <h2
        data-testid="batch-overview-heading"
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        Batch Overview
      </h2>
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            <svg
              className="section-card-title-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Current Quantity &amp; Properties
          </h2>
        </div>
        <div className="section-card-body">
          <div
            data-testid="batch-quantity"
            style={{ marginBottom: 16 }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Quantity
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {Number(batch.quantity).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {batch.unit}
            </span>
          </div>

          <div data-testid="batch-unit" style={{ marginBottom: 16 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Unit
            </span>
            <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
              {batch.unit}
            </span>
          </div>

          {hasLocation && (
            <PropertyRow
              icon={<LocationIcon />}
              label="Location"
              value={batch.location}
              testId="batch-property-location"
            />
          )}

          {hasLotNumber && (
            <PropertyRow
              icon={<ClipboardIcon />}
              label="Lot Number"
              value={batch.lot_number}
              testId="batch-property-lot-number"
            />
          )}

          {hasExpiration && (
            <PropertyRow
              icon={<CalendarIcon />}
              label="Expiration Date"
              value={batch.expiration_date!}
              testId="batch-property-expiration"
            />
          )}

          {hasQualityGrade && (
            <PropertyRow
              icon={<ShieldIcon />}
              label="Quality Grade"
              value={batch.quality_grade}
              testId="batch-property-quality-grade"
            />
          )}

          {hasStorageCondition && (
            <PropertyRow
              icon={<ThermometerIcon />}
              label="Storage Condition"
              value={batch.storage_condition}
              testId="batch-property-storage-condition"
            />
          )}
        </div>
      </div>
    </div>
  );
}
