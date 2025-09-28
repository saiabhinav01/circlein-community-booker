"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getFirestore, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export default function AdminAmenitiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    const unsub = onSnapshot(collection(db, "amenities"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  async function createAmenity() {
    try {
      const { app } = getFirebaseServices();
      const db = getFirestore(app);
      await addDoc(collection(db, "amenities"), {
        name, description, imageUrl,
        rules: { maxSlotsPerFamily: 1, blackoutDates: [] },
      });
      setName(""); setDescription(""); setImageUrl("");
      toast.success("Amenity created");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function remove(id: string) {
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    await deleteDoc(doc(db, "amenities", id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Amenities</h1>
        <p className="text-muted-foreground">Create and manage amenities and their rules.</p>
      </div>
      <div className="rounded-xl border p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input className="rounded-md bg-background border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded-md bg-background border px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="rounded-md bg-background border px-3 py-2" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        <Button onClick={createAmenity}>Create</Button>
      </div>
      <div className="rounded-xl border divide-y">
        {items.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-muted-foreground">{a.description}</div>
            </div>
            <Button variant="destructive" onClick={() => remove(a.id)}>Delete</Button>
          </div>
        ))}
        {items.length === 0 && <div className="p-6 text-sm text-muted-foreground">No amenities yet.</div>}
      </div>
    </div>
  );
}
