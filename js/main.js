/*
 * Portfolio behaviour. Plain JavaScript, no dependencies, no build step.
 * Every feature checks that its elements exist, so this one file also runs
 * safely on the case-study and blog pages.
 *
 * Features: theme toggle · live accent hue · mobile menu · scroll-spy ·
 *           project filter · contact form · footer year
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // localStorage can throw (private mode, blocked cookies). Never let that break the page.
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
    remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
  };

  /* ------------------------------------------------------------------ */
  /* Theme + hue tuner                                                   */
  /* ------------------------------------------------------------------ */
  const themeBtn = $("#themeToggle");
  const themeMeta = $('meta[name="theme-color"]');
  const THEME_COLOR = { dark: "#0d0f14", light: "#f6f7fb" };

  const hueInput = $("#hue");
  const hueOut = $("#hueOut");
  const hueReset = $("#hueReset");
  const hueTexts = $$("[data-hue-text]");
  const lcText = $("[data-lc-text]");

  // --l and --c are set per theme in CSS. Read them so the code panel always shows true values.
  function readToken(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }
  function currentHue() {
    const n = parseInt(readToken("--hue"), 10);
    return Number.isNaN(n) ? 285 : n;
  }
  function syncTuner() {
    const h = currentHue();
    if (hueInput) hueInput.value = h;
    if (hueOut) hueOut.textContent = h;
    hueTexts.forEach((el) => { el.textContent = h; });
    if (lcText) lcText.textContent = `${readToken("--l")} ${readToken("--c")}`;
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLOR[theme]);
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(theme === "light"));
    syncTuner();
  }

  if (themeBtn) {
    applyTheme(root.dataset.theme === "light" ? "light" : "dark");
    themeBtn.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      store.set("theme", next);
    });
  }

  if (hueInput) {
    syncTuner();
    hueInput.addEventListener("input", () => {
      root.style.setProperty("--hue", hueInput.value);
      store.set("hue", hueInput.value);
      syncTuner();
    });
  }
  if (hueReset) {
    hueReset.addEventListener("click", () => {
      root.style.removeProperty("--hue");
      store.remove("hue");
      syncTuner();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Mobile menu                                                         */
  /* ------------------------------------------------------------------ */
  const menuBtn = $("#menuToggle");
  const navLinks = $("#navLinks");

  function setMenu(open) {
    if (!menuBtn || !navLinks) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("open", open);
  }
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll-spy: mark the nav link of the section in view                */
  /* ------------------------------------------------------------------ */
  const spyLinks = $$('#navLinks a[href^="#"]');
  if (spyLinks.length && "IntersectionObserver" in window) {
    const byId = new Map();
    spyLinks.forEach((a) => {
      const section = $(a.getAttribute("href"));
      if (section) byId.set(section.id, a);
    });
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          spyLinks.forEach((a) => a.removeAttribute("aria-current"));
          const link = byId.get(entry.target.id);
          if (link) link.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    byId.forEach((_, id) => spy.observe(document.getElementById(id)));
  }

  /* ------------------------------------------------------------------ */
  /* Profile photo: show initials if the image file is missing           */
  /* ------------------------------------------------------------------ */
  const portraitImg = $(".portrait img");
  if (portraitImg) {
    const showFallback = () => portraitImg.closest(".portrait").classList.add("no-photo");
    if (portraitImg.complete && portraitImg.naturalWidth === 0) showFallback();
    else portraitImg.addEventListener("error", showFallback, { once: true });
  }

  /* ------------------------------------------------------------------ */
  /* Project filter (appears automatically when there are 4+ projects)   */
  /* ------------------------------------------------------------------ */
  const grid = $("#projectsGrid");
  const filterBox = $("#projectFilters");
  const filterStatus = $("#filterStatus");
  if (grid && filterBox) {
    const cards = $$(".card", grid);
    const tagsOf = (card) => $$(".tags li", card).map((li) => li.textContent.trim());
    const allTags = [...new Set(cards.flatMap(tagsOf))].sort((a, b) => a.localeCompare(b));

    if (cards.length >= 4 && allTags.length > 1) {
      const makeBtn = (label, value) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.dataset.filter = value;
        b.setAttribute("aria-pressed", value === "" ? "true" : "false");
        return b;
      };
      filterBox.append(makeBtn("All", ""), ...allTags.map((t) => makeBtn(t, t)));
      filterBox.hidden = false;

      filterBox.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-filter]");
        if (!btn) return;
        const value = btn.dataset.filter;
        $$("button", filterBox).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        let shown = 0;
        cards.forEach((card) => {
          const match = value === "" || tagsOf(card).includes(value);
          card.hidden = !match;
          if (match) shown += 1;
        });
        if (filterStatus) {
          filterStatus.textContent = `Showing ${shown} of ${cards.length} projects`;
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Contact form                                                        */
  /* Honest by design: it only says "sent" when the server confirmed it. */
  /* ------------------------------------------------------------------ */
  const form = $("#contactForm");
  if (form) {
    const status = $("#formStatus");
    const submitBtn = $('button[type="submit"]', form);
    const submitLabel = submitBtn.textContent;

    const rules = {
      name: (v) => v.trim().length >= 2 || "Enter your name.",
      email: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email address, like name@example.com.",
      message: (v) =>
        v.trim().length >= 10 || "Write at least 10 characters so I know how I can help.",
    };

    function setFieldError(field, message) {
      const errorEl = document.getElementById(`${field.id}-error`);
      if (errorEl) errorEl.textContent = message || "";
      if (message) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
    function validate() {
      let firstBad = null;
      Object.keys(rules).forEach((id) => {
        const field = form.elements[id];
        const result = rules[id](field.value);
        setFieldError(field, result === true ? "" : result);
        if (result !== true && !firstBad) firstBad = field;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }
    // Clear an error as soon as the visitor fixes the field.
    Object.keys(rules).forEach((id) => {
      form.elements[id].addEventListener("input", () => {
        if (form.elements[id].getAttribute("aria-invalid") === "true" && rules[id](form.elements[id].value) === true) {
          setFieldError(form.elements[id], "");
        }
      });
    });

    function say(message, kind) {
      status.className = `form-status ${kind || ""}`.trim();
      status.textContent = message;
    }
    function mailtoUrl(email, data) {
      const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
      const body = encodeURIComponent(`${data.message}\n\n${data.name}\n${data.email}`);
      return `mailto:${email}?subject=${subject}&body=${body}`;
    }
    function sayFailure(email, data) {
      status.className = "form-status fail";
      status.textContent = "Your message was not sent. ";
      const a = document.createElement("a");
      a.href = mailtoUrl(email, data);
      a.textContent = "Email me directly instead.";
      status.append(a);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) {
        say("Fix the highlighted fields and send again.", "fail");
        return;
      }
      say("");

      const data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
      };
      if (form.elements.botcheck.checked) return; // bot: silently ignore

      const fallbackEmail = form.dataset.fallbackEmail || "";
      const key = form.dataset.accessKey || "";

      // No access key yet: do NOT pretend to send. Open the visitor's email app instead.
      if (!key || key.includes("YOUR_")) {
        console.warn("Contact form: no Web3Forms access key set (see TODO in index.html). Using the mailto fallback.");
        say(`Your email app should open with the message filled in. If nothing opens, write to ${fallbackEmail}.`, "ok");
        window.location.href = mailtoUrl(fallbackEmail, data);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(form.dataset.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: key,
            subject: `Portfolio message from ${data.name}`,
            from_name: "Portfolio",
            ...data,
          }),
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`);
        form.reset();
        say(`Message sent. I'll reply to ${data.email} within two days.`, "ok");
      } catch (err) {
        console.error("Contact form failed:", err);
        sayFailure(fallbackEmail, data);
      } finally {
        clearTimeout(timer);
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Footer year                                                         */
  /* ------------------------------------------------------------------ */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
