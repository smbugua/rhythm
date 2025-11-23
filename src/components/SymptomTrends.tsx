"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyLog } from "@/lib/supabase";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { subDays, format, parseISO, isWithinInterval } from "date-fns";

interface SymptomTrendsProps {
  dailyLogs: DailyLog[];
}

const moodLabels = ["", "Very Low", "Low", "Okay", "Good", "Great"];
const energyLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];
const moodEmojis = ["", "😢", "😔", "😐", "😊", "😄"];
const energyEmojis = ["", "😴", "🥱", "😌", "💪", "⚡"];

function getAverageForPeriod(logs: DailyLog[], field: "mood" | "energy"): number | null {
  const values = logs.filter(log => log[field] !== null).map(log => log[field] as number);
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function getTopSymptoms(logs: DailyLog[], limit: number = 5): { symptom: string; count: number }[] {
  const symptomCounts: Record<string, number> = {};

  logs.forEach(log => {
    if (log.symptoms) {
      log.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    }
  });

  return Object.entries(symptomCounts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function getMoodTrend(logs: DailyLog[]): "up" | "down" | "stable" | null {
  if (logs.length < 4) return null;

  const sortedLogs = [...logs].sort((a, b) =>
    new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
  );

  const firstHalf = sortedLogs.slice(0, Math.floor(sortedLogs.length / 2));
  const secondHalf = sortedLogs.slice(Math.floor(sortedLogs.length / 2));

  const firstAvg = getAverageForPeriod(firstHalf, "mood");
  const secondAvg = getAverageForPeriod(secondHalf, "mood");

  if (firstAvg === null || secondAvg === null) return null;

  const diff = secondAvg - firstAvg;
  if (diff > 0.5) return "up";
  if (diff < -0.5) return "down";
  return "stable";
}

export function SymptomTrends({ dailyLogs }: SymptomTrendsProps) {
  const today = new Date();
  const last7Days = dailyLogs.filter(log =>
    isWithinInterval(parseISO(log.log_date), {
      start: subDays(today, 7),
      end: today
    })
  );

  const last30Days = dailyLogs.filter(log =>
    isWithinInterval(parseISO(log.log_date), {
      start: subDays(today, 30),
      end: today
    })
  );

  const avgMood7Days = getAverageForPeriod(last7Days, "mood");
  const avgEnergy7Days = getAverageForPeriod(last7Days, "energy");
  const topSymptoms = getTopSymptoms(last30Days);
  const moodTrend = getMoodTrend(last30Days);

  // Get recent logs for the mini chart
  const recentLogs = [...last7Days]
    .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
    .slice(-7);

  if (dailyLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Mood & Symptom Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Start logging your mood and symptoms to see trends over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Mood & Symptom Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 7-day averages */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Avg Mood (7 days)</div>
            <div className="flex items-center gap-2">
              {avgMood7Days !== null ? (
                <>
                  <span className="text-2xl">{moodEmojis[Math.round(avgMood7Days)]}</span>
                  <span className="text-sm font-medium">{moodLabels[Math.round(avgMood7Days)]}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No data</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Avg Energy (7 days)</div>
            <div className="flex items-center gap-2">
              {avgEnergy7Days !== null ? (
                <>
                  <span className="text-2xl">{energyEmojis[Math.round(avgEnergy7Days)]}</span>
                  <span className="text-sm font-medium">{energyLabels[Math.round(avgEnergy7Days)]}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No data</span>
              )}
            </div>
          </div>
        </div>

        {/* Mood mini chart */}
        {recentLogs.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Last 7 Days
            </div>
            <div className="flex items-end gap-1 h-12">
              {recentLogs.map((log, index) => {
                const moodHeight = log.mood ? (log.mood / 5) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/60 rounded-t-sm transition-all"
                      style={{ height: `${moodHeight}%` }}
                      title={`${format(parseISO(log.log_date), "MMM d")}: ${log.mood ? moodLabels[log.mood] : "No data"}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {format(parseISO(log.log_date), "d")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mood trend */}
        {moodTrend && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className={`h-4 w-4 ${
              moodTrend === "up" ? "text-green-500" :
              moodTrend === "down" ? "text-red-500 rotate-180" :
              "text-muted-foreground"
            }`} />
            <span className="text-muted-foreground">
              {moodTrend === "up" && "Mood improving over 30 days"}
              {moodTrend === "down" && "Mood declining over 30 days"}
              {moodTrend === "stable" && "Mood stable over 30 days"}
            </span>
          </div>
        )}

        {/* Top symptoms */}
        {topSymptoms.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Top symptoms (30 days)</div>
            <div className="flex flex-wrap gap-2">
              {topSymptoms.map(({ symptom, count }) => (
                <span
                  key={symptom}
                  className="px-2 py-1 text-xs bg-secondary rounded-full"
                >
                  {symptom} ({count})
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
