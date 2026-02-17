import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth-buttons";

export default async function Home() {
  const { userId } = await auth();
  
  // Redirect logged-in users to dashboard
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">
            Flashy Cardy
          </h1>
          <p className="text-2xl text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        
        <AuthButtons />
      </div>
    </div>
  );
}
