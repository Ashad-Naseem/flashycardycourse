import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import { ClerkHeader } from "@/components/clerk-header";
import Link from "next/link";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flashy Cardy Course",
  description: "Learn with flashcards powered by Clerk authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" className={`${poppins.variable} dark`}>
        <body 
          className={`${poppins.variable} antialiased`}
          suppressHydrationWarning={true}
        >
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
              <Link href="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
                Flashy Cardy Course
              </Link>
              <ClerkHeader />
            </div>
          </header>
          <main>{children}</main>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
