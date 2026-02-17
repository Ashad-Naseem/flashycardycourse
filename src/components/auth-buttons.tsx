"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignIn, SignUp } from "@clerk/nextjs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function AuthButtons() {
  const signInId = useId();
  const signUpId = useId();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="text-base" id={`${signInId}-trigger`}>
            Sign In
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" id={`${signInId}-content`}>
          <VisuallyHidden>
            <DialogTitle>Sign In to Flashy Cardy</DialogTitle>
          </VisuallyHidden>
          <SignIn 
            routing="hash"
            afterSignInUrl="/dashboard"
            signUpUrl="#"
          />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="text-base" id={`${signUpId}-trigger`}>
            Sign Up
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" id={`${signUpId}-content`}>
          <VisuallyHidden>
            <DialogTitle>Sign Up for Flashy Cardy</DialogTitle>
          </VisuallyHidden>
          <SignUp 
            routing="hash"
            afterSignUpUrl="/dashboard"
            signInUrl="#"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}