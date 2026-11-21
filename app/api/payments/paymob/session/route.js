import { NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/firebase/verify-token";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await verifyUserToken(request.headers.get("authorization") ?? undefined);
    if (!process.env.PAYMOB_API_KEY || !process.env.PAYMOB_INTEGRATION_ID) {
      return NextResponse.json({ error: "Paymob is not configured" }, { status: 503 });
    }

    // TODO: Load the order from Firestore, calculate totals from trusted product
    // prices, then create a Paymob session using the API enabled for this account.
    return NextResponse.json(
      { error: "Paymob adapter needs account-specific API configuration before live payments." },
      { status: 501 }
    );
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
}
