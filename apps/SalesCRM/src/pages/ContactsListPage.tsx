import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchContacts } from "../contactsSlice";
import type { Contact } from "../contactsSlice";
import { ContactsListHeader } from "../components/ContactsListHeader";
import { ContactsSearch } from "../components/ContactsSearch";
import { ContactsTable } from "../components/ContactsTable";
import { ContactsPagination } from "../components/ContactsPagination";
import { AddContactModal } from "../components/AddContactModal";

const PAGE_SIZE = 50;

export function ContactsListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: contacts, loading } = useSelector(
    (state: RootState) => state.contacts as { items: Contact[]; loading: boolean; error: string | null }
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  // Filter contacts by search
  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;

    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading && contacts.length === 0) {
    return (
      <div className="contacts-page p-6 max-sm:p-3" data-testid="contacts-list-page">
        <div className="page-header">
          <h1 className="page-title">Contacts</h1>
        </div>
        <div className="clients-loading">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="contacts-page p-6 max-sm:p-3" data-testid="contacts-list-page">
      <ContactsListHeader onAddContact={() => setAddModalOpen(true)} />

      <ContactsSearch onSearchChange={handleSearchChange} />

      <ContactsTable contacts={paginated} />

      <ContactsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

      <AddContactModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
