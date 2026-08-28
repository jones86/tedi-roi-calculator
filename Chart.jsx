import { formatCurrency, niceTicks, pickAxisMax } from "./model.js";

const MARGIN = { top: 16, right: 14, bottom: 34, left: 96 };
const WIDTH = 880;
const HEIGHT = 440;
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

export default function Chart({ years, onHover, onLeave, onMove }) {
  const axisMax = pickAxisMax(years);
  const axisMin = -axisMax / 5;

  const yScale = (v) => MARGIN.top + PLOT_H * (1 - (v - axisMin) / (axisMax - axisMin));

  const ticks = niceTicks(axisMin, axisMax, 6);
  const zeroY = yScale(0);

  const n = years.length;
  const colW = PLOT_W / n;
  const barW = colW * 0.46;

  const points = years.map((d, i) => [MARGIN.left + colW * (i + 0.5), yScale(d.cumulativeRoi)]);
  const pathD = points.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");

  const tip = (yearLabel, metricLabel, value) => ({
    onMouseEnter: (e) => onHover(e, yearLabel, metricLabel, value),
    onMouseMove: onMove,
    onMouseLeave: onLeave
  });

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Five year ROI chart"
    >
      {ticks.map((t) => {
        const y = yScale(t);
        return (
          <g key={t}>
            <line
              className={"gridline" + (t === 0 ? " zero" : "")}
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y}
              y2={y}
            />
            <text className="axis-label" x={MARGIN.left - 12} y={y + 4} textAnchor="end">
              {formatCurrency(t)}
            </text>
          </g>
        );
      })}

      <line
        className="axis-line"
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={MARGIN.top + PLOT_H}
      />

      {years.map((d, i) => {
        const cx = MARGIN.left + colW * (i + 0.5);
        const barX = cx - barW / 2;
        const yearLabel = `Year ${d.year}`;

        const costsTopY = zeroY;
        const costsBotY = yScale(-d.costs);

        const savingsTopY = yScale(d.savings);
        const prodTopY = yScale(d.savings + d.productivity);

        return (
          <g key={d.year}>
            <text className="axis-label x" x={cx} y={HEIGHT - MARGIN.bottom + 24}>
              {yearLabel}
            </text>

            <rect
              className="bar-seg costs"
              x={barX}
              y={costsTopY}
              width={barW}
              height={Math.max(0, costsBotY - costsTopY)}
              {...tip(yearLabel, "Costs", -d.costs)}
            />

            <rect
              className="bar-seg savings"
              x={barX}
              y={savingsTopY}
              width={barW}
              height={Math.max(0, zeroY - savingsTopY)}
              {...tip(yearLabel, "Savings from Reduced Attrition (Risk-adjusted)", d.savings)}
            />

            <rect
              className="bar-seg productivity"
              x={barX}
              y={prodTopY}
              width={barW}
              height={Math.max(0, savingsTopY - prodTopY)}
              {...tip(yearLabel, "Increased Productivity (Risk-adjusted)", d.productivity)}
            />
          </g>
        );
      })}

      <path className="roi-line" d={pathD} />

      {years.map((d, i) => (
        <circle
          key={d.year}
          className="roi-dot"
          cx={points[i][0]}
          cy={points[i][1]}
          r={4.5}
          {...tip(`Year ${d.year}`, "Cumulative ROI", d.cumulativeRoi)}
        />
      ))}
    </svg>
  );
}
