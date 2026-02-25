import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchSupplier,
  updateSupplier,
  deleteSupplier,
  fetchSupplierComments,
  addSupplierComment,
  fetchSupplierDocuments,
  uploadSupplierDocument,
  deleteSupplierDocument,
} from "../slices/suppliersSlice";
import { fetchOrdersBySupplier } from "../slices/ordersSlice";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { SupplierOverview } from "../components/SupplierOverview";
import { DocumentsTab } from "../components/DocumentsTab";
import { SupplierCommentsSection } from "../components/SupplierCommentsSection";
import { OrdersSection } from "../components/OrdersSection";

export function SupplierDetailsPage() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const supplier = useAppSelector((s) => s.suppliers.current);
  const comments = useAppSelector((s) => s.suppliers.comments);
  const documents = useAppSelector((s) => s.suppliers.documents);
  const orders = useAppSelector((s) => s.orders.items);
  const loading = useAppSelector((s) => s.suppliers.loading);
  const error = useAppSelector((s) => s.suppliers.error);

  const documentsRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (supplierId) {
      dispatch(fetchSupplier(supplierId));
      dispatch(fetchSupplierComments(supplierId));
      dispatch(fetchSupplierDocuments(supplierId));
      dispatch(fetchOrdersBySupplier(supplierId));
    }
  }, [dispatch, supplierId]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading && !supplier) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="supplier-details-page">
        <div className="loading-state">Loading supplier details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="supplier-details-page">
        <div className="error-state">Error loading supplier: {error}</div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="supplier-details-page">
        <div className="error-state">Supplier not found.</div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", onClick: () => navigate("/") },
    { label: "Suppliers", onClick: () => navigate("/") },
    { label: supplier.name },
    { label: "Supplier Details" },
  ];

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="supplier-details-page">
      <Breadcrumb items={breadcrumbItems} />

      <SupplierOverview
        supplier={supplier}
        onUpdate={async (data) => {
          await dispatch(updateSupplier({ id: supplier.id, ...data })).unwrap();
          await dispatch(fetchSupplier(supplier.id));
        }}
        onDelete={async () => {
          await dispatch(deleteSupplier(supplier.id)).unwrap();
        }}
      />

      <div className="supplier-detail-tabs" data-testid="supplier-detail-tabs">
        <button
          className="tab-nav-item tab-nav-item--active-link"
          data-testid="tab-documents"
          onClick={() => scrollToSection(documentsRef)}
        >
          Documents
        </button>
        <button
          className="tab-nav-item tab-nav-item--active-link"
          data-testid="tab-comments"
          onClick={() => scrollToSection(commentsRef)}
        >
          Comments
        </button>
        <button
          className="tab-nav-item tab-nav-item--active-link"
          data-testid="tab-orders"
          onClick={() => scrollToSection(ordersRef)}
        >
          Orders
        </button>
      </div>

      <div className="section-card" ref={documentsRef} data-testid="documents-section">
        <div className="section-card-body">
          <DocumentsTab
            documents={documents}
            onUpload={async (file, documentType) => {
              await dispatch(uploadSupplierDocument({ supplierId: supplier.id, file, documentType })).unwrap();
              await dispatch(fetchSupplierDocuments(supplier.id));
            }}
            onDelete={(documentId) => {
              dispatch(deleteSupplierDocument({ supplierId: supplier.id, documentId }));
            }}
          />
        </div>
      </div>

      <div className="section-card" ref={commentsRef} data-testid="comments-section-card">
        <div className="section-card-body">
          <SupplierCommentsSection
            comments={comments}
            onAddComment={async (text) => {
              await dispatch(addSupplierComment({
                supplierId: supplier.id,
                text,
                authorName: "Admin",
              })).unwrap();
            }}
          />
        </div>
      </div>

      <div className="section-card" ref={ordersRef} data-testid="orders-section-card">
        <div className="section-card-body">
          <OrdersSection orders={orders} />
        </div>
      </div>
    </div>
  );
}
