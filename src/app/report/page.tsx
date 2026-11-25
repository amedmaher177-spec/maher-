"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/types";

type Match = { item_id: string; title: string; location: string; report_type: string; confidence: number };
const empty = { report_type: "", category: "", title: "", location: "", item_date: "", description: "", image_url: "" };

export default function ReportPage() {
  const router = useRouter();
  const [f, setF] = useState(empty);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setMatches([]);
    if (!f.report_type || !f.category || !f.title.trim() || !f.location.trim() || !f.item_date || !f.description.trim()) {
      setError("⚠️ Please fill in all required fields marked with (*) before submitting your report.");
      return;
    }
    setBusy(true);
    try {
      const d = await api<{ item: { title: string }; matches: Match[] }>("/api/items", { method: "POST", body: JSON.stringify(f) });
      setSuccess(`✅ Success! Your ${f.report_type} item report "${d.item.title}" has been published.`);
      setMatches(d.matches);
      setF(empty);
    } catch (err: any) {
      if (err.status === 401) return router.push("/login?next=/report");
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Report a Lost or Found Item</h1>
      <p className="mb-5 text-sm text-slate-500">Fill out the details below. Our AI will automatically scan for potential matches.</p>
      <div className="card mx-auto max-w-2xl p-6">
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">{success}</p>}
        {matches.length > 0 && (
          <div className="mb-4 rounded-lg border border-blue-200 border-l-4 border-l-blue-900 bg-blue-50 p-4 text-sm">
            <strong>🤖 AI Match Suggestions:</strong>
            <ul className="mt-1 list-disc pl-5">
              {matches.map((m) => (
                <li key={m.item_id}><strong>{m.report_type.toUpperCase()}</strong> “{m.title}” at {m.location} ({Math.round(m.confidence)}% confidence)</li>
              ))}
            </ul>
            <Link href="/feed" className="mt-2 inline-block font-semibold text-blue-900">View in Item Feed →</Link>
          </div>
        )}
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="rt">Report Type *</label>
              <select id="rt" className="input" value={f.report_type} onChange={set("report_type")}>
                <option value="">-- Select Type --</option><option value="lost">Lost Item (I lost something)</option><option value="found">Found Item (I found something)</option>
              </select></div>
            <div><label className="label" htmlFor="cat">Category *</label>
              <select id="cat" className="input" value={f.category} onChange={set("category")}>
                <option value="">-- Select Category --</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>
          </div>
          <div><label className="label" htmlFor="ti">Item Title *</label>
            <input id="ti" className="input" placeholder="e.g. Black Leather Wallet" value={f.title} onChange={set("title")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="lo">Campus Location *</label>
              <input id="lo" className="input" placeholder="e.g. Main Library 2nd Floor" value={f.location} onChange={set("location")} /></div>
            <div><label className="label" htmlFor="da">Date Lost or Found *</label>
              <input id="da" type="date" className="input" max={new Date().toISOString().slice(0, 10)} value={f.item_date} onChange={set("item_date")} /></div>
          </div>
          <div><label className="label" htmlFor="de">Detailed Description *</label>
            <textarea id="de" rows={3} className="input" placeholder="Include color, brand, scratches, stickers, or identifying marks..." value={f.description} onChange={set("description")} /></div>
          <div><label className="label" htmlFor="im">Photo URL (Optional, https only)</label>
            <input id="im" type="url" className="input" placeholder="https://..." value={f.image_url} onChange={set("image_url")} /></div>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Submitting..." : "Report item"}</button>
        </form>
      </div>
    </>
  );
}
