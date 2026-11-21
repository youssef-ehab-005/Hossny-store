"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  useEffect(() => onAuthStateChanged(auth, async user => {
    if (!user) { router.replace("/login"); return; }
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/account/me", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data.role !== "admin") { setStatus("denied"); return; }
      setStatus("admin");
    } catch { setStatus("error"); }
  }), [router]);
  return <main className="account-wrap"><section className="account-panel"><Link className="logo" href="/">HOSSNY<span>®</span></Link><div className="eyebrow account-eyebrow">CONTROL ROOM</div>{status === "loading" ? <h1 className="auth-title">VERIFYING.</h1> : status === "admin" ? <><h1 className="auth-title">ADMIN<br/>DASHBOARD.</h1><p className="auth-copy">تم التحقق من صلاحيات الأدمن. لوحة إدارة المنتجات والطلبات سيتم استكمالها في المرحلة التالية.</p><div className="account-role">ACCESS<strong>AUTHORIZED</strong></div></> : <><h1 className="auth-title">ACCESS<br/>DENIED.</h1><p className="auth-copy">هذا الحساب لا يمتلك صلاحيات الأدمن.</p></>}<Link className="action account-action" href="/account">BACK TO ACCOUNT</Link></section></main>;
}
