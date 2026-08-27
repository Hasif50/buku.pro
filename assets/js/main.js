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

  // The book of dots — a 3D point-cloud book that turns like a globe.
  var dotCanvas = document.querySelector(".dotbook");
  if (dotCanvas && !reduceMotion) {
    var dctx = dotCanvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function sizeDotbook() {
      dotCanvas.width = dotCanvas.offsetWidth * dpr;
      dotCanvas.height = dotCanvas.offsetHeight * dpr;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeDotbook();
    window.addEventListener("resize", sizeDotbook);

    // Book point cloud: covers, spine, fore-edge, top & bottom edges.
    var pts = [];
    var W = 2.6, H = 3.4, D = 0.6, step = 0.13;
    for (var x = -W / 2; x <= W / 2; x += step) {
      for (var y = -H / 2; y <= H / 2; y += step) {
        pts.push([x, y, -D / 2], [x, y, D / 2]);
      }
    }
    for (var y = -H / 2; y <= H / 2; y += 0.09) {
      pts.push([-W / 2, y, 0], [W / 2, y, 0]);
    }
    for (var x = -W / 2; x <= W / 2; x += 0.09) {
      pts.push([x, -H / 2, 0], [x, H / 2, 0]);
    }

    var angle = 0, running = true;
    var dotObs = new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) requestAnimationFrame(drawDotbook);
    }, { threshold: 0.05 });
    dotObs.observe(dotCanvas);

    function drawDotbook() {
      if (!running) return;
      angle += 0.0045;
      var w = dotCanvas.width / dpr, h = dotCanvas.height / dpr;
      dctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var scale = Math.min(w, h) / 6.4;
      var cosA = Math.cos(angle), sinA = Math.sin(angle);
      var tilt = 0.32, cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      var persp = 6.5;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var x1 = p[0] * cosA - p[2] * sinA;
        var z1 = p[0] * sinA + p[2] * cosA;
        var y2 = p[1] * cosT - z1 * sinT;
        var z2 = p[1] * sinT + z1 * cosT;
        var k = persp / (persp + z2);
        var sx = cx + x1 * scale * k;
        var sy = cy + y2 * scale * k;
        var edge = Math.abs(Math.abs(p[0]) - W / 2) < 0.001 || Math.abs(Math.abs(p[1]) - H / 2) < 0.001;
        dctx.globalAlpha = Math.max(0.12, 0.35 + 0.55 * ((z2 + D) / (2 * D)));
        dctx.fillStyle = z2 > 0 ? (edge ? "#e9c766" : "#d4af37") : "#6fa8dc";
        dctx.beginPath();
        dctx.arc(sx, sy, Math.max(0.5, 1.35 * k), 0, Math.PI * 2);
        dctx.fill();
      }
      dctx.globalAlpha = 1;
      requestAnimationFrame(drawDotbook);
    }
    requestAnimationFrame(drawDotbook);
  }

  // Live ledger feed — the book writes itself.
  var ledger = document.getElementById("ledgerLines");
  if (ledger && !reduceMotion) {    var tasks = [
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
