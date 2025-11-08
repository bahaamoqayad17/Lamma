import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/cookie";

export async function GET() {
  try {
    const session = await getUserFromCookie();
    if (!session) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
