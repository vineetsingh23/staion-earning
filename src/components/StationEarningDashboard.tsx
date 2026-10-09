import React, { useState, useEffect, useMemo } from 'react';
import type { ISiftEarning, IDenomination } from '../models/DailyEarning';

const emptyDenominations = (): IDenomination => ({
  d500: 0, d200: 0, d100: 0, d50: 0, d20: 0, d10: 0,
  c10: 0, c5: 0, c2: 0, c1: 0,
});

const createDefaultShiftRow = (counter: number, shift: number): ISiftEarning => ({
  counterNumber: counter,
  shiftNumber: shift,
  shiftTiming: shift === 1 ? '06:00 - 14:00' : '14:00 - 22:00',
  operatorName: '', operatorId: '',
  qrSaleCountTom: 0, qrSaleAmtTom: 0, qrSaleCountTvm: 0, qrSaleAmtTvm: 0,
  paidExitCount: 0, paidExitAmt: 0, qrRefundCount: 0, qrRefundAmt: 0,
  qrCancelCount: 0, qrCancelAmt: 0,
  cscSaleSV2: 0, cscSaleT1: 0, cscSaleAmt: 0,
  cscAddValueCountTom: 0, cscAddValueAmtTom: 0, cscAddValueCountTvm: 0, cscAddValueAmtTvm: 0,
  ncmcAddValueCountTom: 0, ncmcAddValueAmtTom: 0, ncmcAddValueCountTvm: 0, ncmcAddValueAmtTvm: 0,
  cscRefundCount: 0, cscRefundAmt: 0,
  surchargeCashCount: 0, surchargeCashAmt: 0, surchargePurseCount: 0, surchargePurseAmt: 0,
  surchargeNcmcCount: 0, surchargeNcmcAmt: 0, surchargeNcmcPurseCount: 0, surchargeNcmcPurseAmt: 0,
  eibByTom: 0, mrOkCscCount: 0, mrOkCscAmt: 0, mrOkUrcCount: 0, mrOkUrcAmt: 0,
  mrOkUrcTourCount: 0, mrOkUrcTourAmt: 0, penaltyCashCount: 0, penaltyCashAmt: 0,
  penaltyHhtCount: 0, penaltyHhtAmt: 0, penaltyPurseCount: 0, penaltyPurseAmt: 0, miscEarning: 0,
  hdfcPos: 0, upiTom: 0, upiTvm: 0, outSourceEarning: 0,
  afcOs: 0, miscOs: 0, tvmOs: 0, afcOsPaid: 0, miscOsPaid: 0, tvmOsPaid: 0,
  denominations: emptyDenominations(),
  totalAfcEarning: 0, totalCashDepositedByOperator: 0, totalEarning: 0,
});

// Initial 10 Predefined Rows
const createInitial10Shifts = (): ISiftEarning[] => {
  const shifts: ISiftEarning[] = [];
  for (let c = 1; c <= 5; c++) {
    shifts.push(createDefaultShiftRow(c, 1));
    shifts.push(createDefaultShiftRow(c, 2));
  }
  return shifts;
};

const calcDenomTotal = (d: IDenomination) =>
  d.d500 * 500 + d.d200 * 200 + d.d100 * 100 + d.d50 * 50 + d.d20 * 20 +
  d.d10 * 10 + d.c10 * 10 + d.c5 * 5 + d.c2 * 2 + d.c1 * 1;

