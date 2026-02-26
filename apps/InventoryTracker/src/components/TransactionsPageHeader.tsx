import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { NewTransactionButton } from "./NewTransactionButton";

export function TransactionsPageHeader() {
  const navigate = useNavigate();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Transactions" },
        ]}
      />

      <div className="page-header" style={{ marginTop: 16 }}>
        <h1 className="page-title" data-testid="transactions-page-title">Transactions</h1>
        <div className="page-header-actions">
          <NewTransactionButton />
        </div>
      </div>
    </>
  );
}
