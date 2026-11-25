"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = { full_name: string; role: string };

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Item Feed" },
  { href: "/report", label: "Report Item" },
  { href: "/my-reports", label: "My Reports" },
  { href: "/my-claims", label: "My Claims" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api<{ user: User }>("/api/auth/me").then((d) => setUser(d.user)).catch(() => setUser(null));
    setOpen(false);
  }, [path]);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const links = user?.role === "admin" ? [...LINKS, { href: "/admin", label: "Admin Dashboard" }] : LINKS;
  const cls = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${active ? "bg-blue-900 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-5 py-3">
        <Link href="/" className="text-xl font-bold">🎓 Uni<span className="text-blue-400">Lost</span></Link>
        <button className="rounded border border-white/25 px-3 py-1 text-xl md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
        <nav className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 pt-3 md:flex md:w-auto md:flex-row md:items-center md:pt-0`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cls(path === l.href)}>{l.label}</Link>
          ))}
          {user ? (
            <button onClick={logout} className="rounded-md border border-blue-400 px-3 py-2 text-sm text-blue-200 hover:bg-blue-600 hover:text-white md:ml-1">
              Logout ({user.full_name.split(" ")[0]})
            </button>
          ) : (
            <Link href="/login" className="rounded-md border border-blue-400 px-3 py-2 text-center text-sm text-blue-200 hover:bg-blue-600 hover:text-white md:ml-1">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
