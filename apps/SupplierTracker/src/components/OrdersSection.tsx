import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../slices/ordersSlice";
import { FilterSelect } from "@shared/components/FilterSelect";
import { formatCurrency } from "@shared/utils/currency";
import { formatDate } from "@shared/utils/date";
import "./OrdersSection.css";

interface OrdersSectionProps {
  orders: Order[];
}

const UPCOMING_STATUSES = ["Pending", "Approved", "Processing", "In Transit", "Shipped"];
const HISTORICAL_STATUSES = ["Completed", "Fulfilled", "Delivered", "Cancelled"];

export function OrdersSection({ orders }: OrdersSectionProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "historical">("upcoming");
  const [upcomingSearch, setUpcomingSearch] = useState("");
  const [historicalSearch, setHistoricalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const upcomingOrders = useMemo(
    () => orders.filter((o) => UPCOMING_STATUSES.includes(o.status)),
    [orders]
  );

  const historicalOrders = useMemo(
    () => orders.filter((o) => HISTORICAL_STATUSES.includes(o.status)),
    [orders]
  );

  const filteredUpcoming = useMemo(() => {
    let result = upcomingOrders;
    if (upcomingSearch.trim()) {
      const q = upcomingSearch.toLowerCase();
      result = result.filter((o) => o.order_id.toLowerCase().includes(q));
    }
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }
    return result;
  }, [upcomingOrders, upcomingSearch, statusFilter]);

  const filteredHistorical = useMemo(() => {
    let result = historicalOrders;
    if (historicalSearch.trim()) {
      const q = historicalSearch.toLowerCase();
      result = result.filter((o) => o.order_id.toLowerCase().includes(q));
    }
    return result;
  }, [historicalOrders, historicalSearch]);

  const upcomingStatusOptions = useMemo(() => {
    const statuses = [...new Set(upcomingOrders.map((o) => o.status))];
    return [
      { value: "", label: "All Statuses" },
      ...statuses.map((s) => ({ value: s, label: s })),
    ];
  }, [upcomingOrders]);

  const getStatusClass = (status: string) => {
    return `badge badge--${status.toLowerCase().replace(/ /g, "-")}`;
  };

  return (
    <div className="orders-section" data-testid="orders-section">
      <h3 className="orders-section-title">Orders</h3>

      <div className="tab-nav" data-testid="orders-tab-nav">
        <button
          className={`tab-nav-item${activeTab === "upcoming" ? " tab-nav-item--active" : ""}`}
          data-testid="orders-tab-upcoming"
          onClick={() => {
            setActiveTab("upcoming");
            setStatusFilter("");
          }}
        >
          Upcoming Orders
        </button>
        <button
          className={`tab-nav-item${activeTab === "historical" ? " tab-nav-item--active" : ""}`}
          data-testid="orders-tab-historical"
          onClick={() => {
            setActiveTab("historical");
            setStatusFilter("");
          }}
        >
          Historical Orders
        </button>
      </div>

      {activeTab === "upcoming" && (
        <div data-testid="upcoming-orders-content">
          <div className="orders-section-controls">
            <input
              type="text"
              className="form-input orders-search"
              data-testid="upcoming-orders-search"
              placeholder="Search orders..."
              value={upcomingSearch}
              onChange={(e) => setUpcomingSearch(e.target.value)}
            />
            <FilterSelect
              options={upcomingStatusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by Status"
              testId="upcoming-orders-status-filter"
            />
          </div>

          {filteredUpcoming.length === 0 ? (
            <div className="empty-state" data-testid="upcoming-orders-empty">
              <p className="empty-state-message">
                {upcomingSearch.trim() || statusFilter
                  ? "No orders match your filters."
                  : "No upcoming orders."}
              </p>
            </div>
          ) : (
            <table className="data-table" data-testid="upcoming-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                  <th className="text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcoming.map((order) => (
                  <tr key={order.id} data-testid="upcoming-order-row">
                    <td>
                      <a
                        className="link"
                        data-testid="order-id-link"
                        href={`/orders/${order.order_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/orders/${order.order_id}`);
                        }}
                      >
                        [{order.order_id}]
                      </a>
                    </td>
                    <td>{order.expected_delivery ? formatDate(order.expected_delivery) : "—"}</td>
                    <td>
                      <span className={getStatusClass(order.status)} data-testid="order-status-badge">
                        {order.status}
                      </span>
                    </td>
                    <td className="text-right">{formatCurrency(order.total_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "historical" && (
        <div data-testid="historical-orders-content">
          <div className="orders-section-controls">
            <input
              type="text"
              className="form-input orders-search"
              data-testid="historical-orders-search"
              placeholder="Search orders..."
              value={historicalSearch}
              onChange={(e) => setHistoricalSearch(e.target.value)}
            />
          </div>

          {filteredHistorical.length === 0 ? (
            <div className="empty-state" data-testid="historical-orders-empty">
              <p className="empty-state-message">
                {historicalSearch.trim()
                  ? "No orders match your search."
                  : "No historical orders."}
              </p>
            </div>
          ) : (
            <table className="data-table" data-testid="historical-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Delivery Date</th>
                  <th>Status</th>
                  <th className="text-right">Final Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistorical.map((order) => (
                  <tr key={order.id} data-testid="historical-order-row">
                    <td>
                      <a
                        className="link"
                        data-testid="order-id-link"
                        href={`/orders/${order.order_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/orders/${order.order_id}`);
                        }}
                      >
                        [{order.order_id}]
                      </a>
                    </td>
                    <td>{order.expected_delivery ? formatDate(order.expected_delivery) : "—"}</td>
                    <td>
                      <span className={getStatusClass(order.status)} data-testid="order-status-badge">
                        {order.status}
                      </span>
                    </td>
                    <td className="text-right">{formatCurrency(order.total_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
