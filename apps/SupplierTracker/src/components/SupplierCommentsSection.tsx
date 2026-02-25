import { useState } from "react";
import type { SupplierComment } from "../slices/suppliersSlice";
import "./SupplierCommentsSection.css";

interface SupplierCommentsSectionProps {
  comments: SupplierComment[];
  onAddComment: (text: string) => Promise<void>;
}

function formatCommentDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

export function SupplierCommentsSection({ comments, onAddComment }: SupplierCommentsSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="supplier-comments" data-testid="comments-section">
      <div
        className="supplier-comments-header"
        data-testid="comments-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <h3 className="supplier-comments-title" data-testid="comments-title">
          Comments ({comments.length})
        </h3>
        <button
          className="btn-ghost comments-toggle-btn"
          data-testid="comments-toggle"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(!collapsed);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={collapsed ? "chevron-collapsed" : "chevron-expanded"}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="supplier-comments-body" data-testid="comments-body">
          <div className="supplier-comments-input-row">
            <input
              type="text"
              className="form-input supplier-comment-input"
              data-testid="comment-input"
              placeholder="Add a note about this supplier..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newComment.trim() && !submitting) handleSubmit();
              }}
            />
            <button
              className="btn-primary"
              data-testid="comment-submit-btn"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>

          <div className="supplier-comments-list" data-testid="comments-list">
            {comments.map((comment) => (
              <div className="supplier-comment-item" key={comment.id} data-testid="comment-item">
                <span className="supplier-comment-text">
                  {formatCommentDate(comment.created_at)} - {comment.text} - {comment.author_name}
                </span>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="empty-state">
                <p className="empty-state-message">No comments yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
