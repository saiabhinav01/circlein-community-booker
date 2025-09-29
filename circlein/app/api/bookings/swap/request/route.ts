import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { bookingId, targetBookingId } = await req.json();
    if (!bookingId || !targetBookingId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const bookings = adminDb.collection("bookings");
    const [aSnap, bSnap] = await Promise.all([bookings.doc(bookingId).get(), bookings.doc(targetBookingId).get()]);
    if (!aSnap.exists || !bSnap.exists) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    const a = aSnap.data() as any;
    const userId = (session.user as any).id ?? session.user.email!;
    if (a.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await adminDb.collection("bookingSwaps").add({
      requesterBookingId: bookingId,
      targetBookingId,
      requesterId: userId,
      status: "pending",
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
