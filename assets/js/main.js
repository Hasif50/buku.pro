// buku.pro — restrained, trust-first motion.
// Mobile nav toggle, subtle scroll reveal, smooth scroll, magnetic buttons,
// and the live ledger feed. Everything respects prefers-reduced-motion.

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

  // The book — a sticky reading device. Scroll turns the pages; the book
  // does not rotate. Each flip moves one page from the right to the left,
  // revealing the next chapter beneath it.
  var bookCanvas = document.querySelector(".dotbook");
  if (bookCanvas) {
    var bctx = bookCanvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var bookW = 0, bookH = 0;
    function sizeBook() {
      bookW = bookCanvas.offsetWidth;
      bookH = bookCanvas.offsetHeight;
      bookCanvas.width = bookW * dpr;
      bookCanvas.height = bookH * dpr;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeBook();
    window.addEventListener("resize", sizeBook);

    // Pages as unit-space dot fields. Kinds: 0 body, 1 line, 2 cover, 3 edge.
    function buildPage(opts) {
      var pts = [];
      var m = 0.06, step = opts.cover ? 0.042 : 0.055;
      for (var v = m; v <= 1 - m; v += step) {
        for (var u = m; u <= 1 - m; u += step) {
          pts.push([u, v, opts.cover ? 2 : 0]);
        }
      }
      if (!opts.cover) {
        (opts.lines || []).forEach(function (lv) {
          for (var u = 0.14; u <= 0.9; u += 0.024) pts.push([u, lv, 1]);
        });
      }
      for (var ue = m; ue <= 1 - m; ue += 0.03) {
        pts.push([ue, m, 3], [ue, 1 - m, 3]);
      }
      for (var ve = m; ve <= 1 - m; ve += 0.03) {
        pts.push([m, ve, 3], [1 - m, ve, 3]);
      }
      return pts;
    }

    var pages = [
      buildPage({ cover: true }),                        // 0 cover
      buildPage({ lines: [0.30, 0.44, 0.58, 0.72] }),    // 1 chapter 01
      buildPage({ lines: [0.26, 0.40, 0.54, 0.68, 0.80] }), // 2 chapter 02
      buildPage({ lines: [0.32, 0.46, 0.60, 0.74] }),    // 3 chapter 03
      buildPage({ lines: [0.44, 0.56] })                 // 4 colophon
    ];

    var readSection = document.getElementById("read");
    var faces = Array.prototype.slice.call(document.querySelectorAll(".book-face"));
    var faceOn = [];
    var bookRunning = true;
    var bookReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var bookObs = new IntersectionObserver(function (entries) {
      bookRunning = entries[0].isIntersecting;
      if (bookRunning && !bookReduceMotion) requestAnimationFrame(drawBook);
    }, { threshold: 0.02 });
    bookObs.observe(bookCanvas);

    function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    var FLIPS = [0.125, 0.375, 0.625, 0.875], HW = 0.085;
    function flipAngle(p, ci) {
      return Math.PI * easeInOut(clamp01((p - (ci - HW)) / (2 * HW)));
    }
    function getProgress() {
      var r = readSection.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      return total > 0 ? clamp01(-r.top / total) : 0;
    }

    // Draw one page. theta=0 -> right side full; theta=PI -> settled left.
    function drawPage(page, spine, pageW, pageH, cy, theta, baseR, alphaMul, time) {
      var front = theta < Math.PI / 2;
      var c = Math.abs(Math.cos(theta));
      var side = front ? 1 : -1;
      var backRamp = front ? 1 : 0.45 + 0.55 * clamp01((theta - Math.PI / 2) / (Math.PI / 2));
      var flicker = Math.sin(time * 0.0016);
      for (var i = 0; i < page.length; i++) {
        var u = page[i][0], v = page[i][1], kind = page[i][2];
        var sx = spine + side * u * pageW * c;
        var sy = cy + (v - 0.5) * pageH;
        var col, a;
        if (kind === 2) { col = "#d4af37"; a = 0.55 + 0.25 * Math.sin(time * 0.001 + (u + v) * 9 + flicker); }
        else if (kind === 3) { col = "#d4af37"; a = 0.5; }
        else if (kind === 1) { col = "#6fa8dc"; a = 0.95; }
        else { col = "#6fa8dc"; a = 0.42; }
        bctx.globalAlpha = a * alphaMul * backRamp;
        bctx.fillStyle = col;
        bctx.beginPath();
        bctx.arc(sx, sy, Math.max(0.4, baseR * (0.3 + 0.7 * c)), 0, Math.PI * 2);
        bctx.fill();
      }
    }

    function drawSpine(spine, cy, pageH) {
      for (var y = cy - pageH / 2; y <= cy + pageH / 2; y += 6) {
        bctx.globalAlpha = 0.7;
        bctx.fillStyle = "#d4af37";
        bctx.beginPath();
        bctx.arc(spine, y, 1.1, 0, Math.PI * 2);
        bctx.fill();
      }
      bctx.globalAlpha = 1;
    }

    var lastP = -1;
    function drawBook() {
      if (!bookRunning) return;
      var w = bookCanvas.width / dpr, h = bookCanvas.height / dpr;
      var t = performance.now();
      bctx.clearRect(0, 0, w, h);
      var p = getProgress();
      var spine = w / 2;
      var pageW = Math.min(w * 0.30, h * 0.42);
      var pageH = pageW * 1.28;
      var cy = h * 0.52;
      var baseR = Math.max(1.1, pageW / 260);

      var th = FLIPS.map(function (c) { return flipAngle(p, c); });
      var midFlip = -1;
      for (var i = 0; i < th.length; i++) {
        if (th[i] > 0.001 && th[i] < Math.PI - 0.001) { midFlip = i; break; }
      }

      if (midFlip === -1 && th[0] < 0.001) {
        // Closed book: the cover as one panel, spine in the middle.
        drawPage(pages[0], spine - pageW, pageW * 2, pageH, cy, 0, baseR, 1, t);
        drawSpine(spine, cy, pageH);
      } else {
        if (midFlip === -1) {
          // Settled: left = last flipped page, right = the page being read.
          var done = 0;
          for (var d = 0; d < th.length; d++) { if (th[d] >= Math.PI - 0.001) done = d + 1; }
          if (done === 0) {
            // Before the cover moves: still a closed book.
            drawPage(pages[0], spine - pageW, pageW * 2, pageH, cy, 0, baseR, 1, t);
          } else {
            drawPage(pages[done - 1], spine, pageW, pageH, cy, Math.PI, baseR, 1, t); // left
            drawPage(pages[done], spine, pageW, pageH, cy, 0, baseR, 1, t);           // right
          }
        } else {
          if (midFlip > 0) drawPage(pages[midFlip - 1], spine, pageW, pageH, cy, Math.PI, baseR, 1, t);
          drawPage(pages[midFlip + 1], spine, pageW, pageH, cy, 0, baseR, 1, t);  // under-page
          drawPage(pages[midFlip], spine, pageW, pageH, cy, th[midFlip], baseR, 1, t); // flipping
        }
        drawSpine(spine, cy, pageH);
      }

      // Faces: the caption of the page you're reading.
      var windows = [
        [0.00, 0.10], // intro (cover closed)
        [0.20, 0.43], // chapter 01
        [0.45, 0.68], // chapter 02
        [0.70, 0.93], // chapter 03
        [0.95, 1.01]  // colophon
      ];
      for (var f = 0; f < faces.length; f++) {
        var on = p >= windows[f][0] && p < windows[f][1];
        if (on !== faceOn[f]) {
          faceOn[f] = on;
          faces[f].classList.toggle("on", on);
        }
      }
      lastP = p;
      requestAnimationFrame(drawBook);
    }

    if (bookReduceMotion) {
      // One static frame: the closed cover. Faces stack via CSS.
      var w0 = bookCanvas.width / dpr, h0 = bookCanvas.height / dpr;
      bctx.clearRect(0, 0, w0, h0);
      var pageW0 = Math.min(w0 * 0.30, h0 * 0.42), pageH0 = pageW0 * 1.28;
      drawPage(pages[0], w0 / 2 - pageW0, pageW0 * 2, pageH0, h0 * 0.52, 0, Math.max(1.1, pageW0 / 260), 1, 0);
      drawSpine(w0 / 2, h0 * 0.52, pageH0);
      faces.forEach(function (el) { el.classList.add("on"); });
    } else {
      requestAnimationFrame(drawBook);
    }
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
