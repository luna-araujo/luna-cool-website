const storageKey = "luna:theme";
const themes = [
  "light",
  "light-rosepine",
  "dark",
  "dark-reference",
  "dark-legacy",
  "dark-gruvbox",
  "dark-tokyonight",
  "dark-rosepine",
] as const;
export type ThemeId = (typeof themes)[number];

const isValidTheme = (v: unknown): v is ThemeId =>
  typeof v === "string" && (themes as readonly string[]).includes(v);

const getSystemTheme = (): ThemeId => {
  try {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark-reference"
      : "light";
  } catch {
    return "light";
  }
};

const getSavedTheme = (): ThemeId | null => {
  try {
    const v = localStorage.getItem(storageKey);
    return isValidTheme(v) ? v : null;
  } catch {
    return null;
  }
};

const syncToggleUi = (theme: ThemeId) => {
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

const setTheme = (theme: ThemeId, { persist }: { persist?: boolean } = { persist: true }) => {
  const safeTheme: ThemeId = isValidTheme(theme) ? theme : "light";
  document.documentElement.dataset.theme = safeTheme;

  if (persist !== false) {
    try {
      localStorage.setItem(storageKey, safeTheme);
    } catch {
      // ignore
    }
  }

  syncToggleUi(safeTheme);
};

const getCurrentTheme = (): ThemeId =>
  isValidTheme(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : "light";

window.__lunaTheme = {
  themes: [...themes],
  get: () => getCurrentTheme(),
  set: (theme, opts) => setTheme(isValidTheme(theme) ? theme : "light", opts),
};

// Ensure the icon matches the theme picked by the early <head> script.
syncToggleUi(getCurrentTheme());

// Toggle only between light and main dark; legacy is for dev testing.
const toggleButton = document.getElementById("theme-toggle");
if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    const current = getCurrentTheme();
    setTheme(current === "light" ? "dark-reference" : "light", { persist: true });
  });
}

// Follow system theme only if the user hasn't explicitly chosen one.
try {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", () => {
    if (getSavedTheme() !== null) return;
    setTheme(getSystemTheme(), { persist: false });
  });
} catch {
  // ignore
}

// Dev-only theme dropdown (Shift + T)
if (import.meta.env.DEV) {
  const labelFor = (t: string) => {
    if (t === "light") return "Light";
    if (t === "light-rosepine") return "Light (Rosé Pine)";
    if (t === "dark-reference") return "Dark (Reference)";
    if (t === "dark") return "Dark (Mocha)";
    if (t === "dark-legacy") return "Dark (Legacy)";
    if (t === "dark-gruvbox") return "Dark (Gruvbox)";
    if (t === "dark-tokyonight") return "Dark (Tokyo Night)";
    if (t === "dark-rosepine") return "Dark (Rosé Pine)";
    return t;
  };

  const ensurePanel = () => {
    let panel = document.getElementById("theme-dev-panel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "theme-dev-panel";
    panel.hidden = true;

    const options = window.__lunaTheme!.themes
      .map((t) => `<option value="${t}">${labelFor(t)}</option>`)
      .join("");

    panel.innerHTML = `
      <div class="theme-dev-panel__inner">
        <div class="theme-dev-panel__title">Theme (dev)</div>
        <label class="theme-dev-panel__row">
          <span class="theme-dev-panel__label">Current</span>
          <select class="theme-dev-panel__select" aria-label="Select theme">
            ${options}
          </select>
        </label>
        <div class="theme-dev-panel__hint">Shortcut: Shift + T</div>
      </div>
    `;

    document.body.appendChild(panel);

    const select = panel.querySelector("select") as HTMLSelectElement | null;

    const sync = () => {
      const current = window.__lunaTheme!.get();
      if (select) select.value = current;
    };

    sync();

    select?.addEventListener("change", () => {
      const value = select.value;
      window.__lunaTheme!.set(value, { persist: true });
    });

    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return panel;
  };

  const togglePanel = () => {
    const panel = ensurePanel();
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      panel.querySelector("select")?.focus();
    }
  };

  window.addEventListener("keydown", (e) => {
    const key = (e.key || "").toLowerCase();
    const target = e.target as HTMLElement | null;
    const isEditable =
      !!target &&
      (target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable);

    const wantsToggle =
      !isEditable &&
      key === "t" &&
      e.shiftKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey;

    if (wantsToggle) {
      e.preventDefault();
      togglePanel();
      return;
    }

    if (key === "escape") {
      const panel = document.getElementById("theme-dev-panel");
      if (panel && !panel.hidden) panel.hidden = true;
    }
  });
}
