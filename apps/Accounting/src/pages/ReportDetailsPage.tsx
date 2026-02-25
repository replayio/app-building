import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchReportById, clearCurrentReport } from "../slices/reportsSlice";
import { NavBar } from "../components/NavBar";
import { ReportHeader } from "../components/ReportHeader";
import { VarianceSummary } from "../components/VarianceSummary";
import { VarianceChart } from "../components/VarianceChart";
import { DetailedReportTable } from "../components/DetailedReportTable";

export function ReportDetailsPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { currentReport: report, currentReportItems: items, loading, error } =
    useAppSelector((s) => s.reports);

  useEffect(() => {
    if (id) {
      dispatch(fetchReportById(id));
    }
    return () => {
      dispatch(clearCurrentReport());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div data-testid="report-details-page" className="p-6 max-sm:p-3">
          <p>Loading report...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div data-testid="report-details-page" className="p-6 max-sm:p-3">
          <p className="report-error">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <NavBar />
        <div data-testid="report-details-page" className="p-6 max-sm:p-3">
          <p>Report not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div data-testid="report-details-page" className="report-details-page p-6 max-sm:p-3">
        <ReportHeader report={report} items={items} />
        <VarianceSummary items={items} />
        <VarianceChart items={items} />
        <DetailedReportTable items={items} />
      </div>
    </>
  );
}
