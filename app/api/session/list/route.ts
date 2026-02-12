import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import { getTokenFromCookie, verifyToken } from "@/lib/jwt";

export async function GET() {
  try {
    await dbConnect();

    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const sessions = await Session.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
