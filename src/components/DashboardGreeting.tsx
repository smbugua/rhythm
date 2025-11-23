"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleStats, CyclePhaseInfo, getPhaseHealthTips } from "@/lib/cycle-utils";
import { Sun, Moon, Sunrise, Sunset, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardGreetingProps {
  userName: string | null;
  stats: CycleStats; // Reserved for future use
  phaseInfo: CyclePhaseInfo;
}

function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours();

  if (hour < 6) {
    return { text: "Good night", icon: <Moon className="h-5 w-5" /> };
  } else if (hour < 12) {
    return { text: "Good morning", icon: <Sunrise className="h-5 w-5" /> };
  } else if (hour < 17) {
    return { text: "Good afternoon", icon: <Sun className="h-5 w-5" /> };
  } else if (hour < 21) {
    return { text: "Good evening", icon: <Sunset className="h-5 w-5" /> };
  } else {
    return { text: "Good night", icon: <Moon className="h-5 w-5" /> };
  }
}

function getPhaseColor(phase: string): string {
  switch (phase) {
    case "menstrual":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "follicular":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "ovulation":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "luteal":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
}

function getDailyInsight(phaseInfo: CyclePhaseInfo): string {
  const { phase, dayOfCycle, daysUntilNextPeriod } = phaseInfo;

  if (phase === "unknown") {
    return "Start tracking your cycle to get personalized insights.";
  }

  const insights: string[] = [];

  if (dayOfCycle) {
    insights.push(`Day ${dayOfCycle} of your cycle`);
  }

  if (daysUntilNextPeriod !== null && daysUntilNextPeriod > 0) {
    insights.push(`${daysUntilNextPeriod} days until next period`);
  } else if (daysUntilNextPeriod === 0) {
    insights.push("Period expected today");
  } else if (daysUntilNextPeriod !== null && daysUntilNextPeriod < 0) {
    insights.push(`Period is ${Math.abs(daysUntilNextPeriod)} days late`);
  }

  return insights.join(" • ");
}

export function DashboardGreeting({ userName, stats: _stats, phaseInfo }: DashboardGreetingProps) {
  void _stats; // Reserved for future use
  const greeting = getGreeting();
  const healthTips = getPhaseHealthTips(phaseInfo.phase);
  const displayName = userName?.split(" ")[0] || "there";

  return (
    <div className="space-y-4">
      {/* Greeting and Phase */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            {greeting.icon}
            <span className="text-sm">{greeting.text}</span>
          </div>
          <h1 className="text-2xl font-bold">
            {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getDailyInsight(phaseInfo)}
          </p>
        </div>

        {/* Cycle Phase Indicator */}
        {phaseInfo.phase !== "unknown" && (
          <div className={cn(
            "px-4 py-2 rounded-full text-sm font-medium",
            getPhaseColor(phaseInfo.phase)
          )}>
            {healthTips.title}
          </div>
        )}
      </div>

      {/* Health Tips Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Tips for Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {healthTips.tips.map((tip, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
