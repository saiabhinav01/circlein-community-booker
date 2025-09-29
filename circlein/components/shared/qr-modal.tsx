"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";

export function QrModal({ open, onOpenChange, value }: { open: boolean; onOpenChange: (v: boolean) => void; value: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking QR</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <div className="rounded-md bg-white p-4">
            <QRCode value={value} size={192} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
