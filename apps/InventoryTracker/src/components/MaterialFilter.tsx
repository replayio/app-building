import { useState, useRef, useEffect } from "react";
import type { Material } from "../types";

interface MaterialFilterProps {
  materials: Material[];
  selectedMaterialIds: string[];
  onChange: (materialIds: string[]) => void;
}

export function MaterialFilter({ materials, selectedMaterialIds, onChange }: MaterialFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const toggleMaterial = (materialId: string) => {
    if (selectedMaterialIds.includes(materialId)) {
      onChange(selectedMaterialIds.filter((id) => id !== materialId));
    } else {
      onChange([...selectedMaterialIds, materialId]);
    }
  };

  const getDisplayText = () => {
    if (selectedMaterialIds.length === 0) return "All Materials";
    const selectedNames = materials
      .filter((m) => selectedMaterialIds.includes(m.id))
      .map((m) => m.name);
    if (selectedNames.length === 1) return selectedNames[0];
    return `${selectedNames.join(", ")} (${selectedMaterialIds.length} selected)`;
  };

  return (
    <div data-testid="material-filter" ref={containerRef} style={{ position: "relative" }}>
      <span className="filter-label">Material</span>
      <button
        data-testid="material-filter-trigger"
        className="custom-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{ width: "100%" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
          {getDisplayText()}
        </span>
        <svg
          className={`custom-dropdown-chevron${isOpen ? " custom-dropdown-chevron--open" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div
          data-testid="material-filter-dropdown"
          className="custom-dropdown-menu"
          style={{ minWidth: 260, maxHeight: 300, overflowY: "auto" }}
        >
          {materials.map((material) => {
            const isSelected = selectedMaterialIds.includes(material.id);
            return (
              <button
                key={material.id}
                data-testid={`material-filter-option-${material.id}`}
                className={`custom-dropdown-item${isSelected ? " custom-dropdown-item--selected" : ""}`}
                onClick={() => toggleMaterial(material.id)}
                type="button"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 14, height: 14, marginRight: 8, flexShrink: 0, opacity: isSelected ? 1 : 0 }}
                >
                  <polyline points="2 8 6 12 14 4" />
                </svg>
                <span>{material.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
