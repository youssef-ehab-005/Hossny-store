import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyUserToken } from "@/lib/firebase/verify-token";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const user = await verifyUserToken(request.headers.get("authorization") ?? undefined);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_API_SECRET || !CLOUDINARY_API_KEY || !CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 503 });
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true
    });

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "hossny/products";
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      timestamp,
      folder,
      signature,
      apiKey: CLOUDINARY_API_KEY,
      cloudName: CLOUDINARY_CLOUD_NAME
    });
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
}
