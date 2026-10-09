import React, { useState, useMemo } from 'react';

export interface RowData {
  id: number;
  tomNo: string;
  shiftNo: string;
  shiftTiming: string;
  operatorName: string;
  // Paper QR Sales
  sjtQty: number;
  sjtAmt: number;
  paidExitQty: number;
  paidExitAmt: number;
  qrRefundQty: number;
  qrRefundAmt: number;
  qrCancelQty: number;
  qrCancelAmt: number;
  // CSC Smart Card Sales
  sv2Qty: number;
  sv1Qty: number;
  cscAmt: number;
  addValueQty: number;
  addValueAmt: number;
  ncmcAddValueQty: number;
  ncmcAddValueAmt: number;
  cscRefundQty: number;
  cscRefundAmt: number;
  // Surcharges
  surchargeCashQty: number;
  surchargeCashAmt: number;
  surchargeNcmcQty: number;
  surchargeNcmcAmt: number;
  // Adjustments
  amtNotTaken: number;
  penaltyAmt: number;
}

// Predefined 10 Default Shifts (TOM 1 to TOM 5, 2 Shifts each)
const initial10Rows: RowData[] = Array.from({ length: 10 }, (_, i) => {
  const tomIndex = Math.floor(i / 2) + 1;
  const shiftIndex = (i % 2) + 1;
  return {
    id: i + 1,
    tomNo: `TOM ${tomIndex}`,
    shiftNo: `Shift ${shiftIndex}`,
    shiftTiming: shiftIndex === 1 ? '06:00 - 14:00' : '14:00 - 22:00',
    operatorName: '',
    sjtQty: 0, sjtAmt: 0,
    paidExitQty: 0, paidExitAmt: 0,
    qrRefundQty: 0, qrRefundAmt: 0,
    qrCancelQty: 0, qrCancelAmt: 0,
    sv2Qty: 0, sv1Qty: 0, cscAmt: 0,
    addValueQty: 0, addValueAmt: 0,
    ncmcAddValueQty: 0, ncmcAddValueAmt: 0,
    cscRefundQty: 0, cscRefundAmt: 0,
    surchargeCashQty: 0, surchargeCashAmt: 0,
    surchargeNcmcQty: 0, surchargeNcmcAmt: 0,
    amtNotTaken: 0, penaltyAmt: 0,
  };
});

// Dropdown Predefined Options
const TOM_OPTIONS = Array.from({ length: 10 }, (_, i) => `TOM ${i + 1}`);
const SHIFT_OPTIONS = ['Shift 1', 'Shift 2', 'Shift 3'];
const TIMING_OPTIONS = ['06:00 - 14:00', '14:00 - 22:00', '22:00 - 06:00'];

