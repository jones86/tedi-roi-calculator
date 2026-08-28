import { useState } from "react";
import Chart from "./Chart.jsx";
import Slider from "./Slider.jsx";
import Tooltip from "./Tooltip.jsx";
import { computeModel, employeeStep, snap } from "./model.js";
import "./App.css";

export default function App() {
  const [employees, setEmployees] = useState(3000);
  const [salary, setSalary] = useState(136000);
  const [attritionPct, setAttritionPct] = useState(20);
  const [tip, setTip] = useState(null);

  const years = computeModel(employees, salary, attritionPct / 100);

  function handleEmployeesChange(v) {
    const snapped = Math.min(10000, Math.max(100, snap(v, employeeStep(v), 100)));
    setEmployees(snapped);
  }

  function handleHover(e, yearLabel, metricLabel, value) {
    setTip({ x: e.clientX, y: e.clientY, yearLabel, metricLabel, value });
  }

  function handleMove(e) {
    setTip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
  }

  function handleLeave() {
    setTip(null);
  }

  return (
    <div className="card">
      <div className="panel">
        <div className="chart-wrap">
          <Chart years={years} onHover={handleHover} onMove={handleMove} onLeave={handleLeave} />
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="swatch costs" />
            Costs
          </div>
          <div className="legend-item">
            <span className="swatch savings" />
            Savings from Reduced Attrition (Risk-adjusted)
          </div>
          <div className="legend-item">
            <span className="swatch productivity" />
            Increased Productivity (Risk-adjusted)
          </div>
          <div className="legend-item">
            <span className="swatch line roi" />
            Cumulative ROI
          </div>
        </div>
      </div>

      <div className="controls">
        <Slider
          label="Total Employees"
          min={100}
          max={10000}
          step={1}
          value={employees}
          displayValue={employees.toLocaleString("en-US")}
          onChange={handleEmployeesChange}
        />
        <Slider
          label="Average Salary + Costs"
          min={80000}
          max={250000}
          step={500}
          value={salary}
          displayValue={"$" + salary.toLocaleString("en-US")}
          onChange={setSalary}
        />
        <Slider
          label="Attrition Rate"
          min={0}
          max={40}
          step={0.5}
          value={attritionPct}
          displayValue={attritionPct.toFixed(1) + "%"}
          onChange={setAttritionPct}
        />
      </div>

      <Tooltip tip={tip} />
    </div>
  );
}
