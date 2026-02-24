import React from "react";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps): React.ReactElement {
  return (
    <div className="breadcrumb" data-testid="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="breadcrumb-separator">&gt;</span>}
            {isLast ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick?.();
                }}
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
