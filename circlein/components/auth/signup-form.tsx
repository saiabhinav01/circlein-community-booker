"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useSession } from "next-auth/react";

export function SignUpForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const user = session?.user as any;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) {
      toast.error("Please sign in first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name: user.name, email: user.email, uid: user.id ?? user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign up");
      toast.success("Access granted. Welcome!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm" htmlFor="code">Unique Access Code</label>
        <input id="code" name="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your code" 
          className="w-full rounded-md bg-background border px-3 py-2 focus-ring" required />
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Validating..." : "Validate & Continue"}</Button>
    </form>
  );
}
