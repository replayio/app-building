import React from "react";
import { SearchableSelect } from "@shared/components/SearchableSelect";

interface TransactionHeaderFieldsProps {
  date: string;
  description: string;
  currency: string;
  onDateChange: (date: string) => void;
  onDescriptionChange: (description: string) => void;
  onCurrencyChange: (currency: string) => void;
}

const CURRENCY_OPTIONS = [
  { id: "USD", label: "USD ($)" },
  { id: "EUR", label: "EUR (€)" },
  { id: "GBP", label: "GBP (£)" },
  { id: "JPY", label: "JPY (¥)" },
];

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

export function TransactionHeaderFields({
  date,
  description,
  currency,
  onDateChange,
  onDescriptionChange,
  onCurrencyChange,
}: TransactionHeaderFieldsProps): React.ReactElement {
  return (
    <div className="transaction-header-fields" data-testid="transaction-header-fields">
      <div className="form-group">
        <label className="form-label">Date</label>
        <div className="date-range-field">
          <span className="date-range-icon" data-testid="date-calendar-icon">
            <CalendarIcon />
          </span>
          <input
            type="date"
            className="form-input"
            data-testid="transaction-date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group transaction-header-fields-description">
        <label className="form-label">Description</label>
        <input
          type="text"
          className="form-input"
          data-testid="transaction-description"
          placeholder="Enter transaction description..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Currency</label>
        <SearchableSelect
          options={CURRENCY_OPTIONS}
          value={currency}
          onChange={onCurrencyChange}
          placeholder="Select currency..."
          testId="transaction-currency"
        />
      </div>
    </div>
  );
}
