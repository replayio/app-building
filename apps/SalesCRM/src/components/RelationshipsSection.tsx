import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import {
  createRelationship,
  deleteRelationship,
  fetchRelationships,
  type RelationshipItem,
  type IndividualOption,
} from "../personDetailSlice";
import { SearchableSelect } from "@shared/components/SearchableSelect";
import { FilterSelect } from "@shared/components/FilterSelect";

interface RelationshipsSectionProps {
  relationships: RelationshipItem[];
  individualId: string;
  allIndividuals: IndividualOption[];
}

const RELATIONSHIP_TYPES = ["Colleague", "Decision Maker", "Influencer"];

function formatRelType(type: string): string {
  return type;
}

export function RelationshipsSection({
  relationships,
  individualId,
  allIndividuals,
}: RelationshipsSectionProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [filterType, setFilterType] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addRelatedId, setAddRelatedId] = useState("");
  const [addRelType, setAddRelType] = useState("Colleague");
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  const filtered = filterType
    ? relationships.filter((r) => r.relationshipType === filterType)
    : relationships;

  const filterOptions = [
    { value: "", label: "All Types" },
    ...RELATIONSHIP_TYPES.map((t) => ({ value: t, label: t })),
  ];

  const selectOptions = allIndividuals
    .filter((ind) => ind.id !== individualId)
    .map((ind) => ({ id: ind.id, label: ind.name + (ind.title ? ` (${ind.title})` : "") }));

  const handleAdd = async () => {
    if (!addRelatedId) {
      setAddError("Please select a person");
      return;
    }
    setAddSaving(true);
    setAddError("");
    try {
      await dispatch(
        createRelationship({
          individualId,
          relatedIndividualId: addRelatedId,
          relationshipType: addRelType,
        })
      ).unwrap();
      await dispatch(fetchRelationships(individualId));
      setShowAddModal(false);
      setAddRelatedId("");
      setAddRelType("Colleague");
    } catch {
      setAddError("Failed to create relationship");
    } finally {
      setAddSaving(false);
    }
  };

  const handleDelete = async (relId: string) => {
    await dispatch(deleteRelationship(relId));
    dispatch(fetchRelationships(individualId));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setAddRelatedId("");
    setAddRelType("Colleague");
    setAddError("");
  };

  return (
    <div className="detail-section" data-testid="relationships-section">
      <div className="detail-section-header">
        <div className="detail-section-header-left">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="section-icon">
            <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 7L10 5M6 9L10 11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <h3 className="detail-section-title">Relationships with Other Individuals</h3>
        </div>
        <div className="detail-section-header-actions">
          <div className="view-tabs" data-testid="relationship-view-tabs">
            <button
              className={`view-tab ${viewMode === "graph" ? "view-tab--active" : ""}`}
              data-testid="graph-view-tab"
              onClick={() => setViewMode("graph")}
              type="button"
            >
              Graph View
            </button>
            <button
              className={`view-tab ${viewMode === "list" ? "view-tab--active" : ""}`}
              data-testid="list-view-tab"
              onClick={() => setViewMode("list")}
              type="button"
            >
              List View
            </button>
          </div>
          <button
            className="btn btn--secondary btn--sm"
            data-testid="relationships-filter-btn"
            onClick={() => setShowFilter(!showFilter)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.5 2.5H12.5L8.5 7.5V11.5L5.5 10.5V7.5L1.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            Filter
          </button>
          <button
            className="btn btn--primary btn--sm"
            data-testid="add-relationship-btn"
            onClick={() => setShowAddModal(true)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Entry
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="detail-section-filter" data-testid="relationships-filter-controls">
          <FilterSelect
            options={filterOptions}
            value={filterType}
            onChange={setFilterType}
            placeholder="Filter by type"
            testId="relationships-type-filter"
          />
        </div>
      )}

      <div className="detail-section-body">
        {viewMode === "list" ? (
          filtered.length === 0 ? (
            <p className="detail-section-empty" data-testid="relationships-empty">
              No relationships
            </p>
          ) : (
            <div className="relationships-list" data-testid="relationships-list">
              {filtered.map((rel) => (
                <div key={rel.id} className="relationship-item" data-testid="relationship-item">
                  <div className="relationship-info">
                    <span className="relationship-name" data-testid="relationship-name">
                      {rel.relatedIndividualName}
                    </span>
                    <span className="relationship-type" data-testid="relationship-type">
                      ({formatRelType(rel.relationshipType)})
                    </span>
                    {(rel.title || rel.organizations) && (
                      <span className="relationship-detail" data-testid="relationship-detail">
                        {[rel.title, rel.organizations].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="relationship-actions">
                    <button
                      className="relationship-link"
                      data-testid={`relationship-link-${rel.relatedIndividualId}`}
                      onClick={() => navigate(`/individuals/${rel.relatedIndividualId}`)}
                      type="button"
                    >
                      [Link]
                    </button>
                    <button
                      className="relationship-delete-btn"
                      data-testid={`relationship-delete-${rel.id}`}
                      onClick={() => handleDelete(rel.id)}
                      type="button"
                      title="Delete relationship"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="relationships-graph" data-testid="relationships-graph">
            <div className="relationships-graph-container">
              <svg
                viewBox="0 0 400 300"
                className="relationships-graph-svg"
                data-testid="relationships-graph-svg"
              >
                {filtered.map((rel, i) => {
                  const angle = (i / Math.max(filtered.length, 1)) * 2 * Math.PI - Math.PI / 2;
                  const cx = 200 + 120 * Math.cos(angle);
                  const cy = 150 + 100 * Math.sin(angle);
                  return (
                    <g key={rel.id}>
                      <line
                        x1="200"
                        y1="150"
                        x2={cx}
                        y2={cy}
                        stroke="var(--bg-border-color)"
                        strokeWidth="1.5"
                      />
                      <circle cx={cx} cy={cy} r="24" fill="var(--accent-subtle-bg)" stroke="var(--accent-primary)" strokeWidth="1.5" />
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="9"
                        fill="var(--text-primary)"
                      >
                        {rel.relatedIndividualName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </text>
                      <text
                        x={cx}
                        y={cy + 34}
                        textAnchor="middle"
                        fontSize="8"
                        fill="var(--text-muted)"
                      >
                        {rel.relatedIndividualName.length > 15
                          ? rel.relatedIndividualName.slice(0, 14) + "…"
                          : rel.relatedIndividualName}
                      </text>
                    </g>
                  );
                })}
                <circle cx="200" cy="150" r="28" fill="var(--accent-primary)" />
                <text
                  x="200"
                  y="150"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fill="white"
                  fontWeight="600"
                >
                  You
                </text>
              </svg>
            </div>
            {filtered.length === 0 && (
              <p className="detail-section-empty" data-testid="relationships-empty">
                No relationships
              </p>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" data-testid="add-relationship-modal" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Relationship</h2>
              <button className="modal-close" onClick={handleCloseModal} type="button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {addError && <div className="modal-error">{addError}</div>}
              <div className="form-group">
                <label className="form-label">Related Person</label>
                <SearchableSelect
                  options={selectOptions}
                  value={addRelatedId}
                  onChange={setAddRelatedId}
                  placeholder="Search for a person..."
                  testId="add-relationship-person"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Relationship Type</label>
                <FilterSelect
                  options={RELATIONSHIP_TYPES.map((t) => ({ value: t, label: t }))}
                  value={addRelType}
                  onChange={setAddRelType}
                  testId="add-relationship-type"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn--secondary"
                data-testid="add-relationship-cancel"
                onClick={handleCloseModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                data-testid="add-relationship-submit"
                onClick={handleAdd}
                disabled={addSaving || !addRelatedId}
                type="button"
              >
                {addSaving ? "Saving..." : "Add Relationship"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
