import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  // Update type to reflect that it's a Promise
  searchParams: Promise<{ token?: string }>;
}) {
  // Await the params
  const { token } = await searchParams;

  if (!token) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
