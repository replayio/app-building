import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" data-testid="confirm-dialog" onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <div className="modal-content" style={{ minWidth: 360, maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="confirm-dialog-text">{message}</div>
        <div className="modal-footer">
          <button
            className="btn btn-outline"
            onClick={onCancel}
            data-testid="cancel-btn"
          >
            {cancelLabel}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            data-testid="confirm-btn"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
