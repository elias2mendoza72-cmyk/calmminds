import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Settings, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/journal", icon: BookOpen, label: "Journal" },
  { path: "/panic", icon: AlertTriangle, label: "Panic", isPanic: true },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on auth pages or landing page
  if (location.pathname === "/auth" || location.pathname === "/" || location.pathname === "/onboarding") {
    return null;
  }

  const handleNavClick = (path: string) => {
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    navigate(path);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden",
        "bg-card/95 backdrop-blur-lg border-t border-border/50",
        "pb-safe" // Safe area for notched devices
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-14",
                "rounded-xl transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "active:scale-95",
                isActive
                  ? item.isPanic
                    ? "text-destructive"
                    : "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                item.isPanic && !isActive && "text-destructive/70 hover:text-destructive"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive && !item.isPanic && "bg-primary/10",
                  isActive && item.isPanic && "bg-destructive/10"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
