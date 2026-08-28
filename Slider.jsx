import { useState } from "react";

export default function Slider({ label, min, max, step, value, displayValue, onChange }) {
  const [active, setActive] = useState(false);

  const pct = (value - min) / (max - min);

  return (
    <div className="control-row">
      <label className="control-label">{label}</label>
      <div
        className={"control-track-wrap" + (active ? " active" : "")}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
      >
        <div
          className="value-bubble"
          style={{ left: `calc(${pct * 100}% + ${9 - pct * 18}px)` }}
        >
          {displayValue}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onPointerDown={() => setActive(true)}
          onPointerUp={() => setActive(false)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="track-value">{displayValue}</div>
      </div>
    </div>
  );
}
