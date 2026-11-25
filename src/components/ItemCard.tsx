"use client";
import { useState } from "react";
import { ICONS, type Item } from "@/lib/types";

export default function ItemCard({ item, children }: { item: Item; children?: React.ReactNode }) {
  const [broken, setBroken] = useState(false);
  const isLost = item.report_type === "lost";
  return (
    <article className="card flex flex-col overflow-hidden">
      {item.image_url && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <div className="flex h-44 items-center justify-center bg-blue-100 text-6xl">{ICONS[item.category] ?? "📦"}</div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${isLost ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{item.report_type}</span>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-900">{item.category}</span>
        </div>
        <h3 className="font-bold text-slate-900">{item.title}</h3>
        <p className="mb-2 text-sm text-slate-500">📍 {item.location} · 📅 {item.item_date}</p>
        <p className="mb-4 flex-1 text-sm">{item.description}</p>
        {children}
      </div>
    </article>
  );
}
