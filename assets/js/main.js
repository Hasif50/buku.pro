// buku.pro — restrained, trust-first motion.
// Mobile nav toggle, subtle scroll reveal, smooth scroll, live counters,
// and the scroll-progress hairline. Everything respects prefers-reduced-motion.

(function () {
  "use strict";

  // Progressive enhancement: hidden reveal states only apply once JS is active.
  document.documentElement.classList.add("js");

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll reveal — one short fade/rise for headings, cards, and the ledger panel.
  var targets = document.querySelectorAll(".reveal, .ink, .fade-in, .running-head");
  var observer;
  if (!reduceMotion && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".features, .split-grid, .chapters-stage").forEach(function (grid) {
      Array.prototype.slice.call(grid.children).forEach(function (child, i) {
        var el = child.classList.contains("reveal") ? child : child.querySelector(".reveal");
        if (el) el.style.transitionDelay = (i * 70) + "ms";
      });
    });
    targets.forEach(function (el) { observer.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  // Scroll progress (gold hairline).
  var progressBar = document.querySelector(".scroll-progress i");
  if (progressBar && !reduceMotion) {
    var setProgress = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    };
    window.addEventListener("scroll", setProgress, { passive: true });
    setProgress();
  }

  // Ledger counters — figures count up like totals when scrolled into view.
  if (!reduceMotion) {
    document.querySelectorAll(".stat-n[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var pad = parseInt(el.getAttribute("data-pad") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          obs.disconnect();
          var start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 1300, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var v = Math.round(target * eased);
            el.textContent = (pad ? String(v).padStart(pad, "0") : v) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }
})();
