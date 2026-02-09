import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { redirect } from "next/navigation";

// 1. Make the function async
export default async function ResetPasswordPage({
  searchParams,
}: {
  // 2. Update the type to reflect that it's a Promise
  searchParams: Promise<{ token?: string }>;
}) {
  // 3. Await the params
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
