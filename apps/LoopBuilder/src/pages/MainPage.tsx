import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { AppStatus } from '../types';
import { fetchApps, setFilter } from '../slices/appsSlice';
import { FilterTabs } from '../components/FilterTabs';
import { AppCard } from '../components/AppCard';

export function MainPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, filter } = useSelector(
    (state: RootState) => state.apps
  );

  useEffect(() => {
    dispatch(fetchApps(filter));
  }, [dispatch, filter]);

  const handleFilterChange = (newFilter: AppStatus) => {
    dispatch(setFilter(newFilter));
  };

  return (
    <div className="p-6 max-sm:p-3" data-testid="main-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <FilterTabs activeFilter={filter} onFilterChange={handleFilterChange} />

      <div style={{ marginTop: '20px' }}>
        <Link to="/request" className="cta-button" data-testid="cta-request-app">
          Request an app
        </Link>
      </div>

      <div style={{ marginTop: '24px' }}>
        {loading && (
          <div className="loading-container" data-testid="loading">
            Loading apps...
          </div>
        )}

        {error && (
          <div className="empty-state" data-testid="error-state">
            <div className="empty-state-title">Error</div>
            <div className="empty-state-subtitle">{error}</div>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="empty-state" data-testid="empty-state">
            <div className="empty-state-title">No apps found</div>
            <div className="empty-state-subtitle">
              No apps match the selected filter.
            </div>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="app-grid" data-testid="app-grid">
            {items.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
