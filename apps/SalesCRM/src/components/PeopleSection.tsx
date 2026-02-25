import { useNavigate } from "react-router-dom";
import { type PersonItem } from "../clientDetailSlice";

interface PeopleSectionProps {
  people: PersonItem[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PeopleSection({ people }: PeopleSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="detail-section" data-testid="people-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">People</h3>
      </div>
      <div className="detail-section-body">
        {people.length === 0 ? (
          <p className="detail-section-empty" data-testid="people-empty">
            No people associated
          </p>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="person-item"
              data-testid="person-item"
              onClick={() => navigate(`/individuals/${person.id}`)}
            >
              <div className="person-avatar" data-testid="person-avatar">
                {getInitials(person.name)}
              </div>
              <div className="person-info">
                <div className="person-name" data-testid="person-name">
                  {person.name}
                </div>
                {(person.role || person.title) && (
                  <div className="person-role" data-testid="person-role">
                    {person.role || person.title}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
