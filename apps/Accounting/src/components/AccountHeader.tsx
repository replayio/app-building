import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { NewTransactionModal } from "./NewTransactionModal";
import type { Account } from "../types";

interface AccountHeaderProps {
  account: Account;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AccountHeader({
  account,
  searchQuery,
  onSearchChange,
}: AccountHeaderProps): React.ReactElement {
  const navigate = useNavigate();
  const [showNewTransaction, setShowNewTransaction] = useState(false);

  const categoryLabel =
    account.category.charAt(0).toUpperCase() + account.category.slice(1);

  return (
    <>
      <div className="account-detail-breadcrumb">
        <Breadcrumb
          items={[
            { label: "Page", onClick: () => navigate("/accounts") },
            { label: "AccountDetailPage" },
          ]}
        />
      </div>

      <div className="account-header" data-testid="account-header">
        <div className="account-header-info">
          <h1
            className="account-header-name"
            data-testid="account-header-name"
          >
            Account: {account.name}
          </h1>
          <span
            className="account-header-category"
            data-testid="account-header-category"
          >
            Category: {categoryLabel}
          </span>
        </div>

        <div className="account-header-actions">
          <div className="account-header-search">
            <svg
              className="account-header-search-icon"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M9.5 9.5L13 13"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              className="account-header-search-input"
              data-testid="account-search-input"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                className="account-header-search-clear"
                data-testid="account-search-clear"
                onClick={() => onSearchChange("")}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 3L9 9M9 3L3 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <button
            className="btn btn--primary"
            data-testid="account-new-transaction-btn"
            onClick={() => setShowNewTransaction(true)}
          >
            New Transaction
          </button>
        </div>
      </div>

      {showNewTransaction && (
        <NewTransactionModal onClose={() => setShowNewTransaction(false)} />
      )}
    </>
  );
}
