import { getAdminDb } from "@/lib/firebase/admin";

export async function isAdminByEmail(email: string): Promise<boolean> {
  const adminDb = getAdminDb();
  const snap = await adminDb.collection("users").where("email", "==", email).limit(1).get();
  if (snap.empty) return false;
  const data = snap.docs[0].data() as any;
  return data.role === "admin";
}
