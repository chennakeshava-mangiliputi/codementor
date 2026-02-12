import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import { getTokenFromCookie, verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // 🔐 Get token
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();

    const newSession = await Session.create({
      userId: decoded.userId,
      ...body,
    });

    return NextResponse.json({ success: true, session: newSession });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
