"use client";

import { useActionState } from "react";
import { resetPassword } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useModalStore } from "@/hooks/use-modal-store";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, isPending] = useActionState(resetPassword, undefined);
  const router = useRouter();
  const { openModal } = useModalStore();

  useEffect(() => {
    if (state?.success) {
      toast.success("Password reset successfully!");
      router.push("/"); // Go to home
      setTimeout(() => openModal("login"), 500); // Open login modal
    } else if (state?.message) {
      // Show error if it's not a success message
      toast.error(state.message);
    }
  }, [state, router, openModal]);

  return (
    <form action={action} className="space-y-4">
      {/* Hidden input to pass the token to the server action */}
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <p className="text-sm text-gray-500 text-center mb-6">
          Reset the password of your{" "}
          <span className="font-playfair-display text-black font-semibold">
            shortcut
          </span>{" "}
          account.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" required />
        {state?.errors?.password && (
          <p className="text-sm text-red-500">{state.errors.password[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
        />
        {state?.errors?.confirmPassword && (
          <p className="text-sm text-red-500">
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-black text-white"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
}
