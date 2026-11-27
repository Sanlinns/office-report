"use client";

import { useState } from "react";

export default function CopyShareLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  async function copy() {
    const url = new URL(path, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setManualUrl("");
    } catch {
      setManualUrl(url);
    }
  }

  return (
    <>
      <button type="button" onClick={copy} className="rounded-md border px-3 py-1">
        {copied ? "ကူးပြီးပါပြီ" : "Link ကူးရန်"}
      </button>
      {manualUrl && <input aria-label="Share Link" readOnly value={manualUrl} onFocus={(event) => event.target.select()} className="min-w-0 rounded-md border px-2 py-1" />}
    </>
  );
}
