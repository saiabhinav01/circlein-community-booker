import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdminByEmail } from "@/lib/admin-check";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await isAdminByEmail(session.user.email);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { amenityId, date } = await req.json();
    if (!amenityId || !date) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    await adminDb.collection("bookings").add({
      amenityId,
      userId: "admin",
      attendees: [],
      startTime: Timestamp.fromDate(start),
      endTime: Timestamp.fromDate(end),
      status: "confirmed",
      qrId: `festival-${amenityId}-${date}`,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
