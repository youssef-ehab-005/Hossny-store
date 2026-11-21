import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyUserToken } from "@/lib/firebase/verify-token";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.number().int().positive(),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().default(true)
});

export async function POST(request) {
  try {
    const user = await verifyUserToken(request.headers.get("authorization") ?? undefined);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const now = new Date();
    const ref = await getAdminDb().collection("products").add({
      ...parsed.data,
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({ id: ref.id, ...parsed.data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const unauthorized = message === "UNAUTHORIZED";
    return NextResponse.json(
      { error: unauthorized ? "Authentication required" : "Unable to create product" },
      { status: unauthorized ? 401 : 500 }
    );
  }
}
