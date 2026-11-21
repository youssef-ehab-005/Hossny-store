"use client";

import Link from "next/link";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (password.length < 8) { setError("كلمة المرور لازم تكون 8 أحرف على الأقل."); return; }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      const token = await credential.user.getIdToken(true);
      const response = await fetch("/api/account/profile", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ displayName: name.trim() }) });
      if (!response.ok) throw new Error("تم إنشاء الحساب لكن تعذر تجهيز ملف الحساب. سجّل الدخول مرة أخرى.");
      router.push("/account");
    } catch (err) {
      const code = err?.code;
      setError(code === "auth/email-already-in-use" ? "البريد الإلكتروني مستخدم بالفعل. جرّب تسجيل الدخول." : code === "auth/invalid-email" ? "البريد الإلكتروني غير صحيح." : code === "auth/weak-password" ? "كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل." : err.message || "تعذر إنشاء الحساب.");
    } finally { setLoading(false); }
  }

  return <main className="auth-wrap"><section className="auth-card"><Link className="logo auth-logo" href="/">HOSSNY<span>®</span></Link><div className="eyebrow">JOIN THE COMMUNITY</div><h1 className="auth-title">CREATE<br/>ACCOUNT.</h1><p className="auth-copy">أنشئ حسابك وابدأ تجربة HOSSNY.</p><form onSubmit={handleSubmit} className="auth-form"><label>Full name<input className="field" autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" /></label><label>Email address<input className="field" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Password<input className="field" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="action auth-submit" disabled={loading}>{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT ↗"}</button></form><p className="auth-switch">عندك حساب بالفعل؟ <Link href="/login">تسجيل الدخول</Link></p><Link className="back-home" href="/">← Back to store</Link></section></main>;
}
