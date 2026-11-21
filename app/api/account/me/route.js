import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyUserToken } from "@/lib/firebase/verify-token";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const user = await verifyUserToken(request.headers.get("authorization") ?? undefined);
    const snapshot = await getAdminDb().collection("users").doc(user.uid).get();
    return NextResponse.json({ uid: user.uid, email: user.token.email ?? null, role: snapshot.exists ? snapshot.data()?.role ?? "customer" : "customer" });
  } catch (error) {
    const unauthorized = error?.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Authentication required" : "Unable to load account" }, { status: unauthorized ? 401 : 500 });
  }
}
