import { useState, useEffect } from "react";
import type { Equipment } from "../types";
import { useAppDispatch } from "../hooks";
import { updateEquipment } from "../slices/equipmentSlice";
import { formatDate } from "@shared/utils/date";

interface EquipmentInfoProps {
  equipment: Equipment;
}

export function EquipmentInfo({ equipment }: EquipmentInfoProps) {
  const dispatch = useAppDispatch();

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const [detailForm, setDetailForm] = useState({
    model: equipment.model,
    serial_number: equipment.serial_number,
    location: equipment.location,
    manufacturer: equipment.manufacturer,
    installation_date: equipment.installation_date ?? "",
  });

  const [descriptionDraft, setDescriptionDraft] = useState(equipment.description);

  // Sync local state when equipment prop changes (e.g., after save)
  useEffect(() => {
    setDetailForm({
      model: equipment.model,
      serial_number: equipment.serial_number,
      location: equipment.location,
      manufacturer: equipment.manufacturer,
      installation_date: equipment.installation_date ?? "",
    });
    setDescriptionDraft(equipment.description);
  }, [equipment]);

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          dispatch(
            updateEquipment({
              id: equipment.id,
              photo_url: reader.result as string,
            })
          );
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSaveDetails = () => {
    dispatch(
      updateEquipment({
        id: equipment.id,
        ...detailForm,
        installation_date: detailForm.installation_date || null,
      })
    );
    setIsEditingDetails(false);
  };

  const handleCancelDetails = () => {
    setDetailForm({
      model: equipment.model,
      serial_number: equipment.serial_number,
      location: equipment.location,
      manufacturer: equipment.manufacturer,
      installation_date: equipment.installation_date ?? "",
    });
    setIsEditingDetails(false);
  };

  const handleSaveDescription = () => {
    dispatch(
      updateEquipment({
        id: equipment.id,
        description: descriptionDraft,
      })
    );
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    setDescriptionDraft(equipment.description);
    setIsEditingDescription(false);
  };

  const detailFields = [
    { label: "Model:", value: equipment.model },
    { label: "Serial No.:", value: equipment.serial_number },
    { label: "Location:", value: equipment.location },
    { label: "Manufacturer:", value: equipment.manufacturer },
    {
      label: "Installation Date:",
      value: equipment.installation_date
        ? formatDate(equipment.installation_date)
        : "",
    },
  ];

  return (
    <div data-testid="equipment-info">
      <div className="equipment-detail-layout">
        {/* Photo section */}
        <div
          data-testid="equipment-photo-container"
          className="equipment-photo-container"
        >
          {equipment.photo_url ? (
            <>
              <img
                data-testid="equipment-photo"
                className="equipment-photo"
                src={equipment.photo_url}
                alt={equipment.name}
              />
              <div
                data-testid="equipment-photo-upload"
                className="equipment-photo-overlay"
                onClick={handlePhotoUpload}
              >
                Change Photo
              </div>
            </>
          ) : (
            <div
              data-testid="equipment-photo-placeholder"
              className="equipment-photo-placeholder"
              onClick={handlePhotoUpload}
            >
              <svg
                className="equipment-photo-placeholder-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="equipment-photo-placeholder-text">
                Click to upload photo
              </span>
            </div>
          )}
        </div>

        {/* Details panel + Description */}
        <div data-testid="equipment-details-panel" className="equipment-details-panel">
          {/* Details card */}
          <div className="section-card" style={{ marginBottom: 0 }}>
            <div className="section-card-header">
              <h2 className="section-card-title">Details</h2>
              {!isEditingDetails && (
                <button
                  data-testid="equipment-edit-details-btn"
                  className="btn-ghost"
                  onClick={() => setIsEditingDetails(true)}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="section-card-body">
              {isEditingDetails ? (
                <div data-testid="equipment-edit-form">
                  <div className="form-group">
                    <label className="form-label">Model</label>
                    <input
                      data-testid="equipment-edit-model"
                      className="form-input"
                      value={detailForm.model}
                      onChange={(e) =>
                        setDetailForm({ ...detailForm, model: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serial Number</label>
                    <input
                      data-testid="equipment-edit-serial"
                      className="form-input"
                      value={detailForm.serial_number}
                      onChange={(e) =>
                        setDetailForm({
                          ...detailForm,
                          serial_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      data-testid="equipment-edit-location"
                      className="form-input"
                      value={detailForm.location}
                      onChange={(e) =>
                        setDetailForm({
                          ...detailForm,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Manufacturer</label>
                    <input
                      data-testid="equipment-edit-manufacturer"
                      className="form-input"
                      value={detailForm.manufacturer}
                      onChange={(e) =>
                        setDetailForm({
                          ...detailForm,
                          manufacturer: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Installation Date</label>
                    <input
                      data-testid="equipment-edit-installation-date"
                      className="form-input"
                      type="date"
                      value={detailForm.installation_date}
                      onChange={(e) =>
                        setDetailForm({
                          ...detailForm,
                          installation_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      data-testid="equipment-edit-cancel-btn"
                      className="btn-secondary"
                      onClick={handleCancelDetails}
                    >
                      Cancel
                    </button>
                    <button
                      data-testid="equipment-edit-save-btn"
                      className="btn-primary"
                      onClick={handleSaveDetails}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {detailFields.map((field) => (
                    <div
                      key={field.label}
                      className="detail-field"
                      data-testid="equipment-detail-field"
                    >
                      <span className="detail-field-label">{field.label}</span>
                      <span className="detail-field-value">
                        {field.value || "\u2014"}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Description section */}
          <div
            data-testid="equipment-description-section"
            className="description-section"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h3 className="description-section-title" style={{ marginBottom: 0 }}>
                Description
              </h3>
              {!isEditingDescription && (
                <button
                  data-testid="equipment-edit-description-btn"
                  className="btn-ghost"
                  onClick={() => setIsEditingDescription(true)}
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingDescription ? (
              <div data-testid="equipment-edit-description-form">
                <textarea
                  data-testid="equipment-edit-description"
                  className="form-textarea"
                  value={descriptionDraft}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  rows={4}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <button
                    data-testid="equipment-edit-description-cancel-btn"
                    className="btn-secondary"
                    onClick={handleCancelDescription}
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="equipment-edit-description-save-btn"
                    className="btn-primary"
                    onClick={handleSaveDescription}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p
                data-testid="equipment-description-text"
                className="description-text"
              >
                {equipment.description || "No description provided."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
