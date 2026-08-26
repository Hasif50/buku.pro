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

  /* ---- Illuminated Ledger: enhanced motion (preloader, Lenis, GSAP) ---- */

  // Preloader — the book opens, then the curtain lifts away.
  var preloader = document.getElementById("preloader");
  if (preloader) {
    var lift = function () {
      preloader.classList.add("done");
      setTimeout(function () {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 800);
    };
    if (document.readyState === "complete") {
      setTimeout(lift, 600);
    } else {
      window.addEventListener("load", function () { setTimeout(lift, 600); });
    }
    setTimeout(lift, 3000); // safety: never trap content if load stalls
  }

  // Lenis smooth scroll, synced to GSAP ScrollTrigger when both are present.
  var lenis;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    document.documentElement.style.scrollBehavior = "auto"; // Lenis drives smoothing
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var lraf = function (time) { lenis.raf(time); requestAnimationFrame(lraf); };
      requestAnimationFrame(lraf);
    }
  }

  // GSAP scroll motion — headline ink-reveals + the open-book page turn.
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    // Headlines rise out of the ink as they enter the viewport.
    window.gsap.utils.toArray(".h2, .section-head .lead").forEach(function (el) {
      window.gsap.fromTo(el,
        { y: 26, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
        {
          y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" }
        }
      );
    });

    // The open book turns (depth parallax) as you scroll through the hero.
    var constel = document.querySelector(".constellation");
    if (constel) {
      constel.classList.add("in");       // settle the reveal state
      constel.style.transition = "none"; // let GSAP own the transform
      window.gsap.to(constel, {
        y: -56, scale: 0.97, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });

      // 3D page tilt — the open book leans toward the cursor (fine-pointer only).
      if (window.matchMedia("(pointer: fine)").matches) {
        var heroEl = document.querySelector(".hero");
        window.gsap.set(constel, { transformPerspective: 900 });
        var tiltX = window.gsap.quickTo(constel, "rotationX", { duration: 0.6, ease: "power2.out" });
        var tiltY = window.gsap.quickTo(constel, "rotationY", { duration: 0.6, ease: "power2.out" });
        heroEl.addEventListener("mousemove", function (e) {
          var r = heroEl.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          tiltY(px * 12);
          tiltX(-py * 10);
        });
        heroEl.addEventListener("mouseleave", function () {
          tiltX(0);
          tiltY(0);
        });
      }
    }
  }

  // Ambient starlight — a twinkling, slowly-drifting starfield behind the hero.
  var starCanvas = document.querySelector(".starfield");
  if (starCanvas && !reduceMotion) {
    var sctx = starCanvas.getContext("2d");
    var stars = [];
    function sizeStars() {
      starCanvas.width = starCanvas.offsetWidth;
      starCanvas.height = starCanvas.offsetHeight;
    }
    sizeStars();
    window.addEventListener("resize", sizeStars);
    var starCount = Math.min(120, Math.floor((starCanvas.width * starCanvas.height) / 9000));
    for (var i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: Math.random() * 1.2 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.4,
        drift: 0.02 + Math.random() * 0.06
      });
    }
    var starT = 0;
    (function drawStars() {
      starT += 0.016;
      sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      for (var j = 0; j < stars.length; j++) {
        var s = stars[j];
        s.y += s.drift;
        if (s.y > starCanvas.height + 2) { s.y = -2; s.x = Math.random() * starCanvas.width; }
        sctx.globalAlpha = 0.18 + 0.55 * (0.5 + 0.5 * Math.sin(starT * s.speed + s.phase));
        sctx.fillStyle = "#cfe2f4";
        sctx.beginPath();
        sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sctx.fill();
      }
      sctx.globalAlpha = 1;
      requestAnimationFrame(drawStars);
    })();
  }

  // Scroll progress (gold hairline) — works with or without GSAP.
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

  // Split-text hero headline — words rise from ink, gold word keeps its gradient.
  if (window.SplitType && window.gsap && !reduceMotion) {
    var display = document.querySelector(".hero-copy .display");
    if (display) {
      display.style.animation = "none"; // disable CSS ink-reveal, use JS split
      var split = new window.SplitType(display, { types: "words" });
      display.querySelectorAll(".grad .word").forEach(function (w) {
        w.style.background = "var(--grad)";
        w.style.webkitBackgroundClip = "text";
        w.style.backgroundClip = "text";
        w.style.color = "transparent";
        w.style.backgroundSize = "200% auto";
        w.style.animation = "shimmer 7s linear infinite";
      });
      window.gsap.fromTo(split.words,
        { y: "0.6em", opacity: 0, filter: "blur(6px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out", stagger: 0.06, delay: 0.1 }
      );
    }
  }

  // Chapters — pinned scroll narrative (desktop only).
  var stage = document.querySelector(".chapters-stage");
  if (stage && window.gsap && window.ScrollTrigger && !reduceMotion && window.matchMedia("(min-width: 901px)").matches) {
    stage.classList.add("is-pinned");
    var chEls = stage.querySelectorAll(".chapter");
    window.gsap.set(chEls, { opacity: 0, y: 44 });
    var chTl = window.gsap.timeline({
      scrollTrigger: {
        trigger: ".chapters",
        start: "top top",
        end: "+=180%",
        pin: true,
        scrub: 1
      }
    });
    chTl.to(chEls[0], { opacity: 1, y: 0, duration: 1 })
      .to(chEls[0], { opacity: 0, y: -44, duration: 1 })
      .to(chEls[1], { opacity: 1, y: 0, duration: 1 }, "-=0.85")
      .to(chEls[1], { opacity: 0, y: -44, duration: 1 })
      .to(chEls[2], { opacity: 1, y: 0, duration: 1 }, "-=0.85");
  }
})();
