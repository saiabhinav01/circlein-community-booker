"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function BookingSwapModal({ open, onOpenChange, bookingId }: { open: boolean; onOpenChange: (v: boolean) => void; bookingId: string | null; }) {
  const [targetBookingId, setTargetBookingId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setTargetBookingId("");
  }, [open]);

  async function submit() {
    if (!bookingId || !targetBookingId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/swap/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, targetBookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request swap");
      toast.success("Swap request sent");
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
          <DialogTitle>Request a slot swap</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm">Target Booking ID</label>
            <input value={targetBookingId} onChange={(e) => setTargetBookingId(e.target.value)} placeholder="Enter target booking ID"
              className="mt-1 w-full rounded-md bg-background border px-3 py-2 focus-ring" />
            <p className="text-xs text-muted-foreground mt-1">Paste the booking ID you want to swap with.</p>
          </div>
          <Button className="w-full" onClick={submit} disabled={loading || !bookingId}>{loading ? "Sending..." : "Send Request"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
