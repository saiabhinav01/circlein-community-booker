import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverTimestamp, Timestamp } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
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
        createdAt: serverTimestamp(),
      });
    });

    return NextResponse.json({ ok: true, status });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
