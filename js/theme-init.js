/*
 * Runs in <head> BEFORE the page paints, so the saved theme and accent hue
 * are applied with no flash of the wrong colours.
 * Kept as an external file (not inline) so the Content-Security-Policy in
 * _headers can stay strict: script-src 'self'.
 */
(function () {
  var d = document.documentElement;
  d.classList.add("js");

  var theme = null;
  var hue = null;
  try {
    theme = localStorage.getItem("theme");
    hue = localStorage.getItem("hue");
  } catch (e) {}

  // First visit: follow the visitor's OS setting.
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  d.dataset.theme = theme;

  if (hue !== null && /^\d{1,3}$/.test(hue) && +hue <= 360) {
    d.style.setProperty("--hue", hue);
  }

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f6f7fb" : "#0d0f14");
})();
