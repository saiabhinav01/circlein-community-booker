import Link from "next/link";

export function AdminNav() {
  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/amenities", label: "Amenities" },
    { href: "/admin/access-codes", label: "Access Codes" },
    { href: "/admin/scan", label: "Scanner" },
    { href: "/admin/festival", label: "Festival Mode" },
  ];
  return (
    <div className="mb-4 flex gap-3 text-sm">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="rounded-md border px-3 py-1 hover:bg-muted">{l.label}</Link>
      ))}
    </div>
  );
}
