import React, { useState } from "react";
import "./CategorySection.css";

export interface CategorySectionProps<T> {
  /** Category name displayed in the header. */
  title: string;
  /** Items belonging to this category. */
  items: T[];
  /** Whether the section is expanded by default. */
  defaultExpanded?: boolean;
  /** Formatted total string displayed in the header (e.g., "$152,450.00"). */
  total?: string;
  /** Render function for each item in the category. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Optional key extractor for items. Defaults to index. */
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * A collapsible section that groups items under a category header.
 * Used by Accounting (accounts by type) and InventoryTracker (accounts by category).
 */
export function CategorySection<T>({
  title,
  items,
  defaultExpanded = true,
  total,
  renderItem,
  getItemKey,
}: CategorySectionProps<T>) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="category-section" data-testid={`category-section-${title.toLowerCase()}`}>
      <button
        className="category-section-header"
        data-testid={`category-header-${title.toLowerCase()}`}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className="category-section-chevron" data-testid={`category-chevron-${title.toLowerCase()}`} data-expanded={expanded}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="category-section-title" data-testid={`category-title-${title.toLowerCase()}`}>{title}</span>
        {total !== undefined && (
          <span className="category-section-total" data-testid={`category-total-${title.toLowerCase()}`}>{total}</span>
        )}
      </button>

      {expanded && (
        <div className="category-section-content" data-testid={`category-content-${title.toLowerCase()}`}>
          {items.map((item, index) => (
            <React.Fragment
              key={getItemKey ? getItemKey(item, index) : index}
            >
              {renderItem(item, index)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export interface CategoryGroupProps<T> {
  /** Ordered list of categories to display. */
  categories: Array<{
    title: string;
    items: T[];
    total?: string;
    defaultExpanded?: boolean;
  }>;
  /** Render function for each item. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Optional key extractor for items. */
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Renders multiple CategorySection components for a list of categories.
 * Provides the overall grouped layout for accounts or similar entities.
 */
export function CategoryGroup<T>({
  categories,
  renderItem,
  getItemKey,
}: CategoryGroupProps<T>) {
  return (
    <div className="category-group">
      {categories.map((cat) => (
        <CategorySection
          key={cat.title}
          title={cat.title}
          items={cat.items}
          total={cat.total}
          defaultExpanded={cat.defaultExpanded ?? true}
          renderItem={renderItem}
          getItemKey={getItemKey}
        />
      ))}
    </div>
  );
}
