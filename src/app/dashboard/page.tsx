import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Plus,
  Brain,
  Trophy,
  Calendar
} from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Mock data - in a real app, this would come from your database
  const stats = {
    totalCards: 156,
    studiedToday: 23,
    streakDays: 7,
    accuracy: 87,
    totalDecks: 12,
    weeklyGoal: 150,
    weeklyProgress: 89
  };

  const recentActivity = [
    { id: 1, action: "Completed", deck: "Spanish Vocabulary", score: 92, time: "2 hours ago" },
    { id: 2, action: "Created", deck: "React Hooks", score: null, time: "5 hours ago" },
    { id: 3, action: "Studied", deck: "Math Formulas", score: 78, time: "1 day ago" },
    { id: 4, action: "Completed", deck: "History Facts", score: 95, time: "2 days ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back to your Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your learning progress and manage your flashcard decks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <p className="text-xs text-muted-foreground">+12 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Studied Today</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studiedToday}</div>
              <p className="text-xs text-muted-foreground">Great progress!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streakDays}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accuracy}%</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Progress
              </CardTitle>
              <CardDescription>
                You've studied {stats.weeklyProgress} out of {stats.weeklyGoal} cards this week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={(stats.weeklyProgress / stats.weeklyGoal) * 100} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{stats.weeklyProgress} cards</span>
                <span>{stats.weeklyGoal - stats.weeklyProgress} remaining</span>
              </div>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{day}</div>
                    <div className={`h-8 rounded-sm ${
                      index < 4 ? 'bg-primary' : index === 4 ? 'bg-primary/60' : 'bg-muted'
                    }`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump into your learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create New Deck
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Study Random Cards
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Review Difficult Cards
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Continue Last Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest study sessions and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {activity.action === 'Completed' ? '✓' : activity.action === 'Created' ? '+' : '📚'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium leading-none">
                          {activity.action} <span className="font-normal">{activity.deck}</span>
                        </p>
                        {activity.score && (
                          <Badge variant={activity.score >= 90 ? "default" : activity.score >= 70 ? "secondary" : "destructive"}>
                            {activity.score}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}