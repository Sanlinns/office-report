
import React from "react";
import {
  IconHome,
  IconPackage,
  IconArrowDownRight,
  IconArrowUpRight,
  IconCalendar,
  IconChartBar,
  IconWallet,
  IconSettings,
} from "@tabler/icons-react";
import { FaRegFileCode } from "react-icons/fa";
import { BiSpreadsheet,BiSolidPackage  } from "react-icons/bi";


export const dashboardNavItems = [

  {
    title: "Dashboard",
    icon: <IconHome className="h-full w-full text-blue-900" />,
    href: "/dashboard",
    match: "exact" as const,
  },
    {
    title: "ကုန်ဝယ်ရန်ပုံငွေ",
    icon: <IconWallet className="h-full w-full text-green-500" />,
    href: "/dashboard/purchase-budget",
  },


  {
    title: "ကုန်ပစ္စည်း",
    icon: <IconPackage className="h-full w-full" />,
    href: "/dashboard/products",
  },

  {
    title: "Income",
    icon: <IconArrowDownRight className="h-full w-full text-green-500" />,
    href: "/dashboard/income",
  },

  {
    title: "Outcome",
    icon: <IconArrowUpRight className="h-full w-full text-red-500" />,
    href: "/dashboard/outcome",
  },

  {
    title: "ငွေလွှဲစာရင်း",
    icon: <IconWallet className="h-full w-full text-sky-500" />,
    href: "/dashboard/money",
  },
  {
    title: "sheet",
    icon: <BiSpreadsheet className="h-full w-full text-blue-800" />,
    href: "/dashboard/products-sheet",
  },
  {
    title: "Package",
    icon: <BiSolidPackage className="h-full w-full text-blue-400" />,
    href: "/dashboard/products",
  },

  {
    title: "Code Notes",
    icon: <IconCalendar className="h-full w-full text-green-700" />,
    href: "/note",
  },

  {
    title: "Reports",
    icon: <IconChartBar className="h-full w-full text-pink-500" />,
    href: "/dashboard/reports",
  },
  {
    title: "Code Snippets",
    icon: <FaRegFileCode className="h-full w-full text-yellow-600" />,
    href: "/dashboard/daily",

  },

  {
    title: "Settings",
    icon: <IconSettings className="h-full w-full text-red-600" />,
    href: "/dashboard/settings",
  },

];