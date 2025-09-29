import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow">
        <h1 className="text-xl font-semibold">Join CircleIn</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your details and validate your access code.</p>
        <div className="mt-6">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
