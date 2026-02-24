import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { deleteAccount } from "../slices/accountsSlice";
import { formatCurrency } from "@shared/utils/currency";
import type { Account } from "../types";

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleCardClick = () => {
    navigate(`/accounts/${account.id}`);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    await dispatch(deleteAccount(account.id));
  };

  return (
    <div
      className="account-card"
      data-testid={`account-card-${account.id}`}
      onClick={handleCardClick}
    >
      <div className="account-card-header">
        <div className="account-card-name" data-testid="account-card-name">
          {account.name}
          {account.institution ? ` (${account.institution})` : ""}
        </div>
        <div ref={menuRef} style={{ position: "relative", zIndex: 2 }}>
          <button
            className="account-card-menu-btn"
            data-testid={`account-card-menu-btn-${account.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
          >
            &#8942;
          </button>
          {menuOpen && (
            <div className="action-menu" data-testid={`account-card-menu-${account.id}`}>
              <button
                className="action-menu-item"
                data-testid="menu-edit-account"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  navigate(`/accounts/${account.id}`);
                }}
              >
                Edit Account
              </button>
              <button
                className="action-menu-item"
                data-testid="menu-view-transactions"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  navigate(`/accounts/${account.id}`);
                }}
              >
                View Transactions
              </button>
              <button
                className="action-menu-item action-menu-item--danger"
                data-testid="menu-delete-account"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="account-card-balance" data-testid="account-card-balance">
        Balance: <span className="account-card-balance-amount">{formatCurrency(account.balance)}</span>
      </div>

      <div className="account-card-ytd" data-testid="account-card-ytd">
        <span className="account-card-ytd-item">
          Debits (YTD): {formatCurrency(account.debits_ytd)}
        </span>
        <span className="account-card-ytd-item">
          Credits (YTD): {formatCurrency(account.credits_ytd)}
        </span>
      </div>

      {account.budget_amount > 0 && (
        <BudgetBar
          actual={account.budget_actual}
          budget={account.budget_amount}
          accountId={account.id}
        />
      )}

      {account.performance_pct !== null && (
        <PerformanceIndicator pct={account.performance_pct} />
      )}

      {account.savings_goal_name && account.savings_goal_target && account.savings_goal_target > 0 && (
        <SavingsGoal
          name={account.savings_goal_name}
          target={account.savings_goal_target}
          current={account.savings_goal_current ?? 0}
        />
      )}

      {account.credit_limit !== null && account.credit_limit > 0 && (
        <CreditLimitUsage balance={Math.abs(account.balance)} limit={account.credit_limit} />
      )}

      {account.monthly_payment !== null && (
        <div className="account-detail-info" data-testid="account-monthly-payment">
          Monthly Payment: {formatCurrency(account.monthly_payment)}
        </div>
      )}

      {account.interest_rate !== null && (
        <div className="account-detail-info" data-testid="account-interest-rate">
          Interest Rate: {account.interest_rate}%
        </div>
      )}
    </div>
  );
}

function BudgetBar({
  actual,
  budget,
  accountId,
}: {
  actual: number;
  budget: number;
  accountId: string;
}) {
  const navigate = useNavigate();
  const pct = Math.min((actual / budget) * 100, 100);
  const ratio = actual / budget;

  let fillClass = "budget-bar-fill";
  if (ratio >= 1) fillClass += " budget-bar-fill--over";
  else if (ratio >= 0.8) fillClass += " budget-bar-fill--warning";

  return (
    <div className="budget-bar-section" data-testid="budget-bar-section">
      <div className="budget-bar-label">
        <span>Budget vs Actual</span>
        <span>
          {formatCurrency(actual)} of {formatCurrency(budget)} Budgeted
        </span>
      </div>
      <div className="budget-bar-track">
        <div className={fillClass} style={{ width: `${pct}%` }} data-testid="budget-bar-fill" />
      </div>
      <a
        className="account-card-link"
        data-testid="view-budget-details-link"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/accounts/${accountId}`);
        }}
      >
        View Budget Details
      </a>
    </div>
  );
}

function PerformanceIndicator({ pct }: { pct: number }) {
  const isPositive = pct >= 0;

  return (
    <div
      className={`performance-indicator ${isPositive ? "performance-indicator--positive" : "performance-indicator--negative"}`}
      data-testid="performance-indicator"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        {isPositive ? (
          <path d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M7 3V11M7 11L3.5 7.5M7 11L10.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      Performance: {isPositive ? "+" : ""}{pct}%
    </div>
  );
}

function SavingsGoal({
  name,
  target,
  current,
}: {
  name: string;
  target: number;
  current: number;
}) {
  const pct = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="savings-goal" data-testid="savings-goal">
      <div className="savings-goal-header">
        <span>{name}</span>
        <span>{pct}%</span>
      </div>
      <div className="budget-bar-track">
        <div
          className="budget-bar-fill"
          style={{ width: `${pct}%` }}
          data-testid="savings-goal-fill"
        />
      </div>
    </div>
  );
}

function CreditLimitUsage({ balance, limit }: { balance: number; limit: number }) {
  const pct = Math.round((balance / limit) * 100);

  return (
    <div className="credit-limit-usage" data-testid="credit-limit-usage">
      Credit Limit Usage: {pct}%
    </div>
  );
}
