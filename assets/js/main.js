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

    // Magnetic primary buttons
    document.querySelectorAll(".btn-primary").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.12;
        var dy = (e.clientY - r.top - r.height / 2) * 0.16;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  // Live ledger feed — the book writes itself
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

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
