"use strict";

// We wrap everything in an IIFE (Immediately Invoked Function Expression)
// so our variables don't pollute the global scope — good practice
// when multiple scripts share the same page.
(function () {
  // The key we use to store the theme preference in localStorage
  const KEY = "mq-theme";

  // We grab the <html> element because toggling .dark on it
  // makes CSS variables switch theme globally via the cascade
  const html = document.documentElement;

  // On page load, we restore whatever theme the user picked last time.
  // If they chose dark mode before, we add the class immediately —
  // before the DOM is ready — to avoid a flash of the wrong theme.
  const saved = localStorage.getItem(KEY);
  if (saved === "dark") html.classList.add("dark");

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    // The button might not exist on every page, so we bail out safely
    if (!btn) return;

    // update() syncs the button icon and aria-label with the current theme
    function update() {
      const dark = html.classList.contains("dark");
      btn.textContent = dark ? "☀️" : "🌙";
      btn.setAttribute("aria-label", dark ? "Mode clair" : "Mode sombre");
    }

    // When the user clicks the toggle, we flip the class, save the choice,
    // and immediately update the button so the UI feels responsive
    btn.addEventListener("click", () => {
      html.classList.toggle("dark");
      localStorage.setItem(KEY, html.classList.contains("dark") ? "dark" : "light");
      update();
    });

    // Run once at startup to set the correct icon right away
    update();
  });
})();
