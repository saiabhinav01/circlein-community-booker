"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, getFirestore, onSnapshot, query, orderBy } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface AmenityItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { app } = getFirebaseServices();
    const db = getFirestore(app);
    const q = query(collection(db, "amenities"), orderBy("name"));
    const unsub = onSnapshot(q, (snap) => {
      const list: AmenityItem[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({ id: d.id, name: data.name, description: data.description, imageUrl: data.imageUrl });
      });
      setAmenities(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (!session?.user) {
    return (
      <div className="min-h-dvh grid place-items-center p-6">
        <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow text-center">
          <h1 className="text-xl font-semibold">Welcome to CircleIn</h1>
          <p className="text-sm text-muted-foreground mt-1">Please sign in to continue</p>
          <Link href="/auth/signin">
            <Button className="mt-4">Sign in with Google</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Amenities</h1>
          <p className="text-muted-foreground">Book community facilities in seconds.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {amenities.map((a) => (
            <motion.div key={a.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
              <div className="group overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
                <div className="h-40 bg-slate-800/40" style={{ backgroundImage: `url(${a.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{a.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                    </div>
                    <Link href={`/amenity/${a.id}`}>
                      <Button size="sm" className="group/button">
                        View <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
