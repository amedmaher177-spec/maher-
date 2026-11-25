"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { full_name: fullName, email, password }),
      });
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/feed");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-7">
        <div className="mb-5 text-center">
          <div className="text-4xl">🔐</div>
          <h1 className="text-xl font-bold text-slate-900">{mode === "login" ? "Student & Staff Login" : "Create your account"}</h1>
          <p className="text-sm text-slate-500">{mode === "login" ? "Sign in to manage reports and claims." : "Use your university email."}</p>
        </div>
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div><label className="label" htmlFor="fn">Full name</label>
              <input id="fn" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
          )}
          <div><label className="label" htmlFor="em">University Email</label>
            <input id="em" type="email" className="input" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="label" htmlFor="pw">Password</label>
            <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {mode === "register" && <p className="mt-1 text-xs text-slate-500">At least 8 characters, with a letter and a number.</p>}</div>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Login" : "Register"}</button>
        </form>
        <button className="mt-4 w-full text-sm font-semibold text-blue-900" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "No account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
