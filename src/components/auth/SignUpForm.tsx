"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useModalStore } from "@/hooks/use-modal-store";
import { signup } from "@/lib/actions/auth.actions";
import { SignupFormSchema } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";

type SignUpFormValues = z.infer<typeof SignupFormSchema>;

export function SignUpForm() {
  const { openModal } = useModalStore();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignupFormSchema),
  });

  const onSubmit = (values: SignUpFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);

      const result = await signup(undefined, formData);

      if (result?.errors) {
        // Show the first error found
        const firstError = Object.values(result.errors)[0];
        toast.error(firstError ? firstError[0] : "Registration failed");
      } else if (result?.message === "Account created successfully!") {
        toast.success("Account created! Please log in.");
        openModal("login");
      } else {
        toast.error(result?.message || "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Your First Name"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Your Last Name"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="text-center text-sm pt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => openModal("login")}
          className="font-bold hover:underline"
        >
          Log in.
        </button>
      </div>

      <Button
        type="submit"
        className="w-full bg-black hover:bg-zinc-800 text-white"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
