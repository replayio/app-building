import React, { useState } from "react";

interface TagsInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function TagsInput({
  tags,
  onAddTag,
  onRemoveTag,
}: TagsInputProps): React.ReactElement {
  const [tagInput, setTagInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        onAddTag(newTag);
      }
      setTagInput("");
    }
  };

  return (
    <div className="form-group" data-testid="tags-input-section">
      <label className="form-label">
        Tags / Categories{" "}
        <span className="form-label-optional">(optional)</span>
      </label>
      <div className="tags-container" data-testid="tags-container">
        {tags.map((tag) => (
          <span key={tag} className="tag" data-testid={`tag-${tag}`}>
            {tag}
            <button
              className="tag-remove"
              data-testid={`tag-remove-${tag}`}
              onClick={() => onRemoveTag(tag)}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          className="tags-input"
          data-testid="tags-input"
          placeholder="Type and press Enter..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
