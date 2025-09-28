import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdminByEmail } from "@/lib/admin-check";
import { AdminNav } from "./nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");
  const admin = await isAdminByEmail(session.user.email);
  if (!admin) redirect("/");
  return (
    <div className="p-6 space-y-6">
      <AdminNav />
      {children}
    </div>
  );
}
