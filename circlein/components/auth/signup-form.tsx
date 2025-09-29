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
  const [name, setName] = useState("");
  const [role, setRole] = useState<"resident" | "admin">("resident");
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
        body: JSON.stringify({ code, name: name || user.name, email: user.email, uid: user.id ?? user.email, role }),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm" htmlFor="fullName">Full name</label>
          <input id="fullName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-md bg-background border px-3 py-2 focus-ring" />
        </div>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="role">Role</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full rounded-md bg-background border px-3 py-2 focus-ring">
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm" htmlFor="code">Unique Access Code</label>
        <input id="code" name="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your code" 
          className="w-full rounded-md bg-background border px-3 py-2 focus-ring" required />
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Validating..." : "Validate & Continue"}</Button>
    </form>
  );
}