export default function EarningDashboard() {
  const [data, setData] = useState<RowData[]>(initial10Rows);
  const [stationName, setStationName] = useState('Sector 62 Noida');
  const [compilerName, setCompilerName] = useState('SAMEER MAHESHWARI');
  const [sheetDate, setSheetDate] = useState('2026-10-08');

  // State for Row Creator Dropdowns
  const [selectedTom, setSelectedTom] = useState('TOM 6');
  const [selectedShift, setSelectedShift] = useState('Shift 1');
  const [selectedTiming, setSelectedTiming] = useState('06:00 - 14:00');

  // Handle Cell Value Changes
  const handleCellChange = (
    index: number,
    field: keyof RowData,
    value: string
  ) => {
    const updated = [...data];
    const isNumberField = typeof initial10Rows[0][field] === 'number';
    updated[index] = {
      ...updated[index],
      [field]: isNumberField ? (value === '' ? 0 : Number(value) || 0) : value,
    };
    setData(updated);
  };

  // Add Dynamic Row Using Selected Dropdown Values
  const handleAddCustomRow = () => {
    const nextId = data.length > 0 ? Math.max(...data.map((r) => r.id)) + 1 : 1;

    const newRow: RowData = {
      id: nextId,
      tomNo: selectedTom,
      shiftNo: selectedShift,
      shiftTiming: selectedTiming,
      operatorName: '',
      sjtQty: 0, sjtAmt: 0,
      paidExitQty: 0, paidExitAmt: 0,
      qrRefundQty: 0, qrRefundAmt: 0,
      qrCancelQty: 0, qrCancelAmt: 0,
      sv2Qty: 0, sv1Qty: 0, cscAmt: 0,
      addValueQty: 0, addValueAmt: 0,
      ncmcAddValueQty: 0, ncmcAddValueAmt: 0,
      cscRefundQty: 0, cscRefundAmt: 0,
      surchargeCashQty: 0, surchargeCashAmt: 0,
      surchargeNcmcQty: 0, surchargeNcmcAmt: 0,
      amtNotTaken: 0, penaltyAmt: 0,
    };

    setData([...data, newRow]);
  };

  // Delete dynamic row (only allowed for rows beyond initial 10)
  const handleDeleteRow = (index: number) => {
    if (index < 10) {
      alert('Predefined initial 10 TOM shifts cannot be deleted.');
      return;
    }
    setData(data.filter((_, i) => i !== index));
  };

  // Calculate Total AFC Earning per row
  const getRowTotal = (r: RowData) => {
    const qrTotal = r.sjtAmt + r.paidExitAmt - r.qrRefundAmt - r.qrCancelAmt;
    const cscTotal = r.cscAmt + r.addValueAmt + r.ncmcAddValueAmt - r.cscRefundAmt;
    const surchargeTotal = r.surchargeCashAmt + r.surchargeNcmcAmt;
    return qrTotal + cscTotal + surchargeTotal + r.penaltyAmt - r.amtNotTaken;
  };

  // Summary Totals calculation across all rows
  const totals = useMemo(() => {
    return data.reduce(
      (acc, r) => {
        acc.sjtQty += r.sjtQty;
        acc.sjtAmt += r.sjtAmt;
        acc.paidExitQty += r.paidExitQty;
        acc.paidExitAmt += r.paidExitAmt;
        acc.qrRefundQty += r.qrRefundQty;
        acc.qrRefundAmt += r.qrRefundAmt;
        acc.qrCancelQty += r.qrCancelQty;
        acc.qrCancelAmt += r.qrCancelAmt;
        acc.sv2Qty += r.sv2Qty;
        acc.sv1Qty += r.sv1Qty;
        acc.cscAmt += r.cscAmt;
        acc.addValueQty += r.addValueQty;
        acc.addValueAmt += r.addValueAmt;
        acc.ncmcAddValueQty += r.ncmcAddValueQty;
        acc.ncmcAddValueAmt += r.ncmcAddValueAmt;
        acc.cscRefundQty += r.cscRefundQty;
        acc.cscRefundAmt += r.cscRefundAmt;
        acc.surchargeCashQty += r.surchargeCashQty;
        acc.surchargeCashAmt += r.surchargeCashAmt;
        acc.surchargeNcmcQty += r.surchargeNcmcQty;
        acc.surchargeNcmcAmt += r.surchargeNcmcAmt;
        acc.amtNotTaken += r.amtNotTaken;
        acc.penaltyAmt += r.penaltyAmt;
        acc.totalAfcEarning += getRowTotal(r);
        return acc;
      },
      {
        sjtQty: 0, sjtAmt: 0, paidExitQty: 0, paidExitAmt: 0,
        qrRefundQty: 0, qrRefundAmt: 0, qrCancelQty: 0, qrCancelAmt: 0,
        sv2Qty: 0, sv1Qty: 0, cscAmt: 0, addValueQty: 0, addValueAmt: 0,
        ncmcAddValueQty: 0, ncmcAddValueAmt: 0, cscRefundQty: 0, cscRefundAmt: 0,
        surchargeCashQty: 0, surchargeCashAmt: 0, surchargeNcmcQty: 0, surchargeNcmcAmt: 0,
        amtNotTaken: 0, penaltyAmt: 0, totalAfcEarning: 0,
      }
    );
  }, [data]);

  return (
    <div className="w-full bg-slate-100 p-2 font-sans text-xs">
      <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="bg-[#800000] text-white p-3 rounded-t-md shadow flex flex-wrap justify-between items-center gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold">Station Name:</span>
          <input
            type="text"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            className="bg-red-900 border border-red-400 px-2 py-0.5 rounded text-white font-semibold"
          />
        </div>
        <div className="text-center font-bold text-sm tracking-wide">
          DMRC STATION DAILY EARNING SHEET
        </div>
        <div className="flex items-center space-x-3">
          <div>
            <span className="font-bold">Date: </span>
            <input
              type="date"
              value={sheetDate}
              onChange={(e) => setSheetDate(e.target.value)}
              className="bg-red-900 border border-red-400 px-2 py-0.5 rounded text-white"
            />
          </div>
          <div>
            <span className="font-bold">Compiled By: </span>
            <input
              type="text"
              value={compilerName}
              onChange={(e) => setCompilerName(e.target.value)}
              className="bg-red-900 border border-red-400 px-2 py-0.5 rounded text-white font-semibold"
            />
          </div>
        </div>
      </div>

      {/* DROPDOWN ROW CREATOR BAR */}
      <div className="mb-2 bg-white p-2 border border-gray-300 shadow-sm rounded flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-700">Add Shift Row:</span>
          
          {/* TOM No Dropdown */}
          <select
            value={selectedTom}
            onChange={(e) => setSelectedTom(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-gray-50 font-semibold focus:outline-none focus:border-red-700"
          >
            {TOM_OPTIONS.map((tom) => (
              <option key={tom} value={tom}>{tom}</option>
            ))}
          </select>

          {/* Shift No Dropdown */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-gray-50 font-semibold focus:outline-none focus:border-red-700"
          >
            {SHIFT_OPTIONS.map((shift) => (
              <option key={shift} value={shift}>{shift}</option>
            ))}
          </select>

          {/* Shift Timing Dropdown */}
          <select
            value={selectedTiming}
            onChange={(e) => setSelectedTiming(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-gray-50 font-semibold focus:outline-none focus:border-red-700"
          >
            {TIMING_OPTIONS.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>

          <button
            onClick={handleAddCustomRow}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 rounded text-xs flex items-center gap-1 transition shadow-sm ml-1"
          >
            + Add Row
          </button>
        </div>

        <span className="text-gray-600 font-semibold">
          Total Shifts: {data.length} (10 Default + {data.length - 10} Custom)
        </span>
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-x-auto border border-gray-500 bg-white shadow-inner max-h-[75vh]">
        <table className="table-fixed border-collapse min-w-max w-max select-none">
          <thead>
            {/* Level 1 Header */}
            <tr className="bg-[#800000] text-white font-bold text-center border-b border-gray-600">
              <th colSpan={4} className="border border-gray-600 p-1 w-80">SHIFT METADATA</th>
              <th colSpan={8} className="border border-gray-600 p-1 bg-emerald-700">PAPER QR SALES</th>
              <th colSpan={9} className="border border-gray-600 p-1 bg-teal-700">CSC SMART CARD SALES</th>
              <th colSpan={4} className="border border-gray-600 p-1 bg-red-700">SURCHARGES</th>
              <th rowSpan={3} className="border border-gray-600 p-1 bg-amber-500 text-black w-24">TOTAL AFC EARNING</th>
              <th colSpan={2} className="border border-gray-600 p-1 bg-yellow-600 text-black">ADJUSTMENTS</th>
              <th rowSpan={3} className="border border-gray-600 p-1 bg-gray-400 w-10">ACT</th>
            </tr>

            {/* Level 2 Sub-Category Header */}
            <tr className="bg-gray-200 text-black text-[11px] font-semibold text-center border-b border-gray-600">
              <th className="border border-gray-400 p-1 w-16">TOM No</th>
              <th className="border border-gray-400 p-1 w-16">Shift No</th>
              <th className="border border-gray-400 p-1 w-24">Shift Timing</th>
              <th className="border border-gray-400 p-1 w-28">Operator Name</th>

              {/* QR */}
              <th colSpan={2} className="border border-gray-400 p-1 bg-emerald-100">Paper QR</th>
              <th colSpan={2} className="border border-gray-400 p-1 bg-emerald-100">Paid Exit</th>
              <th colSpan={2} className="border border-gray-400 p-1 bg-emerald-100">Refund</th>
              <th colSpan={2} className="border border-gray-400 p-1 bg-emerald-100">Cancel</th>

              {/* CSC */}
              <th colSpan={3} className="border border-gray-400 p-1 bg-teal-100">Card Issue (SV-2/1)</th>
              <th colSpan={2} className="border border-gray-400 p-1 bg-teal-100">Add Value</th>
              <th colSpan={2} className="border border-gray-400 p-1 bg-teal-100">NCMC Top-up</th>
              <th colSpan={2} className="border border-gray-400 p-1 bg-teal-100">Refund</th>

              {/* Surcharge */}
              <th colSpan={2} className="border border-gray-400 p-1 bg-red-100">Cash</th>
              <th colSpan={2} className="border border-gray-400 p-1 bg-red-100">NCMC</th>

              {/* Adjustments */}
              <th className="border border-gray-400 p-1 bg-yellow-100 w-20">Amt Not Taken</th>
              <th className="border border-gray-400 p-1 bg-yellow-100 w-20">Penalty</th>
            </tr>

            {/* Level 3 Metric Headers */}
            <tr className="bg-gray-100 text-black text-[10px] font-semibold text-center border-b border-gray-600">
              <th colSpan={4} className="border border-gray-400 p-0.5">Details</th>
              {/* QR */}
              <th className="border border-gray-400 w-12 p-0.5">SJT Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              <th className="border border-gray-400 w-12 p-0.5">Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              <th className="border border-gray-400 w-12 p-0.5">Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              <th className="border border-gray-400 w-12 p-0.5">Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              {/* CSC */}
              <th className="border border-gray-400 w-12 p-0.5">SV-2 Qty</th>
              <th className="border border-gray-400 w-12 p-0.5">SV-1 Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              <th className="border border-gray-400 w-12 p-0.5">Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              <th className="border border-gray-400 w-12 p-0.5">Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              <th className="border border-gray-400 w-12 p-0.5">Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              {/* Surcharge */}
              <th className="border border-gray-400 w-12 p-0.5">Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              <th className="border border-gray-400 w-12 p-0.5">Qty</th>
              <th className="border border-gray-400 w-16 p-0.5">Amt</th>
              {/* Adjustments */}
              <th className="border border-gray-400 w-20 p-0.5">Amt</th>
              <th className="border border-gray-400 w-20 p-0.5">Amt</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => {
              const rowTotal = getRowTotal(row);
              return (
                <tr key={row.id} className="hover:bg-blue-50 border-b border-gray-300">
                  {/* Inline Editable or Displayed TOM Metadata */}
                  <td className="border border-gray-400 p-1 text-center font-bold bg-gray-100">{row.tomNo}</td>
                  <td className="border border-gray-400 p-1 text-center font-semibold bg-gray-100">{row.shiftNo}</td>
                  <td className="border border-gray-400 p-1 text-center font-mono text-[11px] bg-gray-100">{row.shiftTiming}</td>
                  <td className="border border-gray-400 p-0">
                    <input
                      type="text"
                      placeholder="Operator Name"
                      value={row.operatorName}
                      onChange={(e) => handleCellChange(idx, 'operatorName', e.target.value)}
                      className="w-full h-7 px-1 text-left bg-transparent focus:bg-yellow-100 focus:outline-none"
                    />
                  </td>

                  {/* QR Inputs */}
                  <InputCell value={row.sjtQty} onChange={(v) => handleCellChange(idx, 'sjtQty', v)} width="w-12" />
                  <InputCell value={row.sjtAmt} onChange={(v) => handleCellChange(idx, 'sjtAmt', v)} width="w-16" isAmount />
                  <InputCell value={row.paidExitQty} onChange={(v) => handleCellChange(idx, 'paidExitQty', v)} width="w-12" />
                  <InputCell value={row.paidExitAmt} onChange={(v) => handleCellChange(idx, 'paidExitAmt', v)} width="w-16" isAmount />
                  <InputCell value={row.qrRefundQty} onChange={(v) => handleCellChange(idx, 'qrRefundQty', v)} width="w-12" />
                  <InputCell value={row.qrRefundAmt} onChange={(v) => handleCellChange(idx, 'qrRefundAmt', v)} width="w-16" isAmount />
                  <InputCell value={row.qrCancelQty} onChange={(v) => handleCellChange(idx, 'qrCancelQty', v)} width="w-12" />
                  <InputCell value={row.qrCancelAmt} onChange={(v) => handleCellChange(idx, 'qrCancelAmt', v)} width="w-16" isAmount />

                  {/* CSC Inputs */}
                  <InputCell value={row.sv2Qty} onChange={(v) => handleCellChange(idx, 'sv2Qty', v)} width="w-12" />
                  <InputCell value={row.sv1Qty} onChange={(v) => handleCellChange(idx, 'sv1Qty', v)} width="w-12" />
                  <InputCell value={row.cscAmt} onChange={(v) => handleCellChange(idx, 'cscAmt', v)} width="w-16" isAmount />
                  <InputCell value={row.addValueQty} onChange={(v) => handleCellChange(idx, 'addValueQty', v)} width="w-12" />
                  <InputCell value={row.addValueAmt} onChange={(v) => handleCellChange(idx, 'addValueAmt', v)} width="w-16" isAmount />
                  <InputCell value={row.ncmcAddValueQty} onChange={(v) => handleCellChange(idx, 'ncmcAddValueQty', v)} width="w-12" />
                  <InputCell value={row.ncmcAddValueAmt} onChange={(v) => handleCellChange(idx, 'ncmcAddValueAmt', v)} width="w-16" isAmount />
                  <InputCell value={row.cscRefundQty} onChange={(v) => handleCellChange(idx, 'cscRefundQty', v)} width="w-12" />
                  <InputCell value={row.cscRefundAmt} onChange={(v) => handleCellChange(idx, 'cscRefundAmt', v)} width="w-16" isAmount />

                  {/* Surcharge Inputs */}
                  <InputCell value={row.surchargeCashQty} onChange={(v) => handleCellChange(idx, 'surchargeCashQty', v)} width="w-12" />
                  <InputCell value={row.surchargeCashAmt} onChange={(v) => handleCellChange(idx, 'surchargeCashAmt', v)} width="w-16" isAmount />
                  <InputCell value={row.surchargeNcmcQty} onChange={(v) => handleCellChange(idx, 'surchargeNcmcQty', v)} width="w-12" />
                  <InputCell value={row.surchargeNcmcAmt} onChange={(v) => handleCellChange(idx, 'surchargeNcmcAmt', v)} width="w-16" isAmount />

                  {/* Total AFC Earning */}
                  <td className="border border-gray-400 p-1 text-right font-bold text-amber-900 bg-amber-100 font-mono w-24">
                    ₹{rowTotal.toLocaleString('en-IN')}
                  </td>

                  {/* Adjustments */}
                  <InputCell value={row.amtNotTaken} onChange={(v) => handleCellChange(idx, 'amtNotTaken', v)} width="w-20" isAmount />
                  <InputCell value={row.penaltyAmt} onChange={(v) => handleCellChange(idx, 'penaltyAmt', v)} width="w-20" isAmount />

                  {/* Delete Action (Only for dynamic rows) */}
                  <td className="border border-gray-400 p-0 text-center bg-gray-50">
                    {idx >= 10 ? (
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="text-red-600 font-bold hover:text-red-800 px-1"
                        title="Delete custom row"
                      >
                        ×
                      </button>
                    ) : (
                      <span className="text-gray-300 select-none">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* TOTALS FOOTER ROW */}
          <tfoot>
            <tr className="bg-amber-300 font-bold border-t-2 border-amber-600 text-gray-900 text-right">
              <td colSpan={4} className="border border-gray-400 p-1 text-center bg-amber-400 font-bold">TOTAL</td>
              <TotalCell value={totals.sjtQty} width="w-12" />
              <TotalCell value={totals.sjtAmt} width="w-16" isAmount />
              <TotalCell value={totals.paidExitQty} width="w-12" />
              <TotalCell value={totals.paidExitAmt} width="w-16" isAmount />
              <TotalCell value={totals.qrRefundQty} width="w-12" />
              <TotalCell value={totals.qrRefundAmt} width="w-16" isAmount />
              <TotalCell value={totals.qrCancelQty} width="w-12" />
              <TotalCell value={totals.qrCancelAmt} width="w-16" isAmount />

              <TotalCell value={totals.sv2Qty} width="w-12" />
              <TotalCell value={totals.sv1Qty} width="w-12" />
              <TotalCell value={totals.cscAmt} width="w-16" isAmount />
              <TotalCell value={totals.addValueQty} width="w-12" />
              <TotalCell value={totals.addValueAmt} width="w-16" isAmount />
              <TotalCell value={totals.ncmcAddValueQty} width="w-12" />
              <TotalCell value={totals.ncmcAddValueAmt} width="w-16" isAmount />
              <TotalCell value={totals.cscRefundQty} width="w-12" />
              <TotalCell value={totals.cscRefundAmt} width="w-16" isAmount />

              <TotalCell value={totals.surchargeCashQty} width="w-12" />
              <TotalCell value={totals.surchargeCashAmt} width="w-16" isAmount />
              <TotalCell value={totals.surchargeNcmcQty} width="w-12" />
              <TotalCell value={totals.surchargeNcmcAmt} width="w-16" isAmount />

              <td className="border border-gray-400 p-1 font-bold text-red-900 bg-amber-400 font-mono text-sm w-24">
                ₹{totals.totalAfcEarning.toLocaleString('en-IN')}
              </td>

              <TotalCell value={totals.amtNotTaken} width="w-20" isAmount />
              <TotalCell value={totals.penaltyAmt} width="w-20" isAmount />
              <td className="border border-gray-400 p-1 bg-amber-400"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// Clean Input Cell Component (No Spinner Arrows)
function InputCell({
  value,
  onChange,
  width,
  isAmount,
}: {
  value: number;
  onChange: (val: string) => void;
  width: string;
  isAmount?: boolean;
}) {
  return (
    <td className={`border border-gray-400 p-0 ${width} bg-white`}>
      <input
        type="number"
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-7 px-1 text-right text-gray-900 border-none bg-transparent focus:bg-yellow-100 focus:outline-none font-mono text-xs"
      />
    </td>
  );
}

// Total Summary Cell
function TotalCell({ value, width, isAmount }: { value: number; width: string; isAmount?: boolean }) {
  return (
    <td className={`border border-gray-400 p-1 font-mono text-xs ${width}`}>
      {isAmount ? `₹${value.toLocaleString('en-IN')}` : value}
    </td>
  );
}