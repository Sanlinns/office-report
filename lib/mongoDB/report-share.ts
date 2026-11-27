import { createHash } from "node:crypto";
import { Schema, model, models, type Model } from "mongoose";
import { connectToDB } from "./mongoDB";

export const reportSections = ["sales", "inventory", "finance", "budget"] as const;
export type ReportSection = (typeof reportSections)[number];
export const reportSectionLabels: Record<ReportSection, string> = {
  sales: "ပစ္စည်းအလိုက် ရောင်းအား",
  inventory: "ကုန်ပစ္စည်းလက်ကျန်",
  finance: "ဝင်ငွေ၊ ထွက်ငွေနှင့် ငွေရလဒ်",
  budget: "ကုန်ဝယ်ရန်ပုံငွေ",
};

interface ReportShareRecord {
  ownerId: string;
  tokenHash: string;
  sections: ReportSection[];
  expiresAt: Date;
  createdAt: Date;
}

const schema = new Schema<ReportShareRecord>({
  ownerId: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  sections: [{ type: String, enum: reportSections }],
  expiresAt: { type: Date, required: true, expires: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const ReportShare = (models.ReportShare as Model<ReportShareRecord> | undefined)
  ?? model<ReportShareRecord>("ReportShare", schema);

export function hashShareToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function readReportShare(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  await connectToDB();
  return ReportShare.findOne({
    tokenHash: hashShareToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();
}