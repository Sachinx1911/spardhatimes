import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-98 cursor-pointer",
          {
            // Variants
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm": variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "border border-input bg-background text-foreground hover:bg-muted hover:text-foreground": variant === "outline",
            "bg-danger text-danger-foreground hover:bg-danger/95 shadow-sm": variant === "destructive",
            "text-foreground hover:bg-muted": variant === "ghost",
            "text-primary underline-offset-4 hover:underline bg-transparent p-0 h-auto active:scale-100": variant === "link",
            
            // Sizes
            "h-8 px-3 text-xs rounded-sm": size === "sm",
            "h-10 px-4 py-2 rounded-md": size === "md",
            "h-12 px-6 rounded-lg text-base": size === "lg",
            "h-10 w-10 p-0 rounded-full": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
