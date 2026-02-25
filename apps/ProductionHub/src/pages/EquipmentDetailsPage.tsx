import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchEquipmentById,
  fetchEquipmentNotes,
  clearCurrentEquipment,
} from "../slices/equipmentSlice";
import { EquipmentDetailHeader } from "../components/EquipmentDetailHeader";
import { EquipmentInfo } from "../components/EquipmentInfo";
import { MaintenanceNotes } from "../components/MaintenanceNotes";

export function EquipmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentEquipment, notes, loading, error } = useAppSelector(
    (state) => state.equipment
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchEquipmentById(id));
      dispatch(fetchEquipmentNotes(id));
    }
    return () => {
      dispatch(clearCurrentEquipment());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div data-testid="equipment-details-page" className="page-content">
        <div className="loading-state">Loading equipment details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="equipment-details-page" className="page-content">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  if (!currentEquipment) {
    return (
      <div data-testid="equipment-details-page" className="page-content">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div data-testid="equipment-details-page">
      <EquipmentDetailHeader equipment={currentEquipment} />
      <div className="page-content">
        <EquipmentInfo equipment={currentEquipment} />
        <MaintenanceNotes equipmentId={currentEquipment.id} notes={notes} />
      </div>
    </div>
  );
}
