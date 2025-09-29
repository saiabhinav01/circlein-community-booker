"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body className="min-h-dvh grid place-items-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
          {process.env.NODE_ENV !== 'production' && error?.message && (
            <pre className="mt-4 text-xs text-muted-foreground max-w-md mx-auto whitespace-pre-wrap">{error.message}</pre>
          )}
        </div>
      </body>
    </html>
  );
}
