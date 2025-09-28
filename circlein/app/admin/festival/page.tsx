"use client";

import { useEffect, useState } from "react";
import { collection, getFirestore, onSnapshot, addDoc } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export default function FestivalModePage() {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [amenityId, setAmenityId] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    const unsub = onSnapshot(collection(db, "amenities"), (snap) => setAmenities(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, []);

  async function blockDay() {
    try {
      const res = await fetch("/api/admin/festival/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amenityId, date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to block");
      toast.success("Festival day blocked");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Festival Mode</h1>
      <div className="rounded-xl border p-4 space-y-3">
        <select className="rounded-md bg-background border px-3 py-2" value={amenityId} onChange={(e) => setAmenityId(e.target.value)}>
          <option value="">Select amenity</option>
          {amenities.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <input className="rounded-md bg-background border px-3 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button onClick={blockDay} disabled={!amenityId || !date}>Block Entire Day</Button>
      </div>
      <p className="text-sm text-muted-foreground">Blocks an amenity for the selected day by creating an all-day booking.</p>
    </div>
  );
}
