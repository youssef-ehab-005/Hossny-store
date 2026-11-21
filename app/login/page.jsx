"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await credential.user.getIdToken();
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("تعذر تجهيز حسابك. حاول مرة أخرى.");
      router.push("/account");
    } catch (err) {
      const code = err?.code;
      setError(code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        : code === "auth/too-many-requests"
          ? "محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى."
          : err.message || "حدث خطأ أثناء تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-wrap"><section className="auth-card"><Link className="logo auth-logo" href="/">HOSSNY<span>®</span></Link><div className="eyebrow">WELCOME BACK</div><h1 className="auth-title">SIGN IN.</h1><p className="auth-copy">ادخل إلى حسابك لمتابعة طلباتك وإدارة حسابك.</p><form onSubmit={handleSubmit} className="auth-form"><label>Email address<input className="field" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Password<input className="field" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="action auth-submit" disabled={loading}>{loading ? "PLEASE WAIT..." : "SIGN IN ↗"}</button></form><p className="auth-switch">لسه معندكش حساب؟ <Link href="/register">إنشاء حساب جديد</Link></p><Link className="back-home" href="/">← Back to store</Link></section></main>;
}
