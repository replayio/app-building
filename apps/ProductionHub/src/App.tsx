import { Routes, Route, Navigate } from "react-router-dom";
import { NavigationSidebar } from "./components/NavigationSidebar";
import { EquipmentDetailsPage } from "./pages/EquipmentDetailsPage";
import { EquipmentPage } from "./pages/EquipmentPage";
import { RecipeDetailsPage } from "./pages/RecipeDetailsPage";

export function App() {
  return (
    <div className="sidebar-layout">
      <NavigationSidebar />
      <main className="sidebar-main">
        <Routes>
          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="/recipes" element={<PlaceholderPage title="Recipes" />} />
          <Route path="/recipe/:recipeId" element={<RecipeDetailsPage />} />
          <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
          <Route path="/runs/:runId" element={<PlaceholderPage title="Run Details" />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page-content" style={{ padding: 24 }}>
      <h1 className="page-title">{title}</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Coming soon</p>
    </div>
  );
}
