import mongoose, { Schema, Document } from 'mongoose';

export interface ISiftEarning {
  shiftNumber: number; // 1 to 10
  counterNumber: number; // 1 to 5
  operatorName: string;
  operatorId: string;
  // QR Sale
  qrSaleCount: number;
  qrSaleAmt: number;
  paidExitCount: number;
  paidExitAmt: number;
  qrRefundCount: number;
  qrRefundAmt: number;
  qrCancelCount: number;
  qrCancelAmt: number;
  // CSC (Smart Card)
  cscSaleSV2: number;
  cscSaleT1: number;
  cscSaleAmt: number;
  cscAddValueCount: number;
  cscAddValueAmt: number;
  ncmcAddValueCount: number;
  ncmcAddValueAmt: number;
  cscRefundCount: number;
  cscRefundAmt: number;
  // Surcharge
  surchargeCashCount: number;
  surchargeCashAmt: number;
  surchargeNcmcCount: number;
  surchargeNcmcAmt: number;
  // Cash Denominations
  denominations: {
    d500: number;
    d200: number;
    d100: number;
    d50: number;
    d20: number;
    d10: number;
    c10: number;
    c5: number;
    c2: number;
    c1: number;
  };
  totalAfcEarning: number;
  cashToBank: number;
}

export interface IDailyEarningSheet extends Document {
  stationName: string;
  date: string; // YYYY-MM-DD
  compiledBy: string;
  shifts: ISiftEarning[];
  previousDayCash: number;
  isCompiled: boolean;
}

const DailyEarningSchema: Schema = new Schema({
  stationName: { type: String, required: true, default: 'Sector 62 Noida' },
  date: { type: String, required: true },
  compiledBy: { type: String, required: true },
  shifts: [Object],
  previousDayCash: { type: Number, default: 0 },
  isCompiled: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.DailyEarning || mongoose.model<IDailyEarningSheet>('DailyEarning', DailyEarningSchema);