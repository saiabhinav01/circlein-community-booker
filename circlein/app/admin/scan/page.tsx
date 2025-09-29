"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export default function AdminScanPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const s = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    s.render(async (decodedText) => {
      setLast(decodedText);
      try {
        const res = await fetch(`/api/admin/checkin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qrId: decodedText }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Check-in failed");
        toast.success("Checked in");
      } catch (e: any) {
        toast.error(e.message);
      }
    }, () => {});
    setScanner(s);
    return () => { s.clear(); };
  }, [ref]);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">QR Scanner</h1>
      <div id="qr-reader" ref={ref} />
      {last && <div className="text-xs text-muted-foreground">Last: {last}</div>}
      <Button variant="secondary" onClick={() => { if (scanner) { scanner.clear(); location.reload(); } }}>Reset</Button>
    </div>
  );
}
