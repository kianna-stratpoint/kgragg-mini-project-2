"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/hooks/use-modal-store";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function AuthModal() {
  const { isOpen, closeModal, view } = useModalStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) closeModal();
  };

  const getTitle = () => {
    if (view === "login") return "Log In";
    if (view === "signup") return "Sign Up";
    return "Reset Password";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-100 bg-white p-8"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-medium mb-6">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        {view === "login" && <LoginForm />}
        {view === "signup" && <SignUpForm />}
        {view === "forgot-password" && <ForgotPasswordForm />}
      </DialogContent>
    </Dialog>
  );
}
