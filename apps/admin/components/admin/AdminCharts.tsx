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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { ChartBox } from "../shared/ChartBox";
import { TrendingUp, Activity, Layers } from "lucide-react";

export interface TrendPoint {
  label: string;
  value: number;
}

interface AdminChartsProps {
  userGrowth: TrendPoint[];     // cumulative users per day (last 14 days)
  attemptTrend: TrendPoint[];   // attempts per day (last 14 days)
  popularCategories: TrendPoint[]; // attempts per category
}

export function AdminCharts({ userGrowth, attemptTrend, popularCategories }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Growth */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> User Growth (14 days)
          </CardTitle>
          <CardDescription className="text-xs">Cumulative registered users per day.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 min-w-0">
          <ChartBox height={200}>
            {({ width, height }) => (
              <LineChart width={width} height={height} data={userGrowth} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="Users" stroke="#2563EB" strokeWidth={2.5} dot={false} />
              </LineChart>
            )}
          </ChartBox>
        </CardContent>
      </Card>

      {/* Attempts Trend */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-primary" /> Quiz Attempts (14 days)
          </CardTitle>
          <CardDescription className="text-xs">Completed attempts per day.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 min-w-0">
          <ChartBox height={200}>
            {({ width, height }) => (
              <BarChart width={width} height={height} data={attemptTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Attempts" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ChartBox>
        </CardContent>
      </Card>

      {/* Popular Categories */}
      <Card className="p-6 lg:col-span-2">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" /> Popular Categories
          </CardTitle>
          <CardDescription className="text-xs">Total completed attempts per category.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 min-w-0">
          {popularCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">No attempts recorded yet.</p>
          ) : (
            <ChartBox height={220}>
              {({ width, height }) => (
                <BarChart width={width} height={height} data={popularCategories} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Attempts" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ChartBox>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
