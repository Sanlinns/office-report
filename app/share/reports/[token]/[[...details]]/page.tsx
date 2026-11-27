// import type { Metadata } from "next";
// import { notFound } from "next/navigation";
// import OfficeReports from "@/components/dashboard/chart/OfficeReports";
// import { formatKyat } from "@/lib/format-kyat";
// import { loadOfficeReport } from "@/lib/mongoDB/office-report-data";
// import { readReportShare, reportSectionLabels, reportSections } from "@/lib/mongoDB/report-share";

// export const dynamic = "force-dynamic";
// export const metadata: Metadata = {
//   title: "မျှဝေထားသော စက်ရုံအစီရင်ခံစာ",
//   robots: { index: false, follow: false },
//   referrer: "no-referrer",
// };

// export default async function SharedReportPage({ params }: {
//   params: Promise<{ token: string; details?: string[] }>;
// }) {
//   const { token, details } = await params;
//   const share = await readReportShare(token);
//   if (!share || (details && details.length !== 1)) notFound();

//   const path = `/share/reports/${token}`;
//   if (!details) {
//     return (
//       <main className="mx-auto max-w-7xl space-y-4 p-4 sm:p-8">
//         <h1 className="text-2xl font-semibold">စက်ရုံ အစီရင်ခံစာ</h1>
//         <p className="text-sm text-muted-foreground">ကြည့်ရှုရန်သီးသန့်</p>
//         <OfficeReports ownerId={share.ownerId} sections={share.sections} sharePath={path} />
//       </main>
//     );
//   }

//   const section = reportSections.find((entry) => entry === details[0]);
//   if (!section || !share.sections.includes(section)) notFound();

//   const { stockRows, sales, budget, points } = await loadOfficeReport(share.ownerId);
//   const tables = {
//     inventory: {
//       columns: ["ပစ္စည်းအမည်", "လက်ကျန်", "ယူနစ်"],
//       rows: stockRows.map(({ label, quantity, unit }) => [label, quantity.toLocaleString("en", { maximumFractionDigits: 6 }), unit]),
//     },
//     sales: {
//       columns: ["ပစ္စည်းအမည်", "ရောင်းပမာဏ", "ရောင်းရငွေ · နောက်ဆုံး ၃၀ ရက်"],
//       rows: sales.map(({ name, quantity, revenue, _id }) => [name, `${quantity.toLocaleString()} ${_id.unit}`, formatKyat(revenue)]),
//     },
//     budget: {
//       columns: ["အကြောင်းအရာ", "တန်ဖိုး"],
//       rows: budget ? [
//         ["စုစုပေါင်းရန်ပုံငွေ", formatKyat(budget.funds)],
//         ["သုံးစွဲပြီးငွေ", formatKyat(budget.spent)],
//         ["လက်ကျန်ငွေ", formatKyat(budget.funds - budget.spent)],
//       ] : [],
//     },
//     finance: {
//       columns: ["ရက်စွဲ", "ဝင်ငွေ", "ထွက်ငွေ", "ငွေရလဒ်"],
//       rows: points.filter(({ count }) => count > 0).reverse()
//         .map(({ date, revenue, cost, profit }) => [date, formatKyat(revenue), formatKyat(cost), formatKyat(profit)]),
//     },
//   };
//   const { columns, rows } = tables[section];

//   return (
//     <main className="mx-auto max-w-5xl space-y-4 p-4 sm:p-8">
//       <a href={path} className="text-sm text-blue-600 underline dark:text-blue-400">အစီရင်ခံစာသို့</a>
//       <h1 className="text-2xl font-semibold">{reportSectionLabels[section]}</h1>
//       <p className="text-sm text-muted-foreground">ကြည့်ရှုရန်သီးသန့်</p>
//       <div className="overflow-x-auto rounded-xl border bg-card">
//         <table className="w-full text-left text-sm">
//           <thead className="bg-muted"><tr>{columns.map((column) => <th key={column} scope="col" className="p-3">{column}</th>)}</tr></thead>
//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={index} className="border-t">
//                 {row.map((value, column) => <td key={column} className="p-3 tabular-nums">{value}</td>)}
//               </tr>
//             ))}
//             {rows.length === 0 && <tr><td colSpan={columns.length} className="p-4">စာရင်းမရှိသေးပါ။</td></tr>}
//           </tbody>
//         </table>
//       </div>
//     </main>
//   );
// }








