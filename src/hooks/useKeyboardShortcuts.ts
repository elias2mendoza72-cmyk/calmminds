import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const altMatch = shortcut.alt ? event.altKey : true;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Pre-configured global shortcuts
export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    {
      key: "p",
      ctrl: true,
      handler: () => navigate("/panic"),
      description: "Open Panic Mode",
    },
    {
      key: "j",
      ctrl: true,
      handler: () => navigate("/journal"),
      description: "Open Journal",
    },
    {
      key: "h",
      ctrl: true,
      handler: () => navigate("/dashboard"),
      description: "Go Home",
    },
  ]);
}

// Panic mode specific shortcuts
export function usePanicModeShortcuts(handlers: {
  onEscape?: () => void;
  onSpace?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  useKeyboardShortcuts([
    ...(handlers.onEscape
      ? [
          {
            key: "Escape",
            handler: handlers.onEscape,
            description: "Close current feature",
          },
        ]
      : []),
    ...(handlers.onSpace
      ? [
          {
            key: " ",
            handler: handlers.onSpace,
            description: "Toggle play/pause",
          },
        ]
      : []),
    ...(handlers.onNext
      ? [
          {
            key: "ArrowRight",
            handler: handlers.onNext,
            description: "Next step",
          },
        ]
      : []),
    ...(handlers.onPrevious
      ? [
          {
            key: "ArrowLeft",
            handler: handlers.onPrevious,
            description: "Previous step",
          },
        ]
      : []),
  ]);
}
