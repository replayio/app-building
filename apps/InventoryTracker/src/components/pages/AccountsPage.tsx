import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Pencil, Archive, Plus } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchAccounts, createAccount, updateAccount, archiveAccount } from '../../store/accountsSlice';
import type { Account } from '../../types';
import Breadcrumb from '../shared/Breadcrumb';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';

/* ---------- Account Form Modal ---------- */

function AccountFormModal({
  isOpen,
  onClose,
  onSave,
  accountType,
  editingAccount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => void;
  accountType: string;
  editingAccount: Account | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setDescription(editingAccount.description);
    } else {
      setName('');
      setDescription('');
    }
    setNameError('');
  }, [editingAccount, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Account Name is required');
      return;
    }
    onSave({ name: name.trim(), description: description.trim() });
  };

  const title = editingAccount ? `Edit ${accountType} Account` : `Create ${accountType} Account`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} data-testid="modal-cancel-btn">
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} data-testid="modal-save-btn">
            Save
          </button>
        </>
      }
    >
      <div data-testid="edit-modal">
        <div className="form-group">
          <label className="form-label">Account Type</label>
          <input
            className="form-input"
            value={accountType}
            disabled
            data-testid="account-type-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Account Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="Enter account name"
            data-testid="account-name-input"
          />
          {nameError && <div className="form-error" data-testid="name-error">{nameError}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            data-testid="account-description-input"
          />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Account Row Actions ---------- */

function AccountRowActions({
  account,
  onView,
  onEdit,
  onArchive,
}: {
  account: Account;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="table-actions">
      <button
        className="btn-icon"
        onClick={(e) => { e.stopPropagation(); onView(); }}
        title="View"
        data-testid={`view-account-${account.id}`}
      >
        <Eye />
      </button>
      <button
        className="btn-icon"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        title="Edit"
        data-testid={`edit-account-${account.id}`}
      >
        <Pencil />
      </button>
      <button
        className="btn-icon"
        onClick={(e) => { e.stopPropagation(); onArchive(); }}
        title="Archive"
        data-testid={`archive-account-${account.id}`}
      >
        <Archive />
      </button>
    </div>
  );
}

/* ---------- Accounts List Section ---------- */

function AccountsList({
  title,
  accounts,
  accountType,
  onCreateClick,
  onRowClick,
  onEdit,
  onArchive,
  testIdPrefix,
}: {
  title: string;
  accounts: Account[];
  accountType: string;
  onCreateClick: () => void;
  onRowClick: (id: string) => void;
  onEdit: (account: Account) => void;
  onArchive: (account: Account) => void;
  testIdPrefix: string;
}) {
  const typeLabel = accountType.charAt(0).toUpperCase() + accountType.slice(1);

  return (
    <div className="section" data-testid={`${testIdPrefix}-accounts-section`}>
      <div className="section-header">
        <h2 className="section-title" data-testid={`${testIdPrefix}-accounts-heading`}>
          {title}
        </h2>
        <button
          className="btn btn-primary"
          onClick={onCreateClick}
          data-testid={`create-${testIdPrefix}-account-btn`}
        >
          <Plus />
          <span>Create {typeLabel} Account</span>
        </button>
      </div>
      <table className="data-table" data-testid={`${testIdPrefix}-accounts-table`}>
        <thead>
          <tr>
            <th>Account Name</th>
            <th>Account Type</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={4} className="table-empty" data-testid={`${testIdPrefix}-accounts-empty`}>
                No {testIdPrefix} accounts found
              </td>
            </tr>
          ) : (
            accounts.map((account) => (
              <tr
                key={account.id}
                className="clickable-row"
                onClick={() => onRowClick(account.id)}
                data-testid={`account-row-${account.id}`}
              >
                <td data-testid={`account-name-${account.id}`}>{account.name}</td>
                <td data-testid={`account-type-${account.id}`}>
                  {typeLabel}
                  {account.isDefault ? ' (Default)' : ''}
                </td>
                <td data-testid={`account-desc-${account.id}`}>{account.description}</td>
                <td>
                  <AccountRowActions
                    account={account}
                    onView={() => onRowClick(account.id)}
                    onEdit={() => onEdit(account)}
                    onArchive={() => onArchive(account)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function AccountsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { accounts, loading } = useSelector((state: RootState) => state.accounts);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'stock' | 'input' | 'output'>('stock');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Account | null>(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const stockAccounts = accounts.filter((a) => a.type === 'stock' && a.status === 'active');
  const inputAccounts = accounts.filter((a) => a.type === 'input' && a.status === 'active');
  const outputAccounts = accounts.filter((a) => a.type === 'output' && a.status === 'active');

  const openCreateModal = (type: 'stock' | 'input' | 'output') => {
    setModalType(type);
    setEditingAccount(null);
    setModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setModalType(account.type);
    setEditingAccount(account);
    setModalOpen(true);
  };

  const handleSave = async (data: { name: string; description: string }) => {
    if (editingAccount) {
      await dispatch(updateAccount({ accountId: editingAccount.id, data }));
    } else {
      await dispatch(createAccount({ name: data.name, type: modalType, description: data.description }));
    }
    setModalOpen(false);
    setEditingAccount(null);
  };

  const handleArchiveConfirm = async () => {
    if (archiveTarget) {
      await dispatch(archiveAccount(archiveTarget.id));
      setArchiveTarget(null);
    }
  };

  return (
    <div data-testid="accounts-page">
      <div className="page-header">
        <h1 className="page-heading" data-testid="page-heading">Accounts</h1>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', testId: 'breadcrumb-home' },
            { label: 'Accounts', testId: 'breadcrumb-accounts' },
          ]}
        />
      </div>

      {loading ? (
        <div className="table-empty">Loading...</div>
      ) : (
        <>
          <AccountsList
            title="Stock Accounts"
            accounts={stockAccounts}
            accountType="stock"
            onCreateClick={() => openCreateModal('stock')}
            onRowClick={(id) => navigate(`/accounts/${id}`)}
            onEdit={openEditModal}
            onArchive={setArchiveTarget}
            testIdPrefix="stock"
          />

          <AccountsList
            title="Input Accounts"
            accounts={inputAccounts}
            accountType="input"
            onCreateClick={() => openCreateModal('input')}
            onRowClick={(id) => navigate(`/accounts/${id}`)}
            onEdit={openEditModal}
            onArchive={setArchiveTarget}
            testIdPrefix="input"
          />

          <AccountsList
            title="Output Accounts"
            accounts={outputAccounts}
            accountType="output"
            onCreateClick={() => openCreateModal('output')}
            onRowClick={(id) => navigate(`/accounts/${id}`)}
            onEdit={openEditModal}
            onArchive={setArchiveTarget}
            testIdPrefix="output"
          />
        </>
      )}

      <AccountFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSave}
        accountType={modalType.charAt(0).toUpperCase() + modalType.slice(1)}
        editingAccount={editingAccount}
      />

      <ConfirmDialog
        isOpen={!!archiveTarget}
        title="Archive Account"
        message={
          archiveTarget
            ? `Are you sure you want to archive '${archiveTarget.name}'? This account will no longer appear in active lists.`
            : ''
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveTarget(null)}
        variant="danger"
      />
    </div>
  );
}
