import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 [&_svg]:group-hover:scale-110",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md shadow-destructive/25 hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/30 hover:-translate-y-0.5 [&_svg]:group-hover:scale-110",
        outline:
          "border-2 border-border bg-background hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:-translate-y-0.5 [&_svg]:group-hover:scale-110 [&_svg]:group-hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5 [&_svg]:group-hover:scale-110",
        ghost: 
          "hover:bg-accent/80 hover:text-accent-foreground [&_svg]:group-hover:scale-110",
        link: 
          "text-primary underline-offset-4 hover:underline [&_svg]:group-hover:translate-x-0.5",
        premium:
          "relative overflow-hidden bg-gradient-to-r from-primary via-primary to-calm-terracotta text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 [&_svg]:group-hover:scale-110",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };