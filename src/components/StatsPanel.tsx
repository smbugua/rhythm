"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleStats } from "@/lib/cycle-utils";
import { CalendarDays, Clock, TrendingUp, Heart } from "lucide-react";
import { format } from "date-fns";

interface StatsPanelProps {
  stats: CycleStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cycle Length</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageCycleLength ? `${stats.averageCycleLength} days` : "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            Average of last 3 cycles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Period Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averagePeriodDuration
              ? `${stats.averagePeriodDuration} days`
              : "—"}
          </div>
          <p className="text-xs text-muted-foreground">Average duration</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Period</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.predictedNextPeriod || "—"}
          </div>
          <p className="text-xs text-muted-foreground">Predicted date</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ovulation</CardTitle>
          <Heart className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.predictedOvulationDate
              ? format(stats.predictedOvulationDate, "MMM d")
              : "—"}
          </div>
          <p className="text-xs text-muted-foreground">Predicted ovulation</p>
        </CardContent>
      </Card>
    </div>
  );
}
