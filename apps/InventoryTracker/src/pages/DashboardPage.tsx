import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchDashboardData, dismissAlert } from "../slices/dashboardSlice";
import { fetchCategories } from "../slices/categoriesSlice";
import { LowInventoryAlerts } from "../components/LowInventoryAlerts";
import { MaterialsCategoriesOverview } from "../components/MaterialsCategoriesOverview";
import { RecentTransactionsTable } from "../components/RecentTransactionsTable";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { CategoryFilter } from "../components/CategoryFilter";
import { NewTransactionButton } from "../components/NewTransactionButton";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { alerts, categoryOverviews, recentTransactions, loading } = useAppSelector(
    (state) => state.dashboard
  );
  const categories = useAppSelector((state) => state.categories.items);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const loadData = useCallback(() => {
    const params: { date_from?: string; date_to?: string; category_id?: string } = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (selectedCategoryId) params.category_id = selectedCategoryId;
    dispatch(fetchDashboardData(params));
  }, [dispatch, dateFrom, dateTo, selectedCategoryId]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDismiss = (materialId: string) => {
    dispatch(dismissAlert(materialId)).then(() => loadData());
  };

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  if (loading) {
    return (
      <div data-testid="dashboard-page" className="page-content p-6 max-sm:p-3">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page" className="page-content p-6 max-sm:p-3">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="page-header-actions">
          <NewTransactionButton />
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={handleDateRangeChange}
        />
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onChange={handleCategoryChange}
        />
      </div>

      <LowInventoryAlerts alerts={alerts} onDismiss={handleDismiss} />
      <MaterialsCategoriesOverview categoryOverviews={categoryOverviews} />
      <RecentTransactionsTable transactions={recentTransactions} />
    </div>
  );
}
