import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyUserToken } from "@/lib/firebase/verify-token";

export const runtime = "nodejs";

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  price: z.number().int().positive(),
  categoryId: z.string().trim().min(1).max(80),
  description: z.string().max(2000).optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sizes: z.array(z.string().trim().min(1).max(20)).max(20).default([]),
  colors: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true)
});

async function requireAdmin(request) {
  const user = await verifyUserToken(request.headers.get("authorization") ?? undefined);
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export async function GET(request) {
  try {
    await requireAdmin(request);
    const snapshot = await getAdminDb().collection("products").orderBy("createdAt", "desc").limit(200).get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Unable to load products" }, { status });
  }
}

export async function POST(request) {
  try {
    await requireAdmin(request);
    const parsed = productSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const now = new Date();
    const ref = await getAdminDb().collection("products").add({ ...parsed.data, createdAt: now, updatedAt: now });
    return NextResponse.json({ id: ref.id, ...parsed.data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Unable to create product" }, { status });
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    const parsed = productSchema.safeParse(body.product);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const ref = getAdminDb().collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    await ref.update({ ...parsed.data, updatedAt: new Date() });
    return NextResponse.json({ id, ...parsed.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Unable to update product" }, { status });
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin(request);
    const { id } = await request.json();
    if (typeof id !== "string" || !id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    const ref = getAdminDb().collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Unable to delete product" }, { status });
  }
}
