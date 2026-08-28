// T-EDI Standards ROI model.
// Formulas per tedi-roi-calculator-spec.md, validated against the methodology
// paper's worked example (Lance & Jones, Feb 2025) and GRID_Sheet.xlsx.

export const REPLACE_COST_PCT = 0.2;
export const ATTRITION_REDUCTION_PCT = 0.05;
export const PRODUCTIVITY_IMPROVEMENT = 0.1;
export const PRODUCTIVITY_RECAPTURE = 0.5;
export const DE_LEAVE_PERC = 0.019;
export const CHILDBEARING_AGE_PCT = 0.9;
export const DE_LEAVE_WEEKS = 12;
export const SMALL_ORG_ADMIN_PER_EMPLOYEE = 1000;
export const RISK_ADJUSTMENT = 0.2;
export const LABOUR_RETURN = 1;
export const YIELD_RAMP = [0.2, 0.4, 0.6, 0.8, 1.0];

const AXIS_BRACKETS = [
  { under: 500, max: 500 },
  { under: 2500, max: 2500 },
  { under: 13000, max: 13000 },
  { under: 60000, max: 60000 },
  { under: 150000, max: 150000 },
  { under: 300000, max: 300000 },
  { under: 3000000, max: 3000000 },
  { under: 10000000, max: 10000000 },
  { under: 30000000, max: 30000000 }
];

export function computeModel(totalEmployees, avgSalary, attritionRate) {
  const employeesOnLeave = DE_LEAVE_PERC * CHILDBEARING_AGE_PCT * totalEmployees;
  const costOfLeave = employeesOnLeave * avgSalary * (DE_LEAVE_WEEKS / 52);
  const costOfAdmin =
    totalEmployees < 100 ? SMALL_ORG_ADMIN_PER_EMPLOYEE * totalEmployees : avgSalary;
  const totalCost = costOfAdmin + costOfLeave;

  const totalAttrition = attritionRate * totalEmployees;
  const avoidedAttrition = ATTRITION_REDUCTION_PCT * totalAttrition;
  const rawSavings = avoidedAttrition * REPLACE_COST_PCT * avgSalary;

  const revenue = totalEmployees * avgSalary * LABOUR_RETURN;

  const years = [];
  let cumulative = 0;

  for (let y = 0; y < 5; y++) {
    const ramp = YIELD_RAMP[y];

    const savings = rawSavings * ramp * (1 - RISK_ADJUSTMENT);

    const productivityFactor = PRODUCTIVITY_IMPROVEMENT * ramp;
    const rawProductivity = revenue * productivityFactor * PRODUCTIVITY_RECAPTURE;
    const productivity = rawProductivity * (1 - RISK_ADJUSTMENT);

    const netReturn = savings + productivity - totalCost;
    cumulative += netReturn;

    years.push({
      year: y + 1,
      costs: totalCost,
      savings,
      productivity,
      netReturn,
      cumulativeRoi: cumulative
    });
  }

  return years;
}

export function pickAxisMax(years) {
  let maxVal = 0;
  years.forEach((d) => {
    maxVal = Math.max(
      maxVal,
      d.costs,
      d.savings,
      d.productivity,
      d.savings + d.productivity,
      Math.abs(d.cumulativeRoi)
    );
  });
  const maxK = maxVal / 1000;
  for (const bracket of AXIS_BRACKETS) {
    if (maxK < bracket.under) return bracket.max * 1000;
  }
  return AXIS_BRACKETS[AXIS_BRACKETS.length - 1].max * 1000;
}

export function niceTicks(min, max, targetCount) {
  const span = max - min;
  if (span <= 0) return [min];
  const rawStep = span / targetCount;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / mag;
  const niceResidual = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
  const step = niceResidual * mag;
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let t = start; t <= max + step * 1e-6; t += step) {
    ticks.push(Math.round(t));
  }
  if (!ticks.includes(0) && min < 0 && max > 0) ticks.push(0);
  return ticks.sort((a, b) => a - b);
}

export function formatCurrency(v) {
  const sign = v < 0 ? "-" : "";
  const abs = Math.round(Math.abs(v));
  return sign + "$" + abs.toLocaleString("en-US");
}

export function employeeStep(v) {
  if (v < 100) return 10;
  if (v < 1000) return 25;
  return 100;
}

export function snap(value, step, min) {
  return Math.round((value - min) / step) * step + min;
}
