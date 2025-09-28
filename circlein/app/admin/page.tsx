"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import { Card } from "@/components/shared/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);

  useEffect(() => {
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    const unsub1 = onSnapshot(collection(db, "bookings"), (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    const unsub2 = onSnapshot(collection(db, "amenities"), (snap) => {
      setAmenities(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const usageData = useMemo(() => {
    const byAmenity: Record<string, number> = {};
    for (const b of bookings) byAmenity[b.amenityId] = (byAmenity[b.amenityId] ?? 0) + 1;
    return Object.entries(byAmenity).map(([k, v]) => ({ name: k.slice(0, 6), count: v }));
  }, [bookings]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Total Amenities" value={amenities.length} />
        <Card title="Total Bookings" value={bookings.length} />
        <Card title="Confirmed" value={bookings.filter((b) => b.status === 'confirmed').length} />
      </div>
      <div className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Usage by Amenity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
