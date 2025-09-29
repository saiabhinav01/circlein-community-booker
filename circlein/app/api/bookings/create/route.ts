import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { Timestamp } from "firebase-admin/firestore";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id ?? session.user.email!;
  try {
    const body = await req.json();
    const { amenityId, startTime, endTime, attendees } = body as { amenityId: string; startTime: string; endTime: string; attendees?: string[] };
    if (!amenityId || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const start = Timestamp.fromDate(new Date(startTime));
    const end = Timestamp.fromDate(new Date(endTime));

    const adminDb = getAdminDb();
    const amenityRef = adminDb.collection("amenities").doc(amenityId);
    const bookingsRef = adminDb.collection("bookings");

    // Validation: existing booking overlap for same slot
    const conflictSnap = await bookingsRef
      .where("amenityId", "==", amenityId)
      .where("startTime", "==", start)
      .get();
    const isFull = !conflictSnap.empty;

    const qrId = uuidv4();
    const status = isFull ? "waitlisted" : "confirmed";

    await adminDb.runTransaction(async (tx) => {
      // Optional: enforce amenity rules like maxSlotsPerFamily
      const amenityDoc = await tx.get(amenityRef);
      if (!amenityDoc.exists) throw new Error("Amenity not found");

      tx.set(bookingsRef.doc(), {
        amenityId,
        userId,
        attendees: attendees ?? [],
        startTime: start,
        endTime: end,
        status,
        qrId,
        createdAt: Timestamp.now(),
      });
    });

    // Send email notification (best-effort)
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey && session.user?.email) {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "CircleIn <noreply@circlein.app>",
          to: session.user.email,
          subject: `Booking ${status === 'waitlisted' ? 'request (waitlisted)' : 'confirmed'}`,
          html: `<p>Your booking for amenity ${amenityId} starting ${new Date(startTime).toLocaleString()} is ${status}.</p>`,
        });
      }
    } catch {}

    return NextResponse.json({ ok: true, status });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
