import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchPreferences,
  updatePreferences,
  type NotificationPreferences,
} from "../settingsSlice";

const PREFERENCE_TOGGLES: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "clientUpdated", label: "Client Updated" },
  { key: "dealCreated", label: "Deal Created" },
  { key: "dealStageChanged", label: "Deal Stage Changed" },
  { key: "taskCreated", label: "Task Created" },
  { key: "taskCompleted", label: "Task Completed" },
  { key: "contactAdded", label: "Contact Added" },
  { key: "noteAdded", label: "Note Added" },
];

export function EmailNotificationsSection() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const preferences = useAppSelector((state) => (state as unknown as { settings: { preferences: NotificationPreferences; preferencesLoading: boolean } }).settings.preferences);
  const loading = useAppSelector((state) => (state as unknown as { settings: { preferencesLoading: boolean } }).settings.preferencesLoading);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPreferences());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) return null;

  function handleToggle(key: keyof NotificationPreferences) {
    const updated = { ...preferences, [key]: !preferences[key] };
    dispatch(updatePreferences(updated));
  }

  return (
    <div className="settings-section" data-testid="email-notifications-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Email Notifications</h2>
        <p className="settings-section-description">
          Configure email alert preferences for followed clients.
        </p>
      </div>
      {loading ? (
        <div className="settings-loading">Loading preferences...</div>
      ) : (
        <div className="settings-toggles" data-testid="notification-toggles">
          {PREFERENCE_TOGGLES.map(({ key, label }) => (
            <div className="settings-toggle-row" key={key}>
              <span className="settings-toggle-label">{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={preferences[key]}
                className={`settings-toggle ${preferences[key] ? "settings-toggle--on" : "settings-toggle--off"}`}
                data-testid={`toggle-${key}`}
                onClick={() => handleToggle(key)}
              >
                <span className="settings-toggle-thumb" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
