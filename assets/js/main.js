// buku.pro — minimal, motivated interactions.
// Restrained motion (trust-first design): a mobile nav toggle and a subtle
// scroll reveal. Both respect prefers-reduced-motion.

(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Scroll reveal
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("in");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    {threshold: 0.12}
  );

  // Stagger the reveal inside grids (features, product cards)
  document.querySelectorAll(".features, .split-grid").forEach(function (grid) {
    Array.prototype.slice.call(grid.children).forEach(function (child, i) {
      var el = child.classList.contains("reveal") ? child : child.querySelector(".reveal");
      if (el) el.style.transitionDelay = (i * 70) + "ms";
    });
  });

  // Subtle scroll parallax on the hero preview (desktop only)
  var preview = document.querySelector(".preview");
  if (preview && window.matchMedia("(min-width: 901px)").matches) {
    var ticking = false;
    function updateParallax() {
      preview.style.transform = "translateY(" + Math.min(window.scrollY, 700) * 0.07 + "px)";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // Cursor glow (desktop, fine pointer only)
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    var tx = 0, ty = 0, gx = 0, gy = 0, raf = 0;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(function () {
          gx += (tx - gx) * 0.16;
          gy += (ty - gy) * 0.16;
          glow.style.transform = "translate(" + gx + "px," + gy + "px) translate(-50%, -50%)";
          raf = 0;
        });
      }
    }, { passive: true });
  }

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
