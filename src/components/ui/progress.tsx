import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-muted/60",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full flex-1 rounded-full bg-gradient-to-r from-primary via-primary to-calm-terracotta transition-all duration-500 ease-out relative overflow-hidden"
      style={{ width: `${value || 0}%` }}
    >
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
        style={{ animationPlayState: (value || 0) > 0 ? 'running' : 'paused' }}
      />
      {/* Glow effect at the end */}
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/40 to-transparent" />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };