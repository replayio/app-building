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
        <input
          type="date"
          className="form-input"
          data-testid="transaction-date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
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
