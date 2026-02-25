import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchSuppliers } from "../slices/suppliersSlice";
import { fetchOrders } from "../slices/ordersSlice";
import { QuickActions } from "../components/QuickActions";
import { UpcomingOrdersTable } from "../components/UpcomingOrdersTable";
import { SuppliersList } from "../components/SuppliersList";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const suppliers = useAppSelector((s) => s.suppliers.items);
  const suppliersLoading = useAppSelector((s) => s.suppliers.loading);
  const orders = useAppSelector((s) => s.orders.items);
  const ordersLoading = useAppSelector((s) => s.orders.loading);

  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchOrders());
  }, [dispatch]);

  const isLoading = suppliersLoading || ordersLoading;

  if (isLoading && suppliers.length === 0 && orders.length === 0) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="dashboard-page">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="dashboard-page">
      <QuickActions />
      <UpcomingOrdersTable orders={orders} />
      <SuppliersList suppliers={suppliers} />
    </div>
  );
}
