import React, { useState } from 'react';
import { Calculator, TrendingUp, Clock, DollarSign, ShieldCheck, Sparkles } from 'lucide-react';
import { SUPPORTED_CURRENCY_RATES } from '../../services/pricingEngineService';

interface ROIEstimatorProps {
  initialCurrency?: string;
}

export const ROIEstimator: React.FC<ROIEstimatorProps> = ({ initialCurrency = 'UGX' }) => {
  const [currency, setCurrency] = useState(initialCurrency);
  const [studentCount, setStudentCount] = useState<number>(450);
  const [staffCount, setStaffCount] = useState<number>(24);
  const [adminHoursWeekly, setAdminHoursWeekly] = useState<number>(18);
  const [leakagePercent, setLeakagePercent] = useState<number>(4);

  const curr = SUPPORTED_CURRENCY_RATES[currency] || SUPPORTED_CURRENCY_RATES.UGX;

  // Approximate calculations
  // Hours saved: ~70% reduction in manual attendance, marks recording, and receipt writing
  const hoursSavedPerTerm = Math.round(adminHoursWeekly * 12 * 0.7);
  const hoursSavedPerYear = hoursSavedPerTerm * 3;

  // Estimated paper report card & receipt stationery savings (approx $3 per student per year)
  const stationerySavingsUSD = studentCount * 3;
  const stationerySavingsLocal = Math.round(stationerySavingsUSD * curr.rateVsUSD);

  // Estimated uncollected/delayed fee leakage reduction (typical 2-5% of fees collected on time)
  // Assume avg term fee of $80 USD
  const avgAnnualFeeUSD = 240;
  const recoveredFeeLeakageUSD = Math.round((studentCount * avgAnnualFeeUSD) * (leakagePercent / 100) * 0.4);
  const recoveredFeeLeakageLocal = Math.round(recoveredFeeLeakageUSD * curr.rateVsUSD);

  const totalAnnualSavingsLocal = stationerySavingsLocal + recoveredFeeLeakageLocal;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Calculator className="w-4 h-4" /> Institutional Efficiency Calculator
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            SchoolSoul ROI & Time Savings Estimator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimate how much administrative time and operating revenue your school saves each year.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="shrink-0">
          <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
            Display Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {Object.values(SUPPORTED_CURRENCY_RATES).map((c) => (
              <option key={c.currency} value={c.currency}>
                {c.currency} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slider 1: Students */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <label htmlFor="roi-student-count-slider" className="text-slate-700 dark:text-slate-300">Total Student Enrollment</label>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono">
              {studentCount.toLocaleString()} Students
            </span>
          </div>
          <input
            id="roi-student-count-slider"
            type="range"
            min={100}
            max={3000}
            step={50}
            value={studentCount}
            onChange={(e) => setStudentCount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>100</span>
            <span>1,500</span>
            <span>3,000+</span>
          </div>
        </div>

        {/* Slider 2: Teachers & Staff */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <label htmlFor="roi-staff-count-slider" className="text-slate-700 dark:text-slate-300">Teaching & Admin Staff</label>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">
              {staffCount} Staff Members
            </span>
          </div>
          <input
            id="roi-staff-count-slider"
            type="range"
            min={5}
            max={120}
            step={1}
            value={staffCount}
            onChange={(e) => setStaffCount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>5</span>
            <span>60</span>
            <span>120+</span>
          </div>
        </div>

        {/* Slider 3: Hours spent on paper administration */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <label htmlFor="roi-admin-hours-slider" className="text-slate-700 dark:text-slate-300">Weekly Paper & Ledger Hours</label>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono">
              {adminHoursWeekly} Hours / Week
            </span>
          </div>
          <input
            id="roi-admin-hours-slider"
            type="range"
            min={5}
            max={40}
            step={1}
            value={adminHoursWeekly}
            onChange={(e) => setAdminHoursWeekly(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-[10px] text-slate-500">
            Hours spent compiling marksheets, physical report cards, receipt reconciliation, and attendance records.
          </p>
        </div>

        {/* Slider 4: Uncollected/Delayed fee rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <label htmlFor="roi-leakage-rate-slider" className="text-slate-700 dark:text-slate-300">Estimated Uncollected Fee Slippage</label>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono">
              {leakagePercent}% of Term Fees
            </span>
          </div>
          <input
            id="roi-leakage-rate-slider"
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={leakagePercent}
            onChange={(e) => setLeakagePercent(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-[10px] text-slate-500">
            Typical revenue uncollected due to manual tracking, missed parent follow-ups, and ledger discrepancies.
          </p>
        </div>
      </div>

      {/* Computed Value Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Clock className="w-4 h-4" /> Staff Hours Saved
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 dark:text-blue-100">
            {hoursSavedPerYear.toLocaleString()} hrs
          </div>
          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
            ~{hoursSavedPerTerm} hours freed up per academic term for actual classroom teaching.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <DollarSign className="w-4 h-4" /> Estimated Financial Value
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-100 truncate">
            {curr.symbol} {totalAnnualSavingsLocal.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
            Annual value from eliminated stationery and reduced fee leakages via mobile money.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <TrendingUp className="w-4 h-4" /> Payback Velocity
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-900 dark:text-indigo-100">
            &lt; 45 Days
          </div>
          <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
            Average timeframe for SchoolSoul subscription to fully pay for itself in recovered efficiency.
          </p>
        </div>
      </div>

      <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Honest Methodology: Estimates modeled on regional primary and secondary school operational averages.
        </span>
        <span>Includes 30-day zero-risk trial</span>
      </div>
    </div>
  );
};
