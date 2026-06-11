import React from "react";
import db from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Award, Medal, User, Percent, Star, Target } from "lucide-react";

export const revalidate = 30; // short cache for active score updates

export const metadata = {
  title: "Global Leaderboard",
  description:
    "Daily, weekly, monthly, and all-time rankings of top mock test performers. Compare your score and accuracy against the best.",
  alternates: { canonical: "/leaderboard" },
};

export default async function LeaderboardPage() {
  // Admin-configurable number of rows per leaderboard tab.
  const leaderboardSize = Math.min(100, Math.max(1, parseInt(await getSetting("leaderboard_size"), 10) || 20));

  // Helper to fetch leaderboard data for a time window. We aggregate per user
  // so each student appears once with their best-scoring attempt in the window.
  const getLeaderboardData = async (sinceDate?: Date) => {
    try {
      const where: any = {
        status: "COMPLETED"
      };

      if (sinceDate) {
        where.createdAt = {
          gte: sinceDate
        };
      }

      const attempts = await db.quizAttempt.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          score: "desc"
        }
      });

      // Reduce to each user's single best attempt (attempts are score-desc, so
      // the first one we see per user is their best).
      const bestByUser = new Map<string, { name: string; score: number; percentage: number }>();
      for (const a of attempts) {
        if (!bestByUser.has(a.user.id)) {
          bestByUser.set(a.user.id, {
            name: a.user.name || "Anonymous Student",
            score: a.score,
            percentage: a.percentage,
          });
        }
      }

      return Array.from(bestByUser.values())
        .sort((x, y) => y.score - x.score)
        .slice(0, leaderboardSize)
        .map((u, index) => ({
          rank: index + 1,
          name: u.name,
          score: u.score,
          percentage: u.percentage,
          accuracy: Math.max(0, Math.round(u.percentage)),
        }));
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      return [];
    }
  };

  const now = new Date();
  
  // Daily: last 24h
  const dailyDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  // Weekly: last 7 days
  const weeklyDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  // Monthly: last 30 days
  const monthlyDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dailyList = await getLeaderboardData(dailyDate);
  const weeklyList = await getLeaderboardData(weeklyDate);
  const monthlyList = await getLeaderboardData(monthlyDate);
  const allTimeList = await getLeaderboardData();

  const renderLeaderboardTable = (list: any[]) => {
    if (list.length === 0) {
      return (
        <div className="border border-border/40 rounded-lg bg-white dark:bg-slate-900 mt-4 p-10 text-center text-sm text-muted-foreground">
          No ranked attempts in this period yet. Be the first to top the board!
        </div>
      );
    }
    return (
      <div className="overflow-x-auto w-full border border-border/40 rounded-lg bg-white dark:bg-slate-900 mt-4">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-border/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4 w-20">Rank</th>
              <th className="p-4">Student Name</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4 text-center">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {list.map((item) => {
              const isTop3 = item.rank <= 3;
              return (
                <tr 
                  key={item.rank}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                >
                  <td className="p-4 font-bold">
                    {item.rank === 1 ? (
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500 text-white shadow-sm">
                        <Trophy className="h-4 w-4" />
                      </span>
                    ) : item.rank === 2 ? (
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-300 text-slate-800 shadow-sm">
                        <Award className="h-4 w-4" />
                      </span>
                    ) : item.rank === 3 ? (
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-600 text-white shadow-sm">
                        <Medal className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="pl-3 text-muted-foreground">#{item.rank}</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> {item.name}
                  </td>
                  <td className="p-4 text-center font-bold text-primary">
                    {item.score} pts
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                      <Target className="h-3 w-3" /> {item.accuracy}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-yellow-200/20">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> Leaderboard Hall of Fame
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Global Rankings
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl mx-auto">
            Benchmark your results. Compare your score and speed against top performers globally.
          </p>
        </div>

        {/* Tab Controls */}
        <Tabs defaultValue="all-time" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all-time">All-Time</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base font-bold">Daily Leaderboard</CardTitle>
                <CardDescription>Top scoring attempts completed in the last 24 hours.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {renderLeaderboardTable(dailyList)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base font-bold">Weekly Leaderboard</CardTitle>
                <CardDescription>Top scoring attempts completed in the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {renderLeaderboardTable(weeklyList)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base font-bold">Monthly Leaderboard</CardTitle>
                <CardDescription>Top scoring attempts completed in the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {renderLeaderboardTable(monthlyList)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-time">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base font-bold">All-Time Leaderboard</CardTitle>
                <CardDescription>Historic top scorers across the entire platform.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {renderLeaderboardTable(allTimeList)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
