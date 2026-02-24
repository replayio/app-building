import React from "react";
import { NavBar } from "../components/NavBar";

export function BudgetsPage(): React.ReactElement {
  return (
    <div data-testid="budgets-page">
      <NavBar />
      <div className="p-6 max-sm:p-3">
        <p>Budgets Page - To be implemented</p>
      </div>
    </div>
  );
}
