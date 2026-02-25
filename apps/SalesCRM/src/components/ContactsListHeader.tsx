import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchContacts, importContacts } from "../contactsSlice";
import type { Contact } from "../contactsSlice";
import { ImportDialog, type ImportColumn, type ImportRowError } from "@shared/components/ImportDialog";
import { generateCsv } from "@shared/utils/csv";

const IMPORT_COLUMNS: ImportColumn[] = [
  { header: "Name", key: "Name", required: true, description: "Contact name" },
  { header: "Title", key: "Title", required: false, description: "Job title" },
  { header: "Email", key: "Email", required: false, description: "Email address" },
  { header: "Phone", key: "Phone", required: false, description: "Phone number" },
  { header: "Location", key: "Location", required: false, description: "Location (e.g., City, State)" },
  { header: "Client Name", key: "Client Name", required: false, description: "Associates with an existing client by name" },
];

const EXPORT_COLUMNS = [
  { header: "Name", key: "name" },
  { header: "Title", key: "title" },
  { header: "Email", key: "email" },
  { header: "Phone", key: "phone" },
  { header: "Location", key: "location" },
  { header: "Client Name", key: "clientName" },
];

interface ContactsListHeaderProps {
  onAddContact: () => void;
}

export function ContactsListHeader({ onAddContact }: ContactsListHeaderProps) {
  const [importOpen, setImportOpen] = useState(false);
  const contacts = useSelector((state: RootState) => (state as unknown as { contacts: { items: Contact[] } }).contacts.items);
  const dispatch = useDispatch<AppDispatch>();

  function handleExport() {
    const exportData = contacts.map((c) => ({
      name: c.name,
      title: c.title || "",
      email: c.email || "",
      phone: c.phone || "",
      location: c.location || "",
      clientName: c.associatedClients.map((ac) => ac.name).join(", "),
    }));
    const csv = generateCsv(exportData, EXPORT_COLUMNS);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(rows: Record<string, string>[]): Promise<{ errors?: ImportRowError[] }> {
    const result = await dispatch(importContacts(rows)).unwrap();
    if (result.errors && result.errors.length > 0) {
      return { errors: result.errors };
    }
    await dispatch(fetchContacts());
    return {};
  }

  return (
    <>
      <div className="page-header" data-testid="contacts-list-header">
        <h1 className="page-title">Contacts</h1>
        <div className="contacts-header-actions">
          <button
            className="btn btn--secondary"
            data-testid="import-btn"
            onClick={() => setImportOpen(true)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Import
          </button>
          <button
            className="btn btn--secondary"
            data-testid="export-btn"
            onClick={handleExport}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 10V1M3.5 4.5L7 1l3.5 3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export CSV
          </button>
          <button
            className="btn btn--primary"
            data-testid="add-contact-btn"
            onClick={onAddContact}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Contact
          </button>
        </div>
      </div>

      <ImportDialog
        open={importOpen}
        title="Import Contacts"
        columns={IMPORT_COLUMNS}
        onImport={handleImport}
        onClose={() => setImportOpen(false)}
        testId="import-dialog"
      />
    </>
  );
}
