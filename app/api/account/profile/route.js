import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyUserToken } from "@/lib/firebase/verify-token";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const user = await verifyUserToken(request.headers.get("authorization") ?? undefined);
    const body = await request.json().catch(() => ({}));
    const ref = getAdminDb().collection("users").doc(user.uid);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      await ref.set({ email: user.token.email ?? null, displayName: typeof body.displayName === "string" ? body.displayName.slice(0, 80) : null, role: "customer", createdAt: new Date(), updatedAt: new Date() });
    } else {
      await ref.set({ email: user.token.email ?? null, updatedAt: new Date() }, { merge: true });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const unauthorized = error?.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Authentication required" : "Unable to prepare account" }, { status: unauthorized ? 401 : 500 });
  }
}
