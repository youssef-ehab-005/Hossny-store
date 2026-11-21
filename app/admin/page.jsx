"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

const emptyForm = { name: "", slug: "", price: "", categoryId: "t-shirts", description: "", imageUrl: "", sizes: "S, M, L, XL", colors: "Black, White", stock: "0", active: true };
const money = (value) => new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const api = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) }, cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Something went wrong");
    return data;
  }, [token]);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    try { const data = await api("/api/admin/products"); setProducts(data.products || []); }
    catch (e) { setError(e.message); }
  }, [api, token]);

  useEffect(() => onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) { router.replace("/login"); return; }
    setUser(currentUser);
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch("/api/account/me", { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data.role !== "admin") { setStatus("denied"); return; }
      setToken(idToken); setStatus("admin");
    } catch { setStatus("error"); }
  }), [router]);

  useEffect(() => { if (status === "admin" && token) loadProducts(); }, [status, token, loadProducts]);

  const filteredProducts = useMemo(() => products.filter((p) => `${p.name} ${p.categoryId} ${p.slug}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  async function uploadImage(file) {
    if (!file) return;
    setError(""); setNotice(""); setUploading(true);
    try {
      const signature = await api("/api/media/cloudinary-signature", { method: "POST", body: JSON.stringify({}) });
      const body = new FormData();
      body.append("file", file); body.append("api_key", signature.apiKey); body.append("timestamp", String(signature.timestamp)); body.append("folder", signature.folder); body.append("signature", signature.signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Image upload failed");
      setField("imageUrl", result.secure_url); setNotice("Image uploaded successfully.");
    } catch (e) { setError(e.message); }
    finally { setUploading(false); }
  }

  async function saveProduct(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const product = {
      name: form.name.trim(), slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      price: Number(form.price), categoryId: form.categoryId.trim(), description: form.description,
      imageUrl: form.imageUrl, sizes: form.sizes.split(",").map(x => x.trim()).filter(Boolean),
      colors: form.colors.split(",").map(x => x.trim()).filter(Boolean), stock: Number(form.stock), active: form.active
    };
    try {
      if (editingId) await api("/api/admin/products", { method: "PATCH", body: JSON.stringify({ id: editingId, product }) });
      else await api("/api/admin/products", { method: "POST", body: JSON.stringify(product) });
      setNotice(editingId ? "Product updated." : "Product created."); resetForm(); await loadProducts();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({ name: product.name || "", slug: product.slug || "", price: String(product.price || ""), categoryId: product.categoryId || "", description: product.description || "", imageUrl: product.imageUrl || "", sizes: (product.sizes || []).join(", "), colors: (product.colors || []).join(", "), stock: String(product.stock ?? 0), active: product.active !== false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product permanently?")) return;
    setError(""); setNotice("");
    try { await api("/api/admin/products", { method: "DELETE", body: JSON.stringify({ id }) }); setNotice("Product deleted."); await loadProducts(); }
    catch (e) { setError(e.message); }
  }

  if (status === "loading") return <main className="account-wrap"><section className="account-panel"><div className="logo">HOSSNY<span>®</span></div><h1 className="auth-title">VERIFYING.</h1></section></main>;
  if (status !== "admin") return <main className="account-wrap"><section className="account-panel"><div className="logo">HOSSNY<span>®</span></div><h1 className="auth-title">ACCESS<br/>DENIED.</h1><p className="auth-copy">Your account does not have admin permissions.</p><Link className="action account-action" href="/account">BACK TO ACCOUNT</Link></section></main>;

  return <div className="admin-shell">
    <header className="admin-topbar"><Link className="logo" href="/">HOSSNY<span>®</span></Link><div className="admin-top-actions"><span>{user?.email}</span><Link href="/">VIEW STORE ↗</Link><button onClick={async () => { await signOut(auth); router.replace("/login"); }}>SIGN OUT</button></div></header>
    <main className="admin-main">
      <div className="admin-heading-row"><div><div className="eyebrow">CONTROL ROOM / INVENTORY</div><h1 className="admin-title">PRODUCTS<span>.</span></h1><p className="admin-subtitle">Manage your HOSSNY collection, pricing and stock.</p></div><div className="admin-stat"><strong>{products.length}</strong><span>PRODUCTS</span></div></div>
      {notice && <div className="admin-notice">{notice}</div>}{error && <div className="admin-error">{error}</div>}
      <section className="admin-form-card">
        <div className="admin-section-title"><div><div className="eyebrow">{editingId ? "UPDATE ITEM" : "NEW ARRIVAL"}</div><h2>{editingId ? "EDIT PRODUCT" : "ADD PRODUCT"}</h2></div>{editingId && <button className="admin-quiet-btn" type="button" onClick={resetForm}>CANCEL EDIT</button>}</div>
        <form onSubmit={saveProduct} className="admin-product-form">
          <label>PRODUCT NAME<input required minLength={2} className="field" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="OVERSIZED CORE TEE"/></label>
          <label>SLUG<input className="field" value={form.slug} onChange={e => setField("slug", e.target.value)} placeholder="oversized-core-tee"/></label>
          <label>PRICE (EGP)<input required type="number" min="1" step="1" className="field" value={form.price} onChange={e => setField("price", e.target.value)} placeholder="590"/></label>
          <label>CATEGORY<input required className="field" value={form.categoryId} onChange={e => setField("categoryId", e.target.value)} placeholder="t-shirts"/></label>
          <label>STOCK<input type="number" min="0" step="1" className="field" value={form.stock} onChange={e => setField("stock", e.target.value)}/></label>
          <label>SIZES <small>comma separated</small><input className="field" value={form.sizes} onChange={e => setField("sizes", e.target.value)} placeholder="S, M, L, XL"/></label>
          <label>COLORS <small>comma separated</small><input className="field" value={form.colors} onChange={e => setField("colors", e.target.value)} placeholder="Black, White"/></label>
          <label className="admin-wide">DESCRIPTION<textarea className="field admin-textarea" value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Product details..."/></label>
          <div className="admin-wide"><label>PRODUCT IMAGE</label><div className="admin-upload-row"><input type="file" accept="image/*" onChange={e => uploadImage(e.target.files?.[0])} disabled={uploading}/><span>{uploading ? "UPLOADING..." : "Upload to Cloudinary"}</span></div>{form.imageUrl && <div className="admin-image-preview"><img src={form.imageUrl} alt="Product preview"/><button type="button" onClick={() => setField("imageUrl", "")}>REMOVE IMAGE</button></div>}</div>
          <label className="admin-active"><input type="checkbox" checked={form.active} onChange={e => setField("active", e.target.checked)}/> ACTIVE / VISIBLE IN STORE</label>
          <div className="admin-wide"><button className="action admin-save" disabled={busy || uploading}>{busy ? "SAVING..." : editingId ? "SAVE CHANGES ↗" : "CREATE PRODUCT ↗"}</button></div>
        </form>
      </section>
      <section className="admin-list-section"><div className="admin-section-title"><div><div className="eyebrow">YOUR CATALOG</div><h2>ALL PRODUCTS</h2></div><input className="field admin-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."/></div>
        {filteredProducts.length ? <div className="admin-products-list">{filteredProducts.map(product => <article className="admin-product-row" key={product.id}><div className="admin-product-thumb">{product.imageUrl ? <img src={product.imageUrl} alt=""/> : <span>H®</span>}</div><div className="admin-product-info"><strong>{product.name}</strong><span>{product.categoryId} · {Number(product.stock || 0)} in stock · {product.active === false ? "Hidden" : "Active"}</span></div><b>{money(product.price)}</b><div className="admin-row-actions"><button onClick={() => editProduct(product)}>EDIT</button><button onClick={() => deleteProduct(product.id)}>DELETE</button></div></article>)}</div> : <div className="admin-empty">No products found. Add your first product above.</div>}
      </section>
    </main>
  </div>;
}
