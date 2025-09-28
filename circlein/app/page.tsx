export default function HomePage() {
  return (
    <div className="p-8">
      <div className="rounded-xl border bg-card text-card-foreground shadow gradient-primary p-[1px]">
        <div className="rounded-xl bg-background p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to CircleIn</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your community amenities.</p>
        </div>
      </div>
    </div>
  );
}
