"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Row = Record<string, any>;
type Overview = {
  stats: { total_reports: number; pending_claims: number; approved_or_recovered: number };
  items: Row[]; claims: Row[]; matches: Row[];
};
const badge: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700", approved: "bg-green-50 text-green-700", rejected: "bg-red-50 text-red-700",
  recovered: "bg-blue-50 text-blue-900", lost: "bg-red-50 text-red-700", found: "bg-green-50 text-green-700",
};
const Pill = ({ v }: { v: string }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${badge[v] ?? "bg-slate-100 text-slate-700"}`}>{v}</span>;
const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <div className="card overflow-x-auto">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="bg-blue-50 text-slate-900"><tr>{head.map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
      <tbody className="[&_td]:border-t [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3">{children}</tbody>
    </table>
  </div>
);

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<Overview>("/api/admin/overview").then(setData).catch((e) => (e.status === 401 ? router.push("/login?next=/admin") : setError(e.message)));
  }, [router]);
  useEffect(load, [load]);

  async function setStatus(id: string, status: string) {
    try { await api(`/api/claims/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); load(); } catch (e: any) { setError(e.message); }
  }
  async function del(id: string) {
    if (!confirm("Delete this report?")) return;
    try { await api(`/api/items/${id}`, { method: "DELETE" }); load(); } catch (e: any) { setError(e.message); }
  }

  if (error && !data) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  if (!data) return <p className="text-slate-500">Loading...</p>;

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Administrator Control Panel</h1>
      <p className="mb-5 text-sm text-slate-500">Review private ownership claims, verify matches, and moderate campus reports.</p>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[["Total Reports", data.stats.total_reports], ["Pending Claims", data.stats.pending_claims], ["Approved / Recovered", data.stats.approved_or_recovered]].map(([l, n]) => (
          <div key={l as string} className="card p-5 text-center"><div className="text-3xl font-extrabold text-blue-900">{n}</div><div className="text-sm text-slate-500">{l}</div></div>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-bold">Ownership Claim Requests</h2>
      <div className="mb-8"><Table head={["Item", "Student", "Private Proof Description", "Status", "Actions"]}>
        {data.claims.map((c) => (
          <tr key={c.id}>
            <td><strong>{c.item_title}</strong></td><td>{c.student_name}<div className="text-xs text-slate-500">{c.student_email}</div></td>
            <td>{c.proof_description}</td><td><Pill v={c.status} /></td>
            <td><div className="flex flex-wrap gap-1.5">
              <button className="btn btn-primary !px-3 !py-1.5 !text-xs" onClick={() => setStatus(c.id, "approved")}>Approve</button>
              <button className="btn btn-outline !px-3 !py-1.5 !text-xs" onClick={() => setStatus(c.id, "recovered")}>Recovered</button>
              <button className="btn btn-danger !px-3 !py-1.5 !text-xs" onClick={() => setStatus(c.id, "rejected")}>Reject</button>
            </div></td>
          </tr>
        ))}
        {data.claims.length === 0 && <tr><td colSpan={5} className="text-slate-500">No claims yet.</td></tr>}
      </Table></div>

      <h2 className="mb-3 text-lg font-bold">AI Match Suggestions</h2>
      <div className="mb-8"><Table head={["Lost Item", "Found Item", "Confidence", "Status"]}>
        {data.matches.map((m) => (
          <tr key={m.id}><td>{m.lost_title}</td><td>{m.found_title}</td><td>{Math.round(m.confidence)}%</td><td><Pill v={m.status} /></td></tr>
        ))}
        {data.matches.length === 0 && <tr><td colSpan={4} className="text-slate-500">No AI matches yet.</td></tr>}
      </Table></div>

      <h2 className="mb-3 text-lg font-bold">All Item Reports Moderation</h2>
      <Table head={["Title", "Type", "Category", "Location", "Date", "Action"]}>
        {data.items.map((i) => (
          <tr key={i.id}>
            <td><strong>{i.title}</strong></td><td><Pill v={i.report_type} /></td><td>{i.category}</td><td>{i.location}</td><td>{i.item_date}</td>
            <td><button className="btn btn-danger !px-3 !py-1.5 !text-xs" onClick={() => del(i.id)}>Delete</button></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
