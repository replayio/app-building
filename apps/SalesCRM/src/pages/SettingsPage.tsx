import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { fetchClients } from "../clientsSlice";
import { fetchDeals } from "../dealsSlice";
import { fetchAllTasks } from "../tasksSlice";
import { fetchContacts } from "../contactsSlice";
import { EmailNotificationsSection } from "../components/EmailNotificationsSection";
import { ImportExportSection } from "../components/ImportExportSection";
import { WebhooksSection } from "../components/WebhooksSection";

export function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchDeals());
    dispatch(fetchAllTasks());
    dispatch(fetchContacts());
  }, [dispatch]);

  return (
    <div className="settings-page p-6 max-sm:p-3" data-testid="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>
      <div className="settings-sections">
        <EmailNotificationsSection />
        <ImportExportSection />
        <WebhooksSection />
      </div>
    </div>
  );
}
