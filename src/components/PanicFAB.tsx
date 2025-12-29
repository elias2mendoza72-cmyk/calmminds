import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PanicFAB() {
  const [isPressed, setIsPressed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show FAB on panic mode page or auth pages
  if (location.pathname === "/panic" || location.pathname === "/auth" || location.pathname === "/") {
    return null;
  }

  const handleClick = () => {
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    navigate("/panic");
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={cn(
        "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50",
        "w-14 h-14 md:w-16 md:h-16 rounded-full",
        "bg-destructive text-destructive-foreground",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-200 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-4 focus:ring-destructive/30",
        "animate-pulse-slow",
        isPressed && "scale-95"
      )}
      aria-label="Open Panic Mode for immediate support"
      role="button"
    >
      <AlertTriangle className="w-6 h-6 md:w-7 md:h-7" />
      
      {/* Pulse ring animation */}
      <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-20" />
    </button>
  );
}
