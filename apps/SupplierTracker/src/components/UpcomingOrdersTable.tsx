import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FilterSelect } from "@shared/components/FilterSelect";
import { formatCurrency } from "@shared/utils/currency";
import { formatDate } from "@shared/utils/date";
import type { Order } from "../slices/ordersSlice";
import "./UpcomingOrdersTable.css";

function getStatusBadgeClass(status: string): string {
  const key = status.toLowerCase().replace(/ /g, "-");
  return `badge badge--${key}`;
}

export function UpcomingOrdersTable({ orders }: { orders: Order[] }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(orders.map((o) => o.status))];
    return [
      { value: "", label: "All Statuses" },
      ...statuses.map((s) => ({ value: s, label: s })),
    ];
  }, [orders]);

  const supplierOptions = useMemo(() => {
    const suppliers = [...new Set(orders.map((o) => o.supplier_name).filter(Boolean))] as string[];
    return [
      { value: "", label: "All Suppliers" },
      ...suppliers.map((s) => ({ value: s, label: s })),
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (supplierFilter && o.supplier_name !== supplierFilter) return false;
      return true;
    });
  }, [orders, statusFilter, supplierFilter]);

  return (
    <div id="orders" className="section-card upcoming-orders" data-testid="upcoming-orders">
      <div className="section-card-header">
        <h2 className="section-card-title" data-testid="upcoming-orders-heading">
          Upcoming Orders
        </h2>
        <div className="upcoming-orders-filters">
          {/* Test: Filter by Status Dropdown, Both Filters Applied Together, Empty State When No Orders Match Filters */}
          <FilterSelect
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter"
            testId="upcoming-orders-status-filter"
          />
          {/* Test: Filter by Supplier Dropdown, Both Filters Applied Together, Empty State When No Orders Match Filters */}
          <FilterSelect
            options={supplierOptions}
            value={supplierFilter}
            onChange={setSupplierFilter}
            placeholder="Filter"
            searchable
            testId="upcoming-orders-supplier-filter"
          />
        </div>
      </div>
      <div className="section-card-body" style={{ padding: 0 }}>
        {orders.length === 0 ? (
          <div className="empty-state" data-testid="upcoming-orders-empty">
            <p className="empty-state-message">No upcoming orders.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state" data-testid="upcoming-orders-empty-filtered">
            <p className="empty-state-message">
              No upcoming orders match the selected filters.
            </p>
          </div>
        ) : (
          <table className="data-table" data-testid="upcoming-orders-table">
            <thead>
              <tr>
                <th>Order Id</th>
                <th>Supplier</th>
                <th>Expected Delivery</th>
                <th>Status</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} data-testid={`upcoming-order-row-${order.order_id}`}>
                  <td>
                    {/* Test: Order ID Links Navigate to Order Details, Order ID Links Are Styled as Clickable */}
                    <button
                      className="order-id-link"
                      data-testid={`order-link-${order.order_id}`}
                      onClick={() => navigate(`/orders/${order.order_id}`)}
                    >
                      #{order.order_id}
                    </button>
                  </td>
                  <td>{order.supplier_name}</td>
                  <td>{order.expected_delivery ? formatDate(order.expected_delivery) : "—"}</td>
                  <td>
                    <span
                      className={getStatusBadgeClass(order.status)}
                      data-testid={`order-status-${order.order_id}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{formatCurrency(order.total_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
