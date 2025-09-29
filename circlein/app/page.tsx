import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-dvh bg-background">
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Book community amenities with ease</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">CircleIn brings a modern, accessible, and real-time booking experience to your residents.</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/auth/signin" className="inline-flex items-center rounded-md bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-medium text-white shadow hover:from-blue-400 hover:to-violet-400">Sign in</Link>
          <Link href="/auth/signup" className="inline-flex items-center rounded-md border px-5 py-3 text-sm">Validate access</Link>
        </div>
      </section>
    </main>
  );
}
