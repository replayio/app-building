import React, { useState } from "react";
import "./CommentsSection.css";

export interface Comment {
  id: string;
  authorName: string;
  authorRole: string;
  date: string;
  text: string;
}

interface CommentsSectionProps {
  title: string;
  comments: Comment[];
  onPostComment: (text: string) => void;
  placeholder?: string;
  postButtonLabel?: string;
}

export function CommentsSection({
  title,
  comments,
  onPostComment,
  placeholder = "Add a note...",
  postButtonLabel = "Post Note",
}: CommentsSectionProps): React.ReactElement {
  const [text, setText] = useState("");

  const handlePost = () => {
    if (!text.trim()) return;
    onPostComment(text.trim());
    setText("");
  };

  return (
    <div className="comments-section" data-testid="comments-section">
      <h3 className="comments-section-title" data-testid="comments-section-title">
        {title}
      </h3>
      <div className="comments-input-row" data-testid="comments-input-row">
        <input
          type="text"
          className="form-input comments-input"
          data-testid="comments-input"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) handlePost();
          }}
        />
        <button
          className="btn btn--primary comments-post-btn"
          data-testid="comments-post-btn"
          disabled={!text.trim()}
          onClick={handlePost}
        >
          {postButtonLabel}
        </button>
      </div>
      <div className="comments-list" data-testid="comments-list">
        {comments.map((comment) => (
          <div
            className="comment-item"
            data-testid="comment-item"
            key={comment.id}
          >
            <div className="comment-meta">
              <span className="comment-author" data-testid="comment-author">
                {comment.authorName}
              </span>
              <span className="comment-role" data-testid="comment-role">
                ({comment.authorRole})
              </span>
              <span className="comment-date" data-testid="comment-date">
                {comment.date}
              </span>
            </div>
            <p className="comment-text" data-testid="comment-text">
              {comment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
