import React from "react";
import type { ReportItem } from "../types";

interface VarianceChartProps {
  items: ReportItem[];
}

export function VarianceChart({
  items,
}: VarianceChartProps): React.ReactElement {
  const accountItems = items.filter((i) => i.item_type === "account");

  // Chart dimensions
  const chartWidth = 600;
  const chartHeight = 300;
  const paddingLeft = 70;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 50;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate variance values (negative = over budget, positive = under budget)
  // For the chart, we show variance as the difference: budget - actual
  // Positive bars (over budget actual) go UP, negative (under budget) go DOWN
  // But per spec: "over-budget accounts displayed with red bars" extending above zero line
  // and "under-budget accounts displayed with green bars" extending below zero line
  // Over budget means actual > budget, so variance (budget - actual) is negative
  // We need to invert: show abs(variance) above zero for over-budget (negative variance)
  // and abs(variance) below zero for under-budget (positive variance)
  // Actually, re-reading: the chart shows the actual overspend/underspend
  // over-budget = actual > budget = positive bar (red, above zero)
  // under-budget = actual < budget = negative bar (green, below zero)
  // So chart value = actual - budget (opposite of variance field)
  const chartValues = accountItems.map((item) => ({
    name: item.item_name ?? "",
    value: item.actual_amount - item.budget_amount,
    isOverBudget: item.actual_amount > item.budget_amount,
  }));

  if (chartValues.length === 0) {
    return (
      <div className="variance-chart-section" data-testid="variance-chart">
        <h2 className="variance-chart-heading">Top Account Variances</h2>
        <p className="variance-chart-subtitle">Actual vs. Budgeted</p>
        <div className="variance-chart-empty">No data available</div>
      </div>
    );
  }

  const maxVal = Math.max(...chartValues.map((v) => Math.abs(v.value)), 1);
  // Round up to a nice number
  const scale = Math.ceil(maxVal / 10) * 10;

  const barGroupWidth = innerWidth / chartValues.length;
  const barWidth = Math.min(barGroupWidth * 0.6, 50);

  // Zero line position
  const zeroY = paddingTop + innerHeight / 2;

  // Y-axis ticks
  const ticks = [-scale, -scale / 2, 0, scale / 2, scale];

  function valueToY(v: number): number {
    return zeroY - (v / scale) * (innerHeight / 2);
  }

  function formatAxisValue(v: number): string {
    const abs = Math.abs(v);
    if (abs >= 1000) {
      return v < 0 ? `-$${abs / 1000}k` : `$${abs / 1000}k`;
    }
    return v < 0 ? `-$${abs}` : `$${abs}`;
  }

  return (
    <div className="variance-chart-section" data-testid="variance-chart">
      <h2 className="variance-chart-heading">Top Account Variances</h2>
      <p className="variance-chart-subtitle">Actual vs. Budgeted</p>
      <div className="variance-chart-container">
        <svg
          width="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="variance-chart-svg"
          data-testid="variance-chart-svg"
        >
          {/* Y-axis ticks and gridlines */}
          {ticks.map((tick) => {
            const y = valueToY(tick);
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  x2={chartWidth - paddingRight}
                  y1={y}
                  y2={y}
                  stroke={
                    tick === 0
                      ? "var(--text-muted)"
                      : "var(--bg-border-color-light)"
                  }
                  strokeWidth={tick === 0 ? 1.5 : 0.5}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="11"
                >
                  {formatAxisValue(tick)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {chartValues.map((item, i) => {
            const cx =
              paddingLeft + barGroupWidth * i + barGroupWidth / 2;
            const barX = cx - barWidth / 2;
            const barVal = item.value;
            const barColor = item.isOverBudget
              ? "var(--status-error)"
              : "var(--status-success)";
            const barY = barVal >= 0 ? valueToY(barVal) : zeroY;
            const barH = Math.abs(valueToY(barVal) - zeroY);

            return (
              <g
                key={item.name}
                data-testid={`chart-bar-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              >
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.max(barH, 1)}
                  fill={barColor}
                  rx={2}
                />
                <text
                  x={cx}
                  y={chartHeight - paddingBottom + 20}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="12"
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