import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfficeReports from "@/components/dashboard/chart/OfficeReports";
import { formatKyat } from "@/lib/format-kyat";
import { loadOfficeReport } from "@/lib/mongoDB/office-report-data";
import { readReportShare, reportSectionLabels, reportSections } from "@/lib/mongoDB/report-share";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "မျှဝေထားသော စက်ရုံအစီရင်ခံစာ",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function SharedReportPage({ params }: {
  params: Promise<{ token: string; details?: string[] }>;
}) {
  const { token, details } = await params;
  const share = await readReportShare(token);
  if (!share || (details && details.length !== 1)) notFound();

  const path = `/share/reports/${token}`;
  if (!details) {
    return (
      <main className="min-h-dvh w-full min-w-0 space-y-4 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold">စက်ရုံ အစီရင်ခံစာ</h1>
        <p className="text-sm text-muted-foreground">ကြည့်ရှုရန်သီးသန့်</p>
        <OfficeReports ownerId={share.ownerId} sections={share.sections} sharePath={path} />
      </main>
    );
  }

  const section = reportSections.find((entry) => entry === details[0]);
  if (!section || !share.sections.includes(section)) notFound();

  const { stockRows, sales, budget, points } = await loadOfficeReport(share.ownerId);
  const tables = {
    inventory: {
      columns: ["ပစ္စည်းအမည်", "လက်ကျန်", "ယူနစ်"],
      rows: stockRows.map(({ label, quantity, unit }) => [label, quantity.toLocaleString("en", { maximumFractionDigits: 6 }), unit]),
    },
    sales: {
      columns: ["ပစ္စည်းအမည်", "ရောင်းပမာဏ", "ရောင်းရငွေ · နောက်ဆုံး ၃၀ ရက်"],
      rows: sales.map(({ name, quantity, revenue, _id }) => [name, `${quantity.toLocaleString()} ${_id.unit}`, formatKyat(revenue)]),
    },
    budget: {
      columns: ["အကြောင်းအရာ", "တန်ဖိုး"],
      rows: budget ? [
        ["စုစုပေါင်းရန်ပုံငွေ", formatKyat(budget.funds)],
        ["သုံးစွဲပြီးငွေ", formatKyat(budget.spent)],
        ["လက်ကျန်ငွေ", formatKyat(budget.funds - budget.spent)],
      ] : [],
    },
    finance: {
      columns: ["ရက်စွဲ", "ဝင်ငွေ", "ထွက်ငွေ", "ငွေရလဒ်"],
      rows: points.filter(({ count }) => count > 0).reverse()
        .map(({ date, revenue, cost, profit }) => [date, formatKyat(revenue), formatKyat(cost), formatKyat(profit)]),
    },
  };
  const { columns, rows } = tables[section];

  return (
    <main className="min-h-dvh w-full min-w-0 space-y-4 p-4 sm:p-6 lg:p-8">
      <a href={path} className="text-sm text-blue-600 underline dark:text-blue-400">အစီရင်ခံစာသို့</a>
      <h1 className="text-2xl font-semibold">{reportSectionLabels[section]}</h1>
      <p className="text-sm text-muted-foreground">ကြည့်ရှုရန်သီးသန့်</p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted"><tr>{columns.map((column) => <th key={column} scope="col" className="p-3">{column}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t">
                {row.map((value, column) => <td key={column} className="p-3 tabular-nums">{value}</td>)}
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={columns.length} className="p-4">စာရင်းမရှိသေးပါ။</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}