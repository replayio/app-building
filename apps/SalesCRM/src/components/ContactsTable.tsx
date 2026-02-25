import { useNavigate } from "react-router-dom";
import type { Contact } from "../contactsSlice";

interface ContactsTableProps {
  contacts: Contact[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const navigate = useNavigate();

  if (contacts.length === 0) {
    return (
      <div className="clients-empty" data-testid="contacts-table-empty">
        <p>No contacts found matching your search.</p>
      </div>
    );
  }

  return (
    <div data-testid="contacts-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Associated Clients</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              data-testid={`contact-row-${contact.id}`}
              className="contacts-table-row"
              onClick={() => navigate(`/individuals/${contact.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td className="contacts-name-cell">{contact.name}</td>
              <td>{contact.title || ""}</td>
              <td>{contact.email || ""}</td>
              <td>{contact.phone || ""}</td>
              <td>{contact.location || ""}</td>
              <td>
                {contact.associatedClients.length > 0
                  ? contact.associatedClients.map((c) => c.name).join(", ")
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
