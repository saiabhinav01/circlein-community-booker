"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getFirestore, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export default function AdminAccessCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [code, setCode] = useState("");

  useEffect(() => {
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    const unsub = onSnapshot(collection(db, "accessCodes"), (snap) => {
      setCodes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  async function createCode() {
    try {
      const { app } = getFirebaseServices();
      const db = getFirestore(app);
      await addDoc(collection(db, "accessCodes"), { code, isUsed: false, createdAt: new Date() });
      setCode("");
      toast.success("Code created");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function markUnused(id: string) {
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    await updateDoc(doc(db, "accessCodes", id), { isUsed: false, usedBy: null });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Access Codes</h1>
        <p className="text-muted-foreground">Create and manage access codes for new residents.</p>
      </div>
      <div className="rounded-xl border p-4 space-y-3">
        <input className="rounded-md bg-background border px-3 py-2" placeholder="New code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button onClick={createCode}>Create</Button>
      </div>
      <div className="rounded-xl border divide-y">
        {codes.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.code}</div>
              <div className="text-sm text-muted-foreground">{c.isUsed ? `Used by ${c.usedBy ?? ''}` : 'Not used'}</div>
            </div>
            {c.isUsed && <Button variant="secondary" onClick={() => markUnused(c.id)}>Mark unused</Button>}
          </div>
        ))}
        {codes.length === 0 && <div className="p-6 text-sm text-muted-foreground">No codes yet.</div>}
      </div>
    </div>
  );
}
