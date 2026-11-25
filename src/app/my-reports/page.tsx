"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Item } from "@/lib/types";
import ItemCard from "@/components/ItemCard";

export default function MyReportsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ items: Item[] }>("/api/my/reports")
      .then((d) => setItems(d.items))
      .catch((e) => (e.status === 401 ? router.push("/login?next=/my-reports") : setError(e.message)));
  }, [router]);

  async function remove(id: string) {
    if (!confirm("Delete this report?")) return;
    try {
      await api(`/api/items/${id}`, { method: "DELETE" });
      setItems((prev) => (prev ?? []).filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Submitted Reports</h1>
          <p className="text-sm text-slate-500">Manage the lost and found reports you have posted.</p>
        </div>
        <Link href="/report" className="btn btn-primary">+ New Report</Link>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!items && !error && <p className="text-slate-500">Loading your reports...</p>}
      {items?.length === 0 && (
        <div className="mx-auto max-w-md rounded-xl border-2 border-dashed bg-white p-10 text-center">
          <div className="text-4xl">📭</div><h3 className="font-bold">You haven&apos;t submitted any reports yet</h3>
          <p className="mb-4 text-sm text-slate-500">Create your first report to get started.</p>
          <Link href="/report" className="btn btn-primary">Report an Item</Link>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((i) => (
          <ItemCard key={i.id} item={i}>
            <button className="btn btn-danger w-full" onClick={() => remove(i.id)}>Delete Report</button>
          </ItemCard>
        ))}
      </div>
    </>
  );
}
