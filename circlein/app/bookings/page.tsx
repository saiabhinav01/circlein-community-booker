"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { collection, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BookingSwapModal } from "@/components/shared/booking-swap-modal";
import { QrModal } from "@/components/shared/qr-modal";
import { toast } from "@/components/ui/sonner";

interface BookingRow { id: string; amenityId: string; startTime: any; endTime: any; status: string; qrId: string; }

export default function MyBookingsPage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [openSwap, setOpenSwap] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [openQr, setOpenQr] = useState(false);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (!session?.user?.email) return;
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    const userId = (session.user as any).id ?? session.user.email!;
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", userId),
      orderBy("startTime", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: BookingRow[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setRows(list);
    });
    return () => unsub();
  }, [session?.user?.email]);

  async function cancelBooking(id: string) {
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      toast.success("Booking cancelled");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>

      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 text-sm text-muted-foreground border-b">
          <div className="col-span-4">Amenity</div>
          <div className="col-span-3">Start</div>
          <div className="col-span-3">End</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {rows.map((r) => {
            const start = (r.startTime as any).toDate?.() ?? new Date(r.startTime.seconds * 1000);
            const end = (r.endTime as any).toDate?.() ?? new Date(r.endTime.seconds * 1000);
            return (
              <div key={r.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
                <div className="col-span-4 truncate">{r.amenityId}</div>
                <div className="col-span-3">{format(start, "PP p")}</div>
                <div className="col-span-3">{format(end, "PP p")}</div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setQrValue(r.qrId); setOpenQr(true); }}>QR</Button>
                  <Button variant="secondary" size="sm" onClick={() => { setSelectedBookingId(r.id); setOpenSwap(true); }}>Request Swap</Button>
                  <Button variant="destructive" size="sm" onClick={() => cancelBooking(r.id)}>Cancel</Button>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">No bookings yet.</div>
          )}
        </div>
      </div>

      <BookingSwapModal open={openSwap} onOpenChange={setOpenSwap} bookingId={selectedBookingId} />
      <QrModal open={openQr} onOpenChange={setOpenQr} value={qrValue} />
    </div>
  );
}
