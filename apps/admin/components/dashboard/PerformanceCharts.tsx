"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { ChartBox } from "../shared/ChartBox";
import { TrendingUp, Layers, Target } from "lucide-react";

export interface AttemptPoint {
  label: string;       // e.g. "Test 1 (12/6)"
  percentage: number;
  accuracy: number;
}

export interface CategoryPerf {
  label: string;
  avgPercentage: number;
  attempts: number;
}

interface PerformanceChartsProps {
  attemptSeries: AttemptPoint[];
  categoryPerf: CategoryPerf[];
}

export function PerformanceCharts({ attemptSeries, categoryPerf }: PerformanceChartsProps) {
  if (attemptSeries.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No attempts recorded yet. Solve tests to unlock performance analytics!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score + Accuracy trend */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Performance & Accuracy Trend
          </CardTitle>
          <CardDescription className="text-xs">
            Score percentage and answering accuracy across your attempts (oldest → newest).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 min-w-0">
          <ChartBox height={220}>
            {({ width, height }) => (
              <LineChart width={width} height={height} data={attemptSeries} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="percentage" name="Score %" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ChartBox>
        </CardContent>
      </Card>

      {/* Category-wise performance */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" /> Category Performance
          </CardTitle>
          <CardDescription className="text-xs">Average score percentage per subject category.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 min-w-0">
          {categoryPerf.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No category data yet.</p>
          ) : (
            <ChartBox height={220}>
              {({ width, height }) => (
                <BarChart width={width} height={height} data={categoryPerf} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v, name) => name === "Avg Score %" ? `${v}%` : v} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="avgPercentage" name="Avg Score %" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attempts" name="Attempts" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ChartBox>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
