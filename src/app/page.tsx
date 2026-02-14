import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Trophy, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">
              FlashyCardy Course
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Master any subject with intelligent flashcards. Track your progress, 
              build learning streaks, and achieve your educational goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/dashboard">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="/dashboard">
                  <Brain className="mr-2 h-5 w-5" />
                  Start Learning
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Learning</CardTitle>
                <CardDescription>
                  AI-powered spaced repetition helps you learn more efficiently
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Track Progress</CardTitle>
                <CardDescription>
                  Monitor your learning streaks and celebrate achievements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Set Goals</CardTitle>
                <CardDescription>
                  Define learning objectives and stay motivated with weekly targets
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to start learning?</CardTitle>
              <CardDescription className="text-base">
                Join thousands of learners who trust FlashyCardy Course for their education
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="text-base">
                <Link href="/dashboard">
                  Access Your Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
