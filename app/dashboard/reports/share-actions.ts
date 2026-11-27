"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import { deriveShareToken, hashShareToken, ReportShare, reportSections } from "@/lib/mongoDB/report-share";

async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  if (!session?.user.id) redirect("/sign-in");
  await connectToDB();
  return session.user.id;
}

export async function createReportShare(_previous: { path?: string; error?: string }, form: FormData): Promise<{ path?: string; error?: string }> {
  const ownerId = await requireOwner();
  const requested = form.getAll("section");
  const sections = reportSections.filter((section) => requested.includes(section));
  const days = Number(form.get("days"));
  if (!sections.length || ![1, 7, 30].includes(days)) return { error: "မျှဝေမည့်စာရင်းနဲ့ သက်တမ်းကို ရွေးပါ။" };
  const id = new Types.ObjectId();
  const token = deriveShareToken(id.toHexString());
  if (!token) return { error: "Report Link ဖန်တီးရန် server secret သတ်မှတ်ပါ။" };
  await ReportShare.create({
    _id: id, ownerId, sections, tokenHash: hashShareToken(token),
    expiresAt: new Date(Date.now() + days * 86_400_000),
  });
  revalidatePath("/dashboard/reports");
  return { path: `/share/reports/${token}` };
}

export async function revokeReportShare(form: FormData) {
  const ownerId = await requireOwner();
  const id = form.get("id");
  if (typeof id === "string" && /^[0-9a-f]{24}$/i.test(id)) {
    await ReportShare.deleteOne({ ownerId, _id: id });
    revalidatePath("/dashboard/reports");
  }
}
