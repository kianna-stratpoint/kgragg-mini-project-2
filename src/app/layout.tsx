import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/providers/ModalProvider";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";
import TopNavBar from "@/components/layout/TopNavBar";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "shortcut: Read. Write. Ride.",
  description:
    "A community blogging platform to share your thoughts and stories with fellow Filipino commuters.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ModalProvider />
        <Toaster position="bottom-right" />

        <TopNavBar />

        <div className="flex min-h-[calc(100vh-80px)]">
          <DesktopSidebar user={user} />
          <main className="flex-1 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
