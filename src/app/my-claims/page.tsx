"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Claim = { id: string; status: string; proof_description: string; item_title: string; item_location: string };
const badge: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700", approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700", recovered: "bg-blue-50 text-blue-900",
};

export default function MyClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ claims: Claim[] }>("/api/my/claims")
      .then((d) => setClaims(d.claims))
      .catch((e) => (e.status === 401 ? router.push("/login?next=/my-claims") : setError(e.message)));
  }, [router]);

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">My Ownership Claims</h1>
      <p className="mb-5 text-sm text-slate-500">Track verification status for found items you have claimed.</p>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!claims && !error && <p className="text-slate-500">Loading...</p>}
      {claims?.length === 0 && (
        <div className="mx-auto max-w-md rounded-xl border-2 border-dashed bg-white p-10 text-center">
          <div className="text-4xl">🛡️</div><h3 className="font-bold">No ownership claims submitted</h3>
          <p className="mb-4 text-sm text-slate-500">Browse found items and submit a claim if you recognize your belonging.</p>
          <Link href="/feed" className="btn btn-primary">Browse Found Items</Link>
        </div>
      )}
      <div className="grid gap-4">
        {claims?.map((c) => (
          <div key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h3 className="font-bold text-slate-900">{c.item_title}</h3>
              <p className="text-sm text-slate-500">Your Proof: “{c.proof_description}”</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${badge[c.status] ?? ""}`}>{c.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
