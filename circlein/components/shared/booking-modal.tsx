"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/sonner";

export function BookingModal({ open, onOpenChange, amenityId, start, end }: { open: boolean; onOpenChange: (v: boolean) => void; amenityId: string; start: Date | null; end: Date | null; }) {
  const { data: session } = useSession();
  const [attendees, setAttendees] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setAttendees("");
  }, [open]);

  async function createBooking() {
    if (!start || !end) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amenityId, startTime: start.toISOString(), endTime: end.toISOString(), attendees: attendees.split(",").map((s) => s.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking");
      toast.success("Booking confirmed");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm">Attendees (optional, comma separated)</label>
            <input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="e.g. alice@example.com, Bob"
              className="mt-1 w-full rounded-md bg-background border px-3 py-2 focus-ring" />
          </div>
          <Button className="w-full" disabled={loading || !session?.user} onClick={createBooking}>{loading ? "Booking..." : "Confirm"}</Button>
          {!session?.user && <p className="text-xs text-muted-foreground text-center">Please sign in first.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
