import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import type { Equipment } from "../types";

interface EquipmentDetailHeaderProps {
  equipment: Equipment;
}

export function EquipmentDetailHeader({ equipment }: EquipmentDetailHeaderProps) {
  const navigate = useNavigate();

  const statusClass = equipment.status.toLowerCase();

  return (
    <div data-testid="equipment-detail-header">
      <Breadcrumb
        items={[
          {
            label: "Equipment",
            onClick: () => navigate("/equipment"),
          },
          {
            label: `Details: ${equipment.id}`,
          },
        ]}
      />
      <div
        data-testid="equipment-detail-title-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "20px 24px 0",
        }}
      >
        <h1 data-testid="equipment-detail-title" className="page-title">
          {equipment.name} {equipment.id}
        </h1>
        <span
          data-testid="equipment-status-badge"
          className={`badge badge--${statusClass}`}
        >
          {equipment.status}
        </span>
      </div>
    </div>
  );
}
