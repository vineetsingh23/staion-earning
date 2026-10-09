import mongoose, { Schema, Document } from 'mongoose';

export interface IDenomination {
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
}

export interface ISiftEarning {
  shiftNumber: number;
  counterNumber: number;
  operatorName: string;
  operatorId: string;
  shiftTiming: string;
  // QR Sale
  qrSaleCountTom: number;
  qrSaleAmtTom: number;
  qrSaleCountTvm: number;
  qrSaleAmtTvm: number;
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
  cscAddValueCountTom: number;
  cscAddValueAmtTom: number;
  cscAddValueCountTvm: number;
  cscAddValueAmtTvm: number;
  ncmcAddValueCountTom: number;
  ncmcAddValueAmtTom: number;
  ncmcAddValueCountTvm: number;
  ncmcAddValueAmtTvm: number;
  cscRefundCount: number;
  cscRefundAmt: number;
  // Surcharge
  surchargeCashCount: number;
  surchargeCashAmt: number;
  surchargePurseCount: number;
  surchargePurseAmt: number;
  surchargeNcmcCount: number;
  surchargeNcmcAmt: number;
  surchargeNcmcPurseCount: number;
  surchargeNcmcPurseAmt: number;
  // Misc Earning Data
  eibByTom: number;
  mrOkCscCount: number;
  mrOkCscAmt: number;
  mrOkUrcCount: number;
  mrOkUrcAmt: number;
  mrOkUrcTourCount: number;
  mrOkUrcTourAmt: number;
  penaltyCashCount: number;
  penaltyCashAmt: number;
  penaltyHhtCount: number;
  penaltyHhtAmt: number;
  penaltyPurseCount: number;
  penaltyPurseAmt: number;
  miscEarning: number;
  // Cashless Earning Data
  hdfcPos: number;
  upiTom: number;
  upiTvm: number;
  outSourceEarning: number;
  // Outstanding Data
  afcOs: number;
  miscOs: number;
  tvmOs: number;
  afcOsPaid: number;
  miscOsPaid: number;
  tvmOsPaid: number;
  // Denominations & Totals
  denominations: IDenomination;
  totalAfcEarning: number;
  totalCashDepositedByOperator: number;
  totalEarning: number;
}

export interface IDailyEarningSheet extends Document {
  stationName: string;
  date: string; // YYYY-MM-DD
  compiledBy: string;
  shifts: ISiftEarning[];
  previousDayCash: number;
  todayCashOnHand: number;
  cashToBank: number;
  cashInPossessionDenominations: IDenomination;
  cashToBankDenominations: IDenomination;
  isCompiled: boolean;
}

const DenominationSchema = new Schema({
  d500: { type: Number, default: 0 },
  d200: { type: Number, default: 0 },
  d100: { type: Number, default: 0 },
  d50: { type: Number, default: 0 },
  d20: { type: Number, default: 0 },
  d10: { type: Number, default: 0 },
  c10: { type: Number, default: 0 },
  c5: { type: Number, default: 0 },
  c2: { type: Number, default: 0 },
  c1: { type: Number, default: 0 },
}, { _id: false });

const DailyEarningSchema: Schema = new Schema(
  {
    stationName: { type: String, required: true, default: 'Sector 62 Noida' },
    date: { type: String, required: true, unique: true },
    compiledBy: { type: String, required: true },
    shifts: [Object],
    previousDayCash: { type: Number, default: 0 },
    todayCashOnHand: { type: Number, default: 0 },
    cashToBank: { type: Number, default: 0 },
    cashInPossessionDenominations: { type: DenominationSchema, default: () => ({}) },
    cashToBankDenominations: { type: DenominationSchema, default: () => ({}) },
    isCompiled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.DailyEarning ||
  mongoose.model<IDailyEarningSheet>('DailyEarning', DailyEarningSchema);