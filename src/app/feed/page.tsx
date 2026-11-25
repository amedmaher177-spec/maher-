"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORIES, type Item } from "@/lib/types";
import ItemCard from "@/components/ItemCard";
import ClaimModal from "@/components/ClaimModal";

export default function FeedPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState<Item | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams({ type, category, limit: "50" });
      if (q.trim()) p.set("q", q.trim());
      api<{ items: Item[] }>(`/api/items?${p}`).then((d) => { setItems(d.items); setError(""); }).catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q, type, category]);

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Lost &amp; Found Item Feed</h1>
      <p className="mb-5 text-sm text-slate-500">Search reported items across campus or submit an ownership claim on found items.</p>
      <div className="mb-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <input className="input" placeholder="Search by item name or location..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All Types (Lost &amp; Found)</option><option value="lost">Lost Items Only</option><option value="found">Found Items Only</option>
        </select>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {items === null && !error && <p className="text-slate-500">Loading...</p>}
      {items?.length === 0 && (
        <div className="mx-auto max-w-md rounded-xl border-2 border-dashed bg-white p-10 text-center">
          <div className="text-4xl">🔍</div><h3 className="font-bold">No matching items found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search keywords or category filter.</p>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((i) => (
          <ItemCard key={i.id} item={i}>
            {i.report_type === "found"
              ? <button className="btn btn-primary w-full" onClick={() => setClaiming(i)}>Claim This Item</button>
              : <Link href="/report" className="btn btn-outline w-full">I Found This Item</Link>}
          </ItemCard>
        ))}
      </div>
      {claiming && <ClaimModal item={claiming} onClose={() => setClaiming(null)} />}
    </>
  );
}
