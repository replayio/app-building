import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchOrder,
  updateOrder,
  fetchLineItems,
  addLineItem,
  updateLineItem,
  deleteLineItem,
  fetchOrderDocuments,
  uploadOrderDocument,
  fetchOrderHistory,
} from "../slices/ordersSlice";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { OrderSummary } from "../components/OrderSummary";
import { LineItemsTable } from "../components/LineItemsTable";
import { CostBreakdown } from "../components/CostBreakdown";
import { OrderDocuments } from "../components/OrderDocuments";
import { OrderHistory } from "../components/OrderHistory";

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const order = useAppSelector((s) => s.orders.current);
  const lineItems = useAppSelector((s) => s.orders.lineItems);
  const documents = useAppSelector((s) => s.orders.documents);
  const history = useAppSelector((s) => s.orders.history);
  const loading = useAppSelector((s) => s.orders.loading);
  const error = useAppSelector((s) => s.orders.error);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrder(orderId));
      dispatch(fetchLineItems(orderId));
      dispatch(fetchOrderDocuments(orderId));
      dispatch(fetchOrderHistory(orderId));
    }
  }, [dispatch, orderId]);

  const refetchOrder = async () => {
    if (order) {
      await dispatch(fetchOrder(order.id)).unwrap();
    }
  };

  if (loading && !order) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="order-details-page">
        <div className="loading-state">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="order-details-page">
        <div className="error-state">Error loading order: {error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="order-details-page">
        <div className="error-state">Order not found.</div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Dashboard", onClick: () => navigate("/") },
    { label: "Orders", onClick: () => navigate("/") },
    { label: `Order #${order.order_id}` },
  ];

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="order-details-page">
      <Breadcrumb items={breadcrumbItems} />

      <OrderSummary
        order={order}
        onUpdate={async (data) => {
          await dispatch(updateOrder({ id: order.id, ...data })).unwrap();
          await refetchOrder();
          await dispatch(fetchOrderHistory(order.id));
        }}
      />

      <div className="order-details-grid">
        <div className="order-details-left">
          <LineItemsTable
            lineItems={lineItems}
            onAdd={async (data) => {
              await dispatch(addLineItem({ orderId: order.id, ...data })).unwrap();
              await dispatch(fetchLineItems(order.id));
              await refetchOrder();
              await dispatch(fetchOrderHistory(order.id));
            }}
            onEdit={async (lineItemId, data) => {
              await dispatch(updateLineItem({ orderId: order.id, lineItemId, ...data })).unwrap();
              await dispatch(fetchLineItems(order.id));
              await refetchOrder();
              await dispatch(fetchOrderHistory(order.id));
            }}
            onDelete={async (lineItemId) => {
              await dispatch(deleteLineItem({ orderId: order.id, lineItemId })).unwrap();
              await dispatch(fetchLineItems(order.id));
              await refetchOrder();
              await dispatch(fetchOrderHistory(order.id));
            }}
          />

          <CostBreakdown order={order} />
        </div>

        <div className="order-details-right">
          <OrderDocuments
            documents={documents}
            onUpload={async (file, documentType) => {
              await dispatch(uploadOrderDocument({ orderId: order.id, file, documentType })).unwrap();
              await dispatch(fetchOrderDocuments(order.id));
              await dispatch(fetchOrderHistory(order.id));
            }}
          />

          <OrderHistory history={history} />
        </div>
      </div>
    </div>
  );
}
