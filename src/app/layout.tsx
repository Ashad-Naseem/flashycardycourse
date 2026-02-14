import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlashyCardy Course",
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
        <body className={`${poppins.variable} antialiased`}>
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
              <Link href="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
                FlashyCardy Course
              </Link>
              <div className="flex items-center gap-4">
                <SignedIn>
                  <nav className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  </nav>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="outline">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button>Sign Up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
