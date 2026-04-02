"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--accent)] px-4 py-2 text-[color:var(--accent-foreground)] shadow-[0_10px_26px_rgba(255,142,61,0.18)] hover:brightness-105",
        secondary:
          "bg-white/10 px-4 py-2 text-white hover:bg-white/16",
        ghost: "px-3 py-2 text-[color:var(--muted-foreground)] hover:bg-white/8 hover:text-white",
        outline:
          "border border-white/12 bg-transparent px-4 py-2 text-white hover:border-white/25 hover:bg-white/6",
        danger:
          "bg-[rgba(244,91,105,0.16)] px-4 py-2 text-[color:var(--danger)] hover:bg-[rgba(244,91,105,0.26)]",
      },
      size: {
        default: "h-10",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-5 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button, buttonVariants };
