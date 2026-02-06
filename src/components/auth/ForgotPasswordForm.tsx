"use client";

import { useState } from "react";
import { useModalStore } from "@/hooks/use-modal-store";
import { requestPasswordReset } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const { openModal } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await requestPasswordReset(null, formData);
      toast.success("Check your email for the reset link!");
      openModal("login"); // Return to login screen
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-gray-500 text-center mb-4">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="name@example.com"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-black hover:bg-zinc-800 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <button
        type="button"
        onClick={() => openModal("login")}
        className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-black mt-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Log In
      </button>
    </form>
  );
}
