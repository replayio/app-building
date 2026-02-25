import { useEffect } from "react";
import { useAuth } from "@shared/auth/useAuth";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarAuth } from "./SidebarAuth";

export function NavigationSidebar() {
  const { setAuthLoading } = useAuth();

  useEffect(() => {
    setAuthLoading(false);
  }, [setAuthLoading]);

  return (
    <aside data-testid="sidebar" className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-app-name">Sales CRM</span>
      </div>

      <SidebarAuth />

      <SidebarNavigation />
    </aside>
  );
}
