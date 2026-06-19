import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, LogIn } from "lucide-react";

export const metadata = {
  title: "Registration",
  robots: { index: false, follow: false },
};

// Public self-registration is disabled. Student accounts are created by an
// admin from the admin dashboard, who shares the login id + password directly.
export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Accounts are admin-managed</CardTitle>
          <CardDescription>
            Self sign-up is turned off. Your institute creates your account and shares
            your login id &amp; password with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Already have your credentials? Sign in to access your assigned test series.
          </p>
          <Link href="/login" className="block">
            <Button className="w-full flex items-center justify-center gap-1.5">
              <LogIn className="h-4 w-4" /> Go to Sign In
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            Don&apos;t have an account yet? Contact your institute / admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
