import type { RecipeProduct } from "../types";

interface ProductsOutputTableProps {
  products: RecipeProduct[];
}

export function ProductsOutputTable({ products }: ProductsOutputTableProps) {
  return (
    <div className="section-card" data-testid="products-output-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Products (Output)</h2>
      </div>
      <div className="section-card-body" style={{ padding: 0 }}>
        {products.length === 0 ? (
          <div className="empty-state" data-testid="products-empty">
            <p className="empty-state-message">No products defined.</p>
          </div>
        ) : (
          <table className="data-table" data-testid="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} data-testid="product-row">
                  <td data-testid="product-name">{product.product_name}</td>
                  <td data-testid="product-amount">{product.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
