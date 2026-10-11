import { useEffect, useRef, useState } from "react";
import { Icon, Button } from "./ui";
type Theme = "light" | "dark";
const preferenceKey = "uagray-theme";
function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(preferenceKey);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}
export function readTheme(): Theme {
  return (
    storedTheme() ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
}
export function initializeTheme() {
  document.documentElement.dataset.theme = readTheme();
}
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const manual = useRef(!!storedTheme());
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      if (!manual.current) setTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
  }, []);
  function toggle() {
    manual.current = true;
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(preferenceKey, next);
    } catch {
      /* The toggle remains available when storage is blocked. */
    }
    setTheme(next);
  }
  return (
    <Button
      aria-label={theme === "dark" ? "切换为浅色" : "切换为暗色"}
      onClick={toggle}
      aria-pressed={theme === "dark"}
      shape="square"
    >
      <Button.Icon>
        <Icon name={theme === "dark" ? "sun" : "moon"} />
      </Button.Icon>
    </Button>
  );
}
