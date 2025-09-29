"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BookingModal } from "@/components/shared/booking-modal";

interface BookingItem { id: string; startTime: any; endTime: any; status: string; }

export default function AmenityDetailPage() {
  const params = useParams<{ id: string }>();
  const amenityId = params.id;
  const [amenity, setAmenity] = useState<any | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    (async () => {
      const snap = await getDoc(doc(db, "amenities", amenityId));
      if (snap.exists()) setAmenity({ id: snap.id, ...snap.data() });
    })();
    const q = query(collection(db, "bookings"), where("amenityId", "==", amenityId), orderBy("startTime"));
    const unsub = onSnapshot(q, (snap) => {
      const list: BookingItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setBookings(list);
    });
    return () => unsub();
  }, [amenityId]);

  const todaySlots = useMemo(() => {
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const slots: { start: Date; end: Date; isBooked: boolean }[] = [];
    for (let i = 0; i < 10; i++) {
      const s = new Date(start.getTime() + i * 60 * 60 * 1000);
      const e = new Date(s.getTime() + 60 * 60 * 1000);
      const isBooked = bookings.some((b) => {
        const bs = (b.startTime as any).toDate?.() ?? new Date(b.startTime.seconds * 1000);
        return bs.getTime() === s.getTime() && b.status === "confirmed";
      });
      slots.push({ start: s, end: e, isBooked });
    }
    return slots;
  }, [bookings]);

  if (!amenity) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{amenity.name}</h1>
          <p className="text-muted-foreground">{amenity.description}</p>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4">
          {todaySlots.map((slot, idx) => (
            <Button
              key={idx}
              variant={slot.isBooked ? "secondary" : "default"}
              disabled={slot.isBooked}
              onClick={() => { setSelectedSlot({ start: slot.start, end: slot.end }); setOpen(true); }}
            >
              {format(slot.start, "p")} - {format(slot.end, "p")}
            </Button>
          ))}
        </div>
      </div>

      <BookingModal
        open={open}
        onOpenChange={setOpen}
        amenityId={amenityId}
        start={selectedSlot?.start ?? null}
        end={selectedSlot?.end ?? null}
      />
    </div>
  );
}