export default function EarningDashboard() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [stationName, setStationName] = useState('Sector 62 Noida');
  const [compilerName, setCompilerName] = useState('SAMEER MAHESHWARI (11744)');
  const [shifts, setShifts] = useState<ISiftEarning[]>(createInitial10Shifts());

  // Cash Management
  const [previousDayCash, setPreviousDayCash] = useState<number>(207902);
  const [cashInPossession, setCashInPossession] = useState<IDenomination>(emptyDenominations());
  const [cashToBank, setCashToBank] = useState<IDenomination>(emptyDenominations());

  // Dropdown Row Add state
  const [selTom, setSelTom] = useState('6');
  const [selShift, setSelShift] = useState('1');
  const [selTiming, setSelTiming] = useState('06:00 - 14:00');

  // Load Earning Data based on Selected Date
  useEffect(() => {
    const fetchEarningData = async () => {
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate > today) {
        // Future Date: Render clean blank sheet
        setShifts(createInitial10Shifts());
        setCashInPossession(emptyDenominations());
        setCashToBank(emptyDenominations());
        return;
      }

      try {
        const res = await fetch(`/api/earning?date=${selectedDate}`);
        if (res.ok) {
          const doc = await res.json();
          if (doc) {
            setShifts(doc.shifts || createInitial10Shifts());
            setPreviousDayCash(doc.previousDayCash || 0);
            setCashInPossession(doc.cashInPossessionDenominations || emptyDenominations());
            setCashToBank(doc.cashToBankDenominations || emptyDenominations());
            return;
          }
        }
      } catch (err) {
        console.log('No saved data found for date, resetting sheet');
      }
      setShifts(createInitial10Shifts());
      setCashInPossession(emptyDenominations());
      setCashToBank(emptyDenominations());
    };

    fetchEarningData();
  }, [selectedDate]);

  // Handle Input Changes inside Shift Grid
  const handleShiftChange = (index: number, field: keyof ISiftEarning, value: any) => {
    const updated = [...shifts];
    const isNum = typeof createDefaultShiftRow(1, 1)[field] === 'number';
    updated[index] = {
      ...updated[index],
      [field]: isNum ? (value === '' ? 0 : Number(value) || 0) : value,
    };
    setShifts(updated);
  };

  // Add Dynamic Row via Dropdown Selection
  const handleAddCustomRow = () => {
    const newRow: ISiftEarning = createDefaultShiftRow(Number(selTom), Number(selShift));
    newRow.shiftTiming = selTiming;
    setShifts([...shifts, newRow]);
  };

  // Row AFC Total Calculation
  const getRowAfcTotal = (r: ISiftEarning) => {
    const qrAmt = r.qrSaleAmtTom + r.qrSaleAmtTvm + r.paidExitAmt - r.qrRefundAmt - r.qrCancelAmt;
    const cscAmt = r.cscSaleAmt + r.cscAddValueAmtTom + r.cscAddValueAmtTvm +
      r.ncmcAddValueAmtTom + r.ncmcAddValueAmtTvm - r.cscRefundAmt;
    const surchargeAmt = r.surchargeCashAmt + r.surchargePurseAmt + r.surchargeNcmcAmt + r.surchargeNcmcPurseAmt;
    return qrAmt + cscAmt + surchargeAmt;
  };

  // Column Totals
  const totals = useMemo(() => {
    return shifts.reduce(
      (acc, r) => {
        const afc = getRowAfcTotal(r);
        acc.totalAfc += afc;
        acc.totalMisc += r.miscEarning;
        acc.totalCashless += r.hdfcPos + r.upiTom + r.upiTvm + r.outSourceEarning;
        return acc;
      },
      { totalAfc: 0, totalMisc: 0, totalCashless: 0 }
    );
  }, [shifts]);

  const totalPossessionCash = calcDenomTotal(cashInPossession);
  const totalBankCash = calcDenomTotal(cashToBank);

  return (
    <div className="w-full bg-slate-100 p-2 font-sans text-xs">
      <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type='number'] { -moz-appearance: textfield; }
      `}</style>

      {/* HEADER BAR */}
      <div className="bg-[#800000] text-white p-3 rounded-t-md flex flex-wrap justify-between items-center gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold">Station:</span>
          <input
            type="text"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            className="bg-red-900 border border-red-400 px-2 py-0.5 rounded text-white font-semibold"
          />
        </div>

        <div className="text-center font-bold text-sm tracking-wide">
          DMRC DAILY STATION EARNING REGISTER
        </div>

        <div className="flex items-center space-x-3">
          <div>
            <span className="font-bold">Date: </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-red-900 border border-red-400 px-2 py-0.5 rounded text-white font-semibold"
            />
          </div>
          <div>
            <span className="font-bold">Compiler: </span>
            <input
              type="text"
              value={compilerName}
              onChange={(e) => setCompilerName(e.target.value)}
              className="bg-red-900 border border-red-400 px-2 py-0.5 rounded text-white"
            />
          </div>
        </div>
      </div>

      {/* DROPDOWN ROW ADD BAR */}
      <div className="mb-2 bg-white p-2 border border-gray-300 rounded shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700">Add Shift Row:</span>
          <select value={selTom} onChange={(e) => setSelTom(e.target.value)} className="border p-1 rounded font-semibold">
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>TOM {i + 1}</option>
            ))}
          </select>

          <select value={selShift} onChange={(e) => setSelShift(e.target.value)} className="border p-1 rounded font-semibold">
            <option value="1">Shift 1</option>
            <option value="2">Shift 2</option>
            <option value="3">Shift 3</option>
          </select>

          <select value={selTiming} onChange={(e) => setSelTiming(e.target.value)} className="border p-1 rounded font-semibold">
            <option value="06:00 - 14:00">06:00 - 14:00</option>
            <option value="14:00 - 22:00">14:00 - 22:00</option>
            <option value="22:00 - 06:00">22:00 - 06:00</option>
          </select>

          <button
            onClick={handleAddCustomRow}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 rounded text-xs transition"
          >
            + Add Row
          </button>
        </div>

        <div className="font-bold text-gray-600">
          Total Shifts: {shifts.length}
        </div>
      </div>

      {/* FIXED METRIC TABLE */}
      <div className="overflow-x-auto border border-gray-500 bg-white shadow max-h-[60vh] mb-4">
        <table className="table-fixed border-collapse min-w-max w-max">
          <thead>
            <tr className="bg-[#800000] text-white font-bold text-center">
              <th colSpan={4} className="border border-gray-600 p-1 w-80">COUNTER METADATA</th>
              <th colSpan={6} className="border border-gray-600 p-1 bg-emerald-700">PAPER QR SALES</th>
              <th colSpan={8} className="border border-gray-600 p-1 bg-teal-700">CSC SMART CARD SALES</th>
              <th colSpan={4} className="border border-gray-600 p-1 bg-red-700">SURCHARGES</th>
              <th colSpan={4} className="border border-gray-600 p-1 bg-purple-700">CASHLESS EARNING</th>
              <th rowSpan={2} className="border border-gray-600 p-1 bg-amber-500 text-black w-24">TOTAL AFC EARNING</th>
            </tr>
            <tr className="bg-gray-200 text-black text-[10px] font-semibold text-center border-b border-gray-500">
              <th className="border p-1 w-14">TOM</th>
              <th className="border p-1 w-14">Shift</th>
              <th className="border p-1 w-24">Timing</th>
              <th className="border p-1 w-28">Operator Name</th>

              <th className="border p-1 bg-emerald-100 w-16">TOM QR</th>
              <th className="border p-1 bg-emerald-100 w-16">TVM QR</th>
              <th className="border p-1 bg-emerald-100 w-16">Paid Exit</th>
              <th className="border p-1 bg-emerald-100 w-16">Refund</th>
              <th className="border p-1 bg-emerald-100 w-16">Cancel</th>
              <th className="border p-1 bg-emerald-100 w-16">QR Amt</th>

              <th className="border p-1 bg-teal-100 w-14">SV-2</th>
              <th className="border p-1 bg-teal-100 w-14">T-1</th>
              <th className="border p-1 bg-teal-100 w-16">Add TOM</th>
              <th className="border p-1 bg-teal-100 w-16">Add TVM</th>
              <th className="border p-1 bg-teal-100 w-16">NCMC TOM</th>
              <th className="border p-1 bg-teal-100 w-16">NCMC TVM</th>
              <th className="border p-1 bg-teal-100 w-16">Refund</th>
              <th className="border p-1 bg-teal-100 w-16">CSC Amt</th>

              <th className="border p-1 bg-red-100 w-16">Cash</th>
              <th className="border p-1 bg-red-100 w-16">Purse</th>
              <th className="border p-1 bg-red-100 w-16">NCMC</th>
              <th className="border p-1 bg-red-100 w-16">NCMC Purse</th>

              <th className="border p-1 bg-purple-100 w-16">HDFC POS</th>
              <th className="border p-1 bg-purple-100 w-16">UPI TOM</th>
              <th className="border p-1 bg-purple-100 w-16">UPI TVM</th>
              <th className="border p-1 bg-purple-100 w-16">Outsource</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((row, idx) => {
              const rowAfc = getRowAfcTotal(row);
              return (
                <tr key={idx} className="hover:bg-blue-50">
                  <td className="border p-1 text-center font-bold bg-gray-50">TOM {row.counterNumber}</td>
                  <td className="border p-1 text-center font-semibold bg-gray-50">Shift {row.shiftNumber}</td>
                  <td className="border p-1 text-center font-mono text-[10px] bg-gray-50">{row.shiftTiming}</td>
                  <td className="border p-0">
                    <input
                      type="text"
                      placeholder="Operator"
                      value={row.operatorName}
                      onChange={(e) => handleShiftChange(idx, 'operatorName', e.target.value)}
                      className="w-full h-7 px-1 text-left bg-transparent focus:outline-none"
                    />
                  </td>

                  <Cell value={row.qrSaleAmtTom} onChange={(v) => handleShiftChange(idx, 'qrSaleAmtTom', v)} width="w-16" />
                  <Cell value={row.qrSaleAmtTvm} onChange={(v) => handleShiftChange(idx, 'qrSaleAmtTvm', v)} width="w-16" />
                  <Cell value={row.paidExitAmt} onChange={(v) => handleShiftChange(idx, 'paidExitAmt', v)} width="w-16" />
                  <Cell value={row.qrRefundAmt} onChange={(v) => handleShiftChange(idx, 'qrRefundAmt', v)} width="w-16" />
                  <Cell value={row.qrCancelAmt} onChange={(v) => handleShiftChange(idx, 'qrCancelAmt', v)} width="w-16" />
                  <td className="border p-1 text-right font-mono bg-emerald-50">
                    {(row.qrSaleAmtTom + row.qrSaleAmtTvm + row.paidExitAmt - row.qrRefundAmt - row.qrCancelAmt).toFixed(2)}
                  </td>

                  <Cell value={row.cscSaleSV2} onChange={(v) => handleShiftChange(idx, 'cscSaleSV2', v)} width="w-14" />
                  <Cell value={row.cscSaleT1} onChange={(v) => handleShiftChange(idx, 'cscSaleT1', v)} width="w-14" />
                  <Cell value={row.cscAddValueAmtTom} onChange={(v) => handleShiftChange(idx, 'cscAddValueAmtTom', v)} width="w-16" />
                  <Cell value={row.cscAddValueAmtTvm} onChange={(v) => handleShiftChange(idx, 'cscAddValueAmtTvm', v)} width="w-16" />
                  <Cell value={row.ncmcAddValueAmtTom} onChange={(v) => handleShiftChange(idx, 'ncmcAddValueAmtTom', v)} width="w-16" />
                  <Cell value={row.ncmcAddValueAmtTvm} onChange={(v) => handleShiftChange(idx, 'ncmcAddValueAmtTvm', v)} width="w-16" />
                  <Cell value={row.cscRefundAmt} onChange={(v) => handleShiftChange(idx, 'cscRefundAmt', v)} width="w-16" />
                  <td className="border p-1 text-right font-mono bg-teal-50">
                    {(row.cscSaleAmt + row.cscAddValueAmtTom + row.cscAddValueAmtTvm + row.ncmcAddValueAmtTom + row.ncmcAddValueAmtTvm - row.cscRefundAmt).toFixed(2)}
                  </td>

                  <Cell value={row.surchargeCashAmt} onChange={(v) => handleShiftChange(idx, 'surchargeCashAmt', v)} width="w-16" />
                  <Cell value={row.surchargePurseAmt} onChange={(v) => handleShiftChange(idx, 'surchargePurseAmt', v)} width="w-16" />
                  <Cell value={row.surchargeNcmcAmt} onChange={(v) => handleShiftChange(idx, 'surchargeNcmcAmt', v)} width="w-16" />
                  <Cell value={row.surchargeNcmcPurseAmt} onChange={(v) => handleShiftChange(idx, 'surchargeNcmcPurseAmt', v)} width="w-16" />

                  <Cell value={row.hdfcPos} onChange={(v) => handleShiftChange(idx, 'hdfcPos', v)} width="w-16" />
                  <Cell value={row.upiTom} onChange={(v) => handleShiftChange(idx, 'upiTom', v)} width="w-16" />
                  <Cell value={row.upiTvm} onChange={(v) => handleShiftChange(idx, 'upiTvm', v)} width="w-16" />
                  <Cell value={row.outSourceEarning} onChange={(v) => handleShiftChange(idx, 'outSourceEarning', v)} width="w-16" />

                  <td className="border p-1 text-right font-bold text-amber-900 bg-amber-200 font-mono w-24">
                    ₹{rowAfc.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-amber-300 font-bold text-gray-900">
              <td colSpan={26} className="border p-2 text-right">TOTAL STATION AFC EARNING:</td>
              <td className="border p-2 text-right text-sm text-red-900 font-mono">
                ₹{totals.totalAfc.toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* CASH IN POSSESSION & CASH TO BANK DENOMINATION PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash In Possession */}
        <DenominationBox
          title="CASH IN POSSESSION (CURRENT MANUAL ENTRY)"
          denom={cashInPossession}
          setDenom={setCashInPossession}
          total={totalPossessionCash}
          bgColor="bg-emerald-50 border-emerald-400 text-emerald-900"
        />

        {/* Cash To Bank */}
        <DenominationBox
          title="CASH TO BANK (DEPOSITED AT END OF DAY)"
          denom={cashToBank}
          setDenom={setCashToBank}
          total={totalBankCash}
          bgColor="bg-blue-50 border-blue-400 text-blue-900"
        />
      </div>
    </div>
  );
}

function Cell({ value, onChange, width }: { value: number; onChange: (v: string) => void; width: string }) {
  return (
    <td className={`border p-0 ${width} bg-white`}>
      <input
        type="number"
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-7 px-1 text-right text-gray-900 bg-transparent focus:bg-yellow-100 focus:outline-none font-mono text-xs"
      />
    </td>
  );
}

function DenominationBox({ title, denom, setDenom, total, bgColor }: any) {
  const notes = [
    { label: '₹500', key: 'd500' }, { label: '₹200', key: 'd200' },
    { label: '₹100', key: 'd100' }, { label: '₹50', key: 'd50' },
    { label: '₹20', key: 'd20' },   { label: '₹10', key: 'd10' },
    { label: '₹10 Coin', key: 'c10' }, { label: '₹5 Coin', key: 'c5' },
    { label: '₹2 Coin', key: 'c2' },   { label: '₹1 Coin', key: 'c1' },
  ];

  return (
    <div className={`p-3 rounded border shadow-sm ${bgColor}`}>
      <h3 className="font-bold border-b pb-1 mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {notes.map((n) => (
          <div key={n.key} className="flex justify-between items-center bg-white p-1 rounded border">
            <span className="font-semibold">{n.label}:</span>
            <input
              type="number"
              placeholder="0"
              value={denom[n.key] || ''}
              onChange={(e) => setDenom({ ...denom, [n.key]: Number(e.target.value) || 0 })}
              className="w-16 text-right border rounded px-1 font-mono"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 text-right font-bold text-sm">
        Total Cash Amount: ₹{total.toLocaleString('en-IN')}
      </div>
    </div>
  );
}