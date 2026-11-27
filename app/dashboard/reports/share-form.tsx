"use client";

import { useActionState, useRef, useState } from "react";
import { createReportShare } from "./share-actions";

export default function ShareForm({ sections }: { sections: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState(createReportShare, {});
  const linkInput = useRef<HTMLInputElement>(null);
  const [copiedPath, setCopiedPath] = useState("");
  async function copyLink() {
    if (!state.path) return;
    try {
      await navigator.clipboard.writeText(new URL(state.path, window.location.origin).href);
      setCopiedPath(state.path);
    } catch {
      linkInput.current?.focus();
      linkInput.current?.select();
    }
  }
  return (
    <form action={action} className="space-y-3">
      <fieldset className="flex flex-wrap gap-3">
        <legend className="mb-2 text-sm font-medium">မျှဝေမည့် စာရင်းများ</legend>
        {sections.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="section" value={id} defaultChecked={id === "sales" || id === "inventory"} />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <select aria-label="Link သက်တမ်း" name="days" defaultValue="7" className="rounded-md border bg-background px-2">
          {[1, 7, 30].map((days) => <option key={days} value={days}>{days} ရက်</option>)}
        </select>
        <button disabled={pending} className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white">
          Share Link ဖန်တီးရန်
        </button>
      </div>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state.path && <div className="space-y-2">
        <label className="grid gap-1 text-sm">
          ဒီ Link ကို ယခု ကူးယူထားပါ
          <input ref={linkInput} readOnly value={typeof window === "undefined" ? state.path : new URL(state.path, window.location.origin).href} onFocus={(event) => event.target.select()} className="w-full rounded-md border bg-background p-2" />
        </label>
        <button type="button" onClick={copyLink} className="rounded-md border px-3 py-1 text-sm">
          {copiedPath === state.path ? "ကူးပြီးပါပြီ" : "Link ကူးရန်"}
        </button>
      </div>}
    </form>
  );
}