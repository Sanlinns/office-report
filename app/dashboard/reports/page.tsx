
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import OfficeReports from "@/components/dashboard/chart/OfficeReports";
// import { auth } from "@/lib/auth";
// import { connectToDB } from "@/lib/mongoDB/mongoDB";
// import {
//   ReportShare,
//   reportSections,
//   reportSectionLabels,
// } from "@/lib/mongoDB/report-share";
// import ShareForm from "./share-form";
// import { revokeReportShare } from "./share-actions";

// const dateFormat = new Intl.DateTimeFormat("en-GB", {
//   dateStyle: "medium",
//   timeStyle: "short",
//   timeZone: "Asia/Yangon",
// });

// export default async function ChartPage() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   const ownerId = session?.user.id;

//   if (!ownerId) redirect("/sign-in");

//   await connectToDB();

//   const links = await ReportShare.find({
//     ownerId,
//     expiresAt: { $gt: new Date() },
//   })
//     .sort({ createdAt: -1 })
//     .lean();

//   return (
//     <main className="space-y-4 p-4 md:p-8">
//       <h1 className="text-2xl font-semibold">စက်ရုံ အစီရင်ခံစာ</h1>

//       <details className="rounded-xl border bg-card p-4">
//         <summary className="cursor-pointer font-medium">
//           Report မျှဝေရန်
//         </summary>

//         <div className="mt-4 space-y-4">
//           <ShareForm
//             sections={reportSections.map((id) => ({
//               id,
//               label: reportSectionLabels[id],
//             }))}
//           />

//           <ul className="space-y-2">
//             {links.map((link) => (
//               <li
//                 key={String(link._id)}
//                 className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-sm"
//               >
//                 <span>
//                   {link.sections
//                     .map((section) => reportSectionLabels[section])
//                     .join("၊ ")}
//                   {" · "}
//                   {dateFormat.format(link.expiresAt)}
//                 </span>

//                 <form action={revokeReportShare}>
//                   <input type="hidden" name="id" value={String(link._id)} />
//                   <button
//                     type="submit"
//                     className="rounded-md border px-3 py-1 text-destructive"
//                   >
//                     Link ပြန်ပိတ်ရန်
//                   </button>
//                 </form>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </details>

//       <OfficeReports ownerId={ownerId} />
//     </main>
//   );
// }




import { deriveShareToken, hashShareToken, ReportShare, reportSections, reportSectionLabels } from "@/lib/mongoDB/report-share";
import CopyShareLink from "./copy-share-link";
import ShareForm from "./share-form";
import { revokeReportShare } from "./share-actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OfficeReports from "@/components/dashboard/chart/OfficeReports";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";

export default async function ChartPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/sign-in");
  await connectToDB();

  const links = await ReportShare.find({ ownerId: session.user.id, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).lean();
  const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Yangon" });

  return (
    <main className="space-y-4 p-4 md:p-8">
      <h1 className="text-2xl font-semibold">စက်ရုံ အစီရင်ခံစာ</h1>
      <details className="rounded-xl border bg-card p-4">
        <summary className="cursor-pointer font-medium">Report မျှဝေရန်</summary>
        <div className="mt-4 space-y-4">
          <ShareForm sections={reportSections.map((id) => ({ id, label: reportSectionLabels[id] }))} />
          <ul className="space-y-2">
            {links.map((link) => {
              const token = deriveShareToken(String(link._id));
              const copyPath = token && hashShareToken(token) === link.tokenHash ? `/share/reports/${token}` : null;
              return (
              <li key={String(link._id)} className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-sm">
                <span>{link.sections.map((section) => reportSectionLabels[section]).join("၊ ")} · {dateFormat.format(link.expiresAt)}</span>
                <div className="flex flex-wrap items-center gap-2">
                {copyPath ? <CopyShareLink path={copyPath} /> : (
                  <span className="text-xs text-muted-foreground">ပြန်ကူးရန် Link အသစ် ဖန်တီးပါ</span>
                )}
                <form action={revokeReportShare}>
                  <input type="hidden" name="id" value={String(link._id)} />
                  <button className="rounded-md border px-3 py-1 text-destructive">Link ပြန်ပိတ်ရန်</button>
                </form>
                </div>
              </li>
              );
            })}
          </ul>
        </div>
      </details>
      <OfficeReports ownerId={session.user.id} />
    </main>
  );
}