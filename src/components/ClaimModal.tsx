"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Item } from "@/lib/types";

export default function ClaimModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const router = useRouter();
  const [proof, setProof] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/claims", { method: "POST", body: JSON.stringify({ item_id: item.id, proof_description: proof }) });
      router.push("/my-claims");
    } catch (err: any) {
      if (err.status === 401) router.push("/login?next=/feed");
      else setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-bold">Submit Ownership Claim</h3>
          <button onClick={onClose} className="text-2xl text-slate-500" aria-label="Close">&times;</button>
        </div>
        <p className="mb-4 text-sm font-semibold text-blue-900">Item: {item.title} ({item.location})</p>
        {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={submit}>
          <label className="label" htmlFor="proof">Private Ownership Proof *</label>
          <textarea id="proof" rows={4} className="input" value={proof} onChange={(e) => setProof(e.target.value)}
            placeholder="Describe hidden details, lockscreen wallpaper, contents inside, or serial number..." required />
          <p className="mt-1 text-xs text-slate-500">Only authorized university administrators can view this verification proof.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={busy}>{busy ? "Submitting..." : "Submit Claim"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
