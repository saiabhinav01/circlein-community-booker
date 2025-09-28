import { SignInForm } from "@/components/auth/signin-form";

export default function SignInPage() {
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow">
        <h1 className="text-xl font-semibold">Sign in to CircleIn</h1>
        <p className="text-sm text-muted-foreground mt-1">Use your community account.</p>
        <div className="mt-6">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
