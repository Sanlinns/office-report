"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

type CategoryOption = { id: string; name: string; unit: string };

export default function CategoryUnitFields({ categories }: { categories: CategoryOption[] }) {
  const [unit, setUnit] = useState("");
  return (
    <>
      <label className="grid gap-2 text-sm">
        ပစ္စည်းအမျိုးအစား
        <select
          name="categoryId"
          className="h-9 min-w-0 rounded-md border bg-background px-3"
          onChange={(event) => {
            const category = categories.find(({ id }) => id === event.target.value);
            if (category?.unit) setUnit(category.unit);
          }}
        >
          <option value="">အမျိုးအစားမသတ်မှတ်ပါ</option>
          {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        ယူနစ်
        <Input name="unit" maxLength={30} required value={unit} onChange={(event) => setUnit(event.target.value)} />
      </label>
    </>
  );
}
