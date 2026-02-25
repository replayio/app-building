import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchReports } from "../slices/reportsSlice";
import { NavBar } from "../components/NavBar";
import { ReportListHeader } from "../components/ReportListHeader";
import { ReportTable } from "../components/ReportTable";

export function ReportListPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { items: reports, loading } = useAppSelector((s) => s.reports);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  return (
    <div data-testid="report-list-page">
      <NavBar />
      <div className="p-6 max-sm:p-3">
        <ReportListHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {loading ? (
          <p>Loading reports...</p>
        ) : (
          <ReportTable reports={reports} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}
