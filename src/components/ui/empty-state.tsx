import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-0 shadow-soft", className)}>
      <CardContent className="py-12 text-center">
        {/* Icon or Emoji */}
        <div className="mb-4">
          {Icon ? (
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-scale-in">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          ) : emoji ? (
            <div className="text-5xl animate-bounce-in">{emoji}</div>
          ) : null}
        </div>

        {/* Content */}
        <h3 className="text-xl font-display font-semibold mb-2 animate-fade-in">
          {title}
        </h3>
        <p
          className="text-muted-foreground mb-6 max-w-sm mx-auto animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          {description}
        </p>

        {/* Actions */}
        {(action || secondaryAction || children) && (
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            {action && (
              <Button onClick={action.onClick} className="gap-2">
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
