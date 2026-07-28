"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevResetUrl("");

    const formData = new FormData(e.currentTarget);
    const res = await requestPasswordReset(formData);

    if ("error" in res) {
      setError(res.error);
    } else {
      setMessage(res.message || "Reset link sent.");
      if (res.devResetUrl) setDevResetUrl(res.devResetUrl);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md shadow-xl border-border animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 mb-4">
            Q
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
          <CardDescription>
            Enter your registered email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="flex items-start gap-2 rounded-md bg-success/10 border border-success/20 p-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}
            {devResetUrl && (
              <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                <p className="font-bold">Development mode — email service not configured.</p>
                <a href={devResetUrl} className="inline-flex items-center gap-1 font-semibold underline break-all">
                  Open reset link <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
