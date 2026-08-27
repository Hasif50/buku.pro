// buku.pro — restrained, trust-first motion.
// Mobile nav toggle, subtle scroll reveal, smooth scroll, magnetic buttons,
// and the live ledger feed. Everything respects prefers-reduced-motion.

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

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll reveal
  var targets = document.querySelectorAll(".reveal, .ink, .fade-in");
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

  // Preloader — lifts away once the book is open.
  var preloader = document.getElementById("preloader");
  if (preloader) {
    var lift = function () {
      preloader.classList.add("done");
      setTimeout(function () { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 800);
    };
    if (document.readyState === "complete") {
      setTimeout(lift, 1100);
    } else {
      window.addEventListener("load", function () { setTimeout(lift, 1100); });
    }
    setTimeout(lift, 3200);
    var pctEl = preloader.querySelector(".preloader-pct");
    if (pctEl && !reduceMotion) {
      var pc = 0;
      var pctInt = setInterval(function () {
        pc = Math.min(pc + 7, 100);
        pctEl.textContent = pc;
        if (pc >= 100) clearInterval(pctInt);
      }, 70);
    }
  }

  // Lenis smooth scroll (subtle).
  var lenis;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    document.documentElement.style.scrollBehavior = "auto";
    var lraf = function (time) { lenis.raf(time); requestAnimationFrame(lraf); };
    requestAnimationFrame(lraf);
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

  // Magnetic primary buttons (subtle).
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn-primary").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.1;
        var dy = (e.clientY - r.top - r.height / 2) * 0.12;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
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

  // Live ledger feed — the book writes itself.
  var ledger = document.getElementById("ledgerLines");
  if (ledger && !reduceMotion) {
    var tasks = [
      { agent: "finance", task: "reconciling invoices", chip: "done", cls: "done" },
      { agent: "marketing", task: "drafting recall campaign", chip: "working", cls: "work" },
      { agent: "operations", task: "checking inventory", chip: "queued", cls: "queue" },
      { agent: "sales", task: "scheduling follow-ups", chip: "done", cls: "done" },
      { agent: "hr", task: "updating staff records", chip: "working", cls: "work" },
      { agent: "admin", task: "filing compliance reports", chip: "done", cls: "done" }
    ];
    var li = 0;
    setInterval(function () {
      var t = tasks[li++ % tasks.length];
      var now = new Date();
      var hh = ("0" + now.getHours()).slice(-2);
      var mm = ("0" + now.getMinutes()).slice(-2);
      var el = document.createElement("div");
      el.className = "lline";
      el.innerHTML = '<span class="t">' + hh + ":" + mm + '</span><span class="agent">' + t.agent +
        '</span><span class="task">' + t.task + '</span><span class="chip ' + t.cls + '">' + t.chip + '</span>';
      ledger.prepend(el);
      while (ledger.children.length > 4) ledger.lastChild.remove();
    }, 2400);
  }
})();
