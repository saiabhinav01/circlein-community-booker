import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const adminDb = getAdminDb();
    const ref = adminDb.collection("bookings").doc(params.id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = snap.data() as any;
    const userId = (session.user as any).id ?? session.user.email!;
    if (data.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await ref.update({ status: "cancelled" });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
