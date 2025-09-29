"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Shield, SquareGanttChart, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "resident";
  const isAuthRoute = pathname?.startsWith("/auth");

  const links = [
    { href: "/", label: "Dashboard", icon: SquareGanttChart },
    { href: "/bookings", label: "My Bookings", icon: UsersRound },
  ];

  if (role === "admin") {
    links.push({ href: "/admin", label: "Admin Panel", icon: Shield });
  }

  // On auth routes or when not authenticated, render content without sidebar
  if (isAuthRoute || !session?.user) {
    return <main className="min-h-dvh bg-background">{children}</main>;
  }

  return (
    <div className="min-h-dvh grid grid-cols-[260px_1fr] md:grid-cols-[260px_1fr]">
      <aside className="hidden md:flex flex-col border-r bg-slate-900/50">
        <div className="h-16 flex items-center px-4 border-b">
          <Link href="/" className="text-lg font-semibold">CircleIn</Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} className={cn("flex items-center gap-2 px-3 py-2 rounded-md text-sm", active ? "bg-slate-800 text-white" : "text-muted-foreground hover:bg-slate-800/60 hover:text-foreground")}> 
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        {session?.user && (
          <div className="p-3 border-t">
            <Button variant="secondary" className="w-full" type="button" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        )}
      </aside>
      <div className="md:hidden border-b bg-slate-900/50">
        <div className="h-14 px-3 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <nav className="p-2 space-y-1">
                {links.map((l) => {
                  const Icon = l.icon;
                  const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
                  return (
                    <Link key={l.href} href={l.href} className={cn("flex items-center gap-2 px-3 py-2 rounded-md text-sm", active ? "bg-slate-800 text-white" : "text-muted-foreground hover:bg-slate-800/60 hover:text-foreground")}> 
                      <Icon className="h-4 w-4" />
                      {l.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="text-base font-semibold">CircleIn</Link>
          <div className="w-9" />
        </div>
      </div>
      <main className="min-h-dvh bg-background">{children}</main>
    </div>
  );
}
