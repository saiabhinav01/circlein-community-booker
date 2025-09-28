import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdminByEmail } from "@/lib/admin-check";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await isAdminByEmail(session.user.email);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { qrId } = await req.json();
    if (!qrId) return NextResponse.json({ error: "Missing qrId" }, { status: 400 });
    const snap = await adminDb.collection("bookings").where("qrId", "==", qrId).limit(1).get();
    if (snap.empty) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    const ref = snap.docs[0].ref;
    await ref.update({ status: "confirmed", checkedInAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
