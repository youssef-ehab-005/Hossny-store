"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, async current => {
    if (!current) { router.replace("/login"); return; }
    setUser(current);
    try {
      const token = await current.getIdToken();
      const response = await fetch("/api/account/me", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (response.ok) { const data = await response.json(); setRole(data.role || "customer"); }
    } finally { setLoading(false); }
  }), [router]);
  async function logout() { await signOut(auth); router.replace("/"); }
  if (loading || !user) return <main className="account-wrap"><div className="panel">LOADING YOUR ACCOUNT...</div></main>;
  return <main className="account-wrap"><section className="account-panel"><Link className="logo" href="/">HOSSNY<span>®</span></Link><div className="eyebrow account-eyebrow">YOUR ACCOUNT</div><h1 className="auth-title">WELCOME<br/>{(user.displayName || "BACK").toUpperCase()}.</h1><p className="auth-copy">{user.email}</p><div className="account-role">ACCOUNT TYPE <strong>{role === "admin" ? "ADMIN" : "CUSTOMER"}</strong></div>{role === "admin" && <Link className="action account-action" href="/admin">OPEN ADMIN DASHBOARD ↗</Link>}<button className="action account-action" onClick={logout}>SIGN OUT</button><Link className="back-home" href="/">← Back to store</Link></section></main>;
}
