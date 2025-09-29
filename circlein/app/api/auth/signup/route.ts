import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, email, uid, role } = body as { code: string; name: string; email: string; uid: string; role?: 'resident' | 'admin' };
    if (!code || !name || !email || !uid) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const snap = await adminDb.collection("accessCodes").where("code", "==", code).limit(1).get();
    if (snap.empty) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 400 });
    }
    const doc = snap.docs[0];
    const data = doc.data() as any;
    if (data.isUsed) {
      return NextResponse.json({ error: "Access code already used" }, { status: 400 });
    }
    // If access code has a role, enforce it (e.g., admin-only)
    if (data.role && data.role !== role) {
      return NextResponse.json({ error: `This code is restricted to ${data.role}` }, { status: 403 });
    }

    await adminDb.runTransaction(async (tx) => {
      tx.update(doc.ref, { isUsed: true, usedBy: uid });
      const userRef = adminDb.collection("users").doc(uid);
      tx.set(userRef, { name, email, role: role ?? "resident", createdAt: Timestamp.now() }, { merge: true });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
