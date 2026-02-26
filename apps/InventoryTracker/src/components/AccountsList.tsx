import { useNavigate } from "react-router-dom";
import type { Account, AccountCategory } from "../types";
import { AccountRowActions } from "./AccountRowActions";

interface AccountsListProps {
  title: string;
  accountType: AccountCategory;
  accounts: Account[];
  onCreateAccount: (accountType: AccountCategory) => void;
  onEditAccount: (account: Account) => void;
  onArchiveAccount: (account: Account) => void;
}

export function AccountsList({
  title,
  accountType,
  accounts,
  onCreateAccount,
  onEditAccount,
  onArchiveAccount,
}: AccountsListProps) {
  const navigate = useNavigate();
  const testIdPrefix = accountType;

  return (
    <div data-testid={`${testIdPrefix}-accounts-list`} className="account-type-section">
      <div className="account-type-header">
        <h2 className="account-type-title">{title}</h2>
        <button
          data-testid={`create-${testIdPrefix}-account-btn`}
          className="btn-primary"
          onClick={() => onCreateAccount(accountType)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 16, height: 16 }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="max-sm:hidden">Create {title.replace(" Accounts", "")} Account</span>
        </button>
      </div>
      <div className="section-card">
        <div className="section-card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th className="max-lg:hidden">Account Type</th>
                <th className="max-md:hidden">Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div
                      data-testid={`${testIdPrefix}-accounts-empty`}
                      className="empty-state"
                    >
                      <p className="empty-state-message">
                        No {accountType} accounts found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    data-testid={`account-row-${account.id}`}
                    className="clickable"
                    onClick={() => navigate(`/accounts/${account.id}`)}
                  >
                    <td>
                      <span data-testid={`account-name-${account.id}`}>
                        {account.name}
                      </span>
                    </td>
                    <td className="max-lg:hidden">
                      <span data-testid={`account-type-${account.id}`}>
                        {capitalize(account.account_type)}
                        {account.is_default && " (Default)"}
                      </span>
                    </td>
                    <td className="max-md:hidden">
                      <span data-testid={`account-description-${account.id}`}>
                        {account.description}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <AccountRowActions
                        account={account}
                        onView={() => navigate(`/accounts/${account.id}`)}
                        onEdit={() => onEditAccount(account)}
                        onArchive={() => onArchiveAccount(account)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
