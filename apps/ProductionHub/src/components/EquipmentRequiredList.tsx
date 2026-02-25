import { useNavigate } from "react-router-dom";
import type { RecipeEquipment } from "../types";

interface EquipmentRequiredListProps {
  equipment: RecipeEquipment[];
}

export function EquipmentRequiredList({ equipment }: EquipmentRequiredListProps) {
  const navigate = useNavigate();

  return (
    <div className="section-card" data-testid="equipment-required-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Equipment Required</h2>
      </div>
      <div className="section-card-body">
        {equipment.length === 0 ? (
          <div className="empty-state" data-testid="equipment-required-empty">
            <p className="empty-state-message">No equipment required.</p>
          </div>
        ) : (
          <ul
            data-testid="equipment-required-list"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {equipment.map((item) => (
              <li
                key={item.id}
                data-testid="equipment-required-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--bg-border-color-light)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ flexShrink: 0, color: "var(--accent-primary)" }}
                >
                  <path
                    d="M6.5 3.5L4 1M9.5 3.5L12 1M3 6h10M4 6l.7 7.4a1 1 0 001 .9h4.6a1 1 0 001-.9L12 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <a
                  href="#"
                  className="link"
                  data-testid="equipment-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/equipment/${item.equipment_id}`);
                  }}
                >
                  {item.equipment_name || "Unknown Equipment"}
                </a>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  ({item.equipment_id})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
