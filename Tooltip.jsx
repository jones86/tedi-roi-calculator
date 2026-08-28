import { formatCurrency } from "./model.js";

export default function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div
      id="tooltip"
      className="visible"
      style={{ left: tip.x, top: tip.y - 14 }}
    >
      <div className="t-year">{tip.yearLabel}</div>
      <div className="t-row">
        <span className="t-label">{tip.metricLabel}</span>
        <span className="t-val">{formatCurrency(tip.value)}</span>
      </div>
    </div>
  );
}
