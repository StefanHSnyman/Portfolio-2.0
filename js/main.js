/* ============================================================
   main.js — behaviour & rendering.
   Content comes from js/content.js (SITE_CONTENT).
   ============================================================ */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- render: skills (sensor panels) ---------- */
  function renderSkills() {
    const grid = document.getElementById("skills-grid");
    if (!grid || !window.SITE_CONTENT) return;
    SITE_CONTENT.skills.forEach((cat) => {
      const panel = document.createElement("div");
      panel.className = "sensor reveal";
      panel.innerHTML =
        '<div class="sensor-head">' +
        '<span class="led led-up" aria-hidden="true"></span>' +
        '<span class="sensor-title">' + esc(cat.title) + "</span>" +
        '<span class="count">' + cat.items.length + " up</span>" +
        "</div>" +
        '<ul class="chipset" role="list" style="list-style:none;padding:0;margin:0">' +
        cat.items.map((s) => '<li class="chip">' + esc(s) + "</li>").join("") +
        "</ul>";
      grid.appendChild(panel);
    });
  }

  /* ---------- render: projects (expandable case studies) ---------- */
  function renderProjects() {
    const list = document.getElementById("project-list");
    if (!list || !window.SITE_CONTENT) return;

    SITE_CONTENT.projects.forEach((p, i) => {
      const art = document.createElement("article");
      art.className = "case reveal";

      const panelId = "case-panel-" + p.id;
      const links = [];
      links.push(linkBtn(p.repo, "View repository →", "btn btn-outline btn-sm",
        "[Add GitHub repo link]"));
      if (p.demo !== undefined) {
        links.push(linkBtn(p.demo, "Live demo →", "btn btn-outline btn-sm",
          "[Add demo link, or remove]"));
      }

      art.innerHTML =
        '<button class="case-toggle" aria-expanded="false" aria-controls="' + panelId + '">' +
        '<span class="case-id mono">' + esc(p.id) + "</span>" +
        "<span>" +
        '<span class="case-title">' + esc(p.title) + "</span>" +
        '<span class="case-desc">' + esc(p.summary) + "</span>" +
        '<span class="case-stack">' + p.stack.map((t) => '<span class="chip">' + esc(t) + "</span>").join("") + "</span>" +
        "</span>" +
        '<span class="case-caret" aria-hidden="true">›</span>' +
        "</button>" +
        '<div class="case-panel" id="' + panelId + '">' +
        '<div class="case-panel-inner"><div class="case-body">' +
        field("the problem", "<p>" + esc(p.problem) + "</p>") +
        field("my role", "<p>" + esc(p.role) + "</p>") +
        field("key features", "<ul>" + p.features.map((f) => "<li>" + esc(f) + "</li>").join("") + "</ul>") +
        field("challenges & highlights", phText(p.highlights)) +
        field("what i learned", phText(p.learned)) +
        '<div class="case-links">' + links.join("") + "</div>" +
        "</div></div></div>";

      list.appendChild(art);
    });

    // accordion behaviour
    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".case-toggle");
      if (!btn) return;
      const item = btn.closest(".case");
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  function field(label, inner) {
    return '<div class="case-field"><h4>' + label + "</h4>" + inner + "</div>";
  }
  function phText(obj) {
    if (!obj) return "<p>—</p>";
    return obj.ph
      ? '<p class="ph" title="Replace in js/content.js">' + esc(obj.text) + "</p>"
      : "<p>" + esc(obj.text) + "</p>";
  }
  function linkBtn(url, label, cls, phLabel) {
    if (url) {
      return '<a class="' + cls + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>";
    }
    return '<span class="chip ph" title="Add the URL in js/content.js">' + esc(phLabel) + "</span>";
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  /* ---------- nav: mobile toggle ---------- */
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- nav: highlight active section ---------- */
  function initActiveNav() {
    const links = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
    const map = new Map();
    links.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (sec) map.set(sec, a);
    });
    if (!("IntersectionObserver" in window) || map.size === 0) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const link = map.get(en.target);
        if (!link) return;
        if (en.isIntersecting) {
          links.forEach((l) => l.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((_, sec) => obs.observe(sec));
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    const targets = document.querySelectorAll(".section-head, .about-grid, .edu-card, .xp-card, .learn-item, .gh-panel, .cv-panel, .contact-list, .reveal");
    targets.forEach((t) => t.classList.add("reveal"));
    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("in"));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((t) => obs.observe(t));
  }

  /* ---------- topology: honour reduced motion (SMIL) ---------- */
  function initTopology() {
    if (!reducedMotion) return;
    document.querySelectorAll("#topology animateMotion").forEach((a) => a.remove());
  }

  /* ---------- footer year ---------- */
  function initYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderSkills();
    renderProjects();
    initNav();
    initActiveNav();
    initReveal();
    initTopology();
    initYear();
  });
})();
