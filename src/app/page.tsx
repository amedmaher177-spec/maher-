"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Item } from "@/lib/types";
import ItemCard from "@/components/ItemCard";

export default function Home() {
  const [stats, setStats] = useState({ active: 0, found: 0, recovered: 0 });
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    api<{ stats: typeof stats }>("/api/stats").then((d) => setStats(d.stats)).catch(() => {});
    api<{ items: Item[] }>("/api/items?limit=3").then((d) => setItems(d.items)).catch(() => {});
  }, []);

  return (
    <>
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 px-6 py-10 text-white shadow md:px-8">
        <span className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-blue-200">AI-Powered Campus Recovery</span>
        <h1 className="mb-3 text-3xl font-bold leading-tight md:text-4xl">Lost something on campus? Let&apos;s bring it back.</h1>
        <p className="mb-6 max-w-xl text-slate-200">UniLost centralizes all university lost and found reports in one place and uses smart AI matching to reconnect students with their belongings faster.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/feed" className="btn bg-white text-blue-900 hover:bg-slate-100">Browse Lost &amp; Found</Link>
          <Link href="/report" className="btn border border-white/60 text-white hover:bg-white/10">Report an Item</Link>
        </div>
      </section>

      <section className="my-8 grid gap-4 sm:grid-cols-3">
        {[["Active Reports", stats.active], ["Found Items", stats.found], ["Items Recovered", stats.recovered]].map(([label, n]) => (
          <div key={label as string} className="card p-5 text-center">
            <div className="text-3xl font-extrabold text-blue-900">{n}</div>
            <div className="text-sm font-medium text-slate-500">{label}</div>
          </div>
        ))}
      </section>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Recent Campus Reports</h2>
        <Link href="/feed" className="font-semibold text-blue-900">View all →</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => <ItemCard key={i.id} item={i} />)}
      </div>
      {items.length === 0 && <p className="text-slate-500">No reports yet. Be the first to report an item.</p>}
    </>
  );
}
