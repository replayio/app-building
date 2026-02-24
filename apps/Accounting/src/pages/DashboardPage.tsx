import React from "react";
import { NavBar } from "../components/NavBar";

export function DashboardPage(): React.ReactElement {
  return (
    <div data-testid="dashboard-page">
      <NavBar />
      <div className="p-6 max-sm:p-3">
        <p>Dashboard Page - To be implemented</p>
      </div>
    </div>
  );
}
