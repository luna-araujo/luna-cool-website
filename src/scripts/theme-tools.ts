const storageKey = "luna:theme";
type Theme = "light" | "dark";

const isValidTheme = (v: unknown): v is Theme =>
  v === "light" || v === "dark";

const getSystemTheme = (): Theme => {
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
};

const getSavedTheme = (): Theme | null => {
  try {
    const v = localStorage.getItem(storageKey);
    return isValidTheme(v) ? v : null;
  } catch {
    return null;
  }
};

const getCurrentTheme = (): Theme => {
  const current = document.documentElement.dataset.theme;
  return isValidTheme(current) ? current : "light";
};

const syncToggleUi = (theme: Theme) => {
  const toggleButton = document.getElementById("theme-toggle");
  if (!toggleButton) return;

  const icon = toggleButton.querySelector("i");
  if (icon) {
    icon.classList.remove("fa-moon", "fa-sun");
    icon.classList.add(theme === "light" ? "fa-sun" : "fa-moon");
  }

  toggleButton.setAttribute(
    "aria-label",
    theme === "light" ? "Switch to dark mode" : "Switch to light mode"
  );
  toggleButton.setAttribute("title", theme === "light" ? "Light mode" : "Dark mode");
};

const setTheme = (theme: Theme, { persist = true }: { persist?: boolean } = {}) => {
  const safeTheme: Theme = isValidTheme(theme) ? theme : "light";
  document.documentElement.dataset.theme = safeTheme;

  if (persist) {
    try {
      localStorage.setItem(storageKey, safeTheme);
    } catch {
      // ignore
    }
  }

  syncToggleUi(safeTheme);
};

// Sync icon with theme set by early <head> script
syncToggleUi(getCurrentTheme());

// Toggle button
const toggleButton = document.getElementById("theme-toggle");
toggleButton?.addEventListener("click", () => {
  setTheme(getCurrentTheme() === "light" ? "dark" : "light");
});

// Follow system theme if user hasn't explicitly chosen one
try {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", () => {
    if (getSavedTheme() !== null) return;
    setTheme(getSystemTheme(), { persist: false });
  });
} catch {
  // ignore
}
