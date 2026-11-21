import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snap = await getAdminDb().collection("products")
      .where("active", "==", true)
      .limit(100)
      .get();
    const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Unable to load products" }, { status: 500 });
  }
}
