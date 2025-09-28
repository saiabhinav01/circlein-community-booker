"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export function SignInForm() {
  return (
    <div className="space-y-3">
      <Button onClick={() => signIn("google")} className="w-full" aria-label="Sign in with Google">
        <FcGoogle className="h-5 w-5 mr-2" /> Continue with Google
      </Button>
    </div>
  );
}
