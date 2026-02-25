import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchEquipment } from "../slices/equipmentSlice";
import { EquipmentHeader } from "../components/EquipmentHeader";
import { EquipmentTable } from "../components/EquipmentTable";

export function EquipmentPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.equipment);

  useEffect(() => {
    dispatch(fetchEquipment());
  }, [dispatch]);

  return (
    <div className="page-content" data-testid="equipment-page">
      <EquipmentHeader />
      {loading ? (
        <div className="loading-state">Loading equipment...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <EquipmentTable items={items} />
      )}
    </div>
  );
}
