(function () {
    "use strict";

    var THEME_KEY = "secureshot-theme";
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function getStoredTheme() {
        try {
            return localStorage.getItem(THEME_KEY);
        } catch (e) {
            return null;
        }
    }

    function syncThemeToggleLabel() {
        var btn = document.querySelector("[data-theme-toggle]");
        if (!btn) return;
        var attr = document.documentElement.getAttribute("data-theme");
        var systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        var effectiveLight = attr === "light" || (!attr && systemLight);
        btn.setAttribute("aria-label", effectiveLight ? "Switch to dark theme" : "Switch to light theme");
    }

    function applyTheme(theme) {
        if (theme === "light" || theme === "dark") {
            document.documentElement.setAttribute("data-theme", theme);
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
        syncThemeToggleLabel();
    }

    function initTheme() {
        var stored = getStoredTheme();
        if (stored === "light" || stored === "dark") {
            applyTheme(stored);
        } else {
            applyTheme(null);
        }

        document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var root = document.documentElement;
                var current = root.getAttribute("data-theme");
                var lightMq = window.matchMedia("(prefers-color-scheme: light)");
                var isLight =
                    current === "light" ||
                    (!current && lightMq.matches);
                var next = isLight ? "dark" : "light";
                try {
                    localStorage.setItem(THEME_KEY, next);
                } catch (e) {}
                applyTheme(next);
            });
        });
    }

    function initHeader() {
        var header = document.querySelector("[data-site-header]");
        if (!header) return;

        function onScroll() {
            header.classList.toggle("is-scrolled", window.scrollY > 24);
        }

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    function isLightTheme() {
        var t = document.documentElement.getAttribute("data-theme");
        if (t === "light") return true;
        if (t === "dark") return false;
        return window.matchMedia("(prefers-color-scheme: light)").matches;
    }

    /** Deterministic [0, 1) hash for grid coordinates */
    function cellHash(cx, cy, salt) {
        var s = salt || 0;
        var n = Math.sin(cx * 12.9898 + cy * 78.233 + s * 43.758) * 43758.5453;
        return n - Math.floor(n);
    }

    function initHeroMatrix() {
        var canvas = document.querySelector("[data-hero-matrix]");
        if (!canvas || !canvas.getContext) return;

        var ctx = canvas.getContext("2d", { alpha: false });
        var raf = 0;
        var start = performance.now();
        var reduced = prefersReducedMotion;

        function palette(light) {
            if (light) {
                return {
                    bg: "#ebe6dd",
                    grid: "rgba(44, 40, 37, 0.07)",
                    blue: [45, 95, 160],
                    gold: [175, 130, 40],
                };
            }
            return {
                bg: "#0c0d0f",
                grid: "rgba(255, 255, 255, 0.04)",
                blue: [100, 160, 230],
                gold: [220, 180, 90],
            };
        }

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        function mixRgb(base, target, t) {
            return [
                Math.round(lerp(base[0], target[0], t)),
                Math.round(lerp(base[1], target[1], t)),
                Math.round(lerp(base[2], target[2], t)),
            ];
        }

        function resize() {
            var parent = canvas.parentElement;
            if (!parent) return;
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var w = parent.clientWidth;
            var h = parent.clientHeight;
            canvas.width = Math.max(1, Math.floor(w * dpr));
            canvas.height = Math.max(1, Math.floor(h * dpr));
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function drawFrame(now) {
            var t = reduced ? 0 : now - start;
            var light = isLightTheme();
            var pal = palette(light);
            var w = canvas.clientWidth;
            var h = canvas.clientHeight;
            if (w < 1 || h < 1) {
                if (!reduced) {
                    raf = window.requestAnimationFrame(drawFrame);
                }
                return;
            }

            ctx.fillStyle = pal.bg;
            ctx.fillRect(0, 0, w, h);

            var cell = Math.max(10, Math.round(Math.min(w, h) / 56));
            var cols = Math.ceil(w / cell) + 1;
            var rows = Math.ceil(h / cell) + 1;
            var glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = '600 ' + Math.floor(cell * 0.62) + 'px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

            var waveA = t * 0.00035;
            var waveB = t * 0.00022;
            var sweepBand = Math.max(140, h * 0.24);
            var sweepY = reduced ? h * 0.42 : (t * 0.085) % (h + sweepBand * 2) - sweepBand;

            ctx.strokeStyle = pal.grid;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (var x = 0; x <= w; x += cell) {
                ctx.moveTo(x + 0.5, 0);
                ctx.lineTo(x + 0.5, h);
            }
            for (var y = 0; y <= h; y += cell) {
                ctx.moveTo(0, y + 0.5);
                ctx.lineTo(w, y + 0.5);
            }
            ctx.stroke();

            for (var cy = 0; cy < rows; cy++) {
                for (var cx = 0; cx < cols; cx++) {
                    var hx = cellHash(cx, cy, 1);
                    if (hx < 0.38) continue;

                    var px = cx * cell + cell * 0.5;
                    var py = cy * cell + cell * 0.5;

                    var phase =
                        Math.sin(waveA + cx * 0.11 + cy * 0.09) * 0.5 +
                        Math.sin(waveB * 1.3 - cy * 0.07 + cx * 0.05) * 0.35;
                    var gate = 0.35 + 0.65 * (0.5 + 0.5 * phase) * (0.45 + 0.55 * cellHash(cx, cy, 2));

                    var mix = cellHash(cx, cy, 3);
                    var isBlue = mix < 0.62;
                    var baseRgb = isBlue ? pal.blue : pal.gold;
                    var pulseRgb = light
                        ? isBlue
                            ? [25, 64, 118]
                            : [122, 86, 20]
                        : isBlue
                            ? [160, 205, 255]
                            : [245, 214, 140];
                    var dist = Math.abs(py - sweepY);
                    var sweep = Math.max(0, 1 - dist / sweepBand);
                    var sweepEase = sweep * sweep;
                    var rgb = mixRgb(baseRgb, pulseRgb, sweepEase);
                    var staticBoost = light ? 3 : 1;
                    var waveBoost = light ? 4 : 3;
                    var alpha = (light ? 0.06 : 0.05) + staticBoost * (light ? 0.2 : 0.28) * gate * (0.5 + 0.5 * hx);
                    alpha += waveBoost * (light ? 0.18 : 0.15) * sweepEase;

                    ctx.fillStyle = "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + alpha + ")";
                    var gi = Math.floor(cellHash(cx, cy, 4) * glyphs.length);
                    ctx.fillText(glyphs.charAt(gi), px, py);
                }
            }

            if (!reduced) {
                raf = window.requestAnimationFrame(drawFrame);
            }
        }

        function loop(now) {
            drawFrame(now || performance.now());
        }

        resize();
        if (reduced) {
            loop(start);
        } else {
            raf = window.requestAnimationFrame(drawFrame);
        }

        var ro =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(function () {
                      resize();
                      if (reduced) loop(start);
                  })
                : null;
        if (ro && canvas.parentElement) ro.observe(canvas.parentElement);
        window.addEventListener(
            "resize",
            function () {
                resize();
                if (reduced) loop(start);
            },
            { passive: true }
        );

        var mo = new MutationObserver(function () {
            if (reduced) loop(start);
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

        window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () {
            if (reduced) loop(start);
        });
    }

    function initReveal() {
        if (prefersReducedMotion) {
            document.querySelectorAll(".reveal").forEach(function (el) {
                el.classList.add("is-visible");
            });
            return;
        }

        var els = document.querySelectorAll(".reveal");
        if (!els.length || !("IntersectionObserver" in window)) {
            els.forEach(function (el) {
                el.classList.add("is-visible");
            });
            return;
        }

        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        io.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );

        els.forEach(function (el) {
            io.observe(el);
        });
    }

    function initSectionSpy() {
        var links = document.querySelectorAll("[data-section-link]");
        var sections = Array.prototype.map
            .call(["model", "features", "crypto"], function (id) {
                return document.getElementById(id);
            })
            .filter(Boolean);
        if (!links.length || !sections.length) return;

        function update() {
            if (window.scrollY < 120) {
                Array.prototype.forEach.call(links, function (l) {
                    l.classList.toggle("is-active", l.getAttribute("href") === "#model");
                });
                return;
            }
            var mid = window.innerHeight * 0.38;
            var current = null;
            var best = Infinity;
            sections.forEach(function (sec) {
                var r = sec.getBoundingClientRect();
                var dist = Math.abs(r.top + r.height / 2 - mid);
                if (r.top < window.innerHeight && r.bottom > 0 && dist < best) {
                    best = dist;
                    current = sec;
                }
            });
            var hash = current ? "#" + current.id : "#crypto";
            Array.prototype.forEach.call(links, function (l) {
                l.classList.toggle("is-active", l.getAttribute("href") === hash);
            });
        }

        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update, { passive: true });
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-nav-panel]");
        if (!toggle || !nav) return;

        function close() {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
        }

        function open() {
            nav.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
        }

        toggle.addEventListener("click", function () {
            if (nav.classList.contains("is-open")) close();
            else open();
        });

        nav.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", close);
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") close();
        });
    }

    function initFlowPanel() {
        var panel = document.querySelector("[data-flow-panel]");
        var nodes = document.querySelectorAll("[data-flow-key]");
        var copies = document.querySelectorAll("[data-flow-copy]");
        if (!panel || !nodes.length || !copies.length) return;

        function activate(key) {
            Array.prototype.forEach.call(nodes, function (n) {
                n.classList.toggle("is-active", n.getAttribute("data-flow-key") === key);
            });
            Array.prototype.forEach.call(copies, function (c) {
                c.classList.toggle("is-active", c.getAttribute("data-flow-copy") === key);
            });
        }

        function reset() {
            activate("device");
        }

        Array.prototype.forEach.call(nodes, function (n) {
            var key = n.getAttribute("data-flow-key");
            n.addEventListener("mouseenter", function () {
                activate(key);
            });
            n.addEventListener("focus", function () {
                activate(key);
            });
            n.addEventListener("click", function () {
                activate(key);
            });
        });

        panel.addEventListener("mouseleave", reset);
        panel.addEventListener("blur", function (e) {
            if (!panel.contains(e.relatedTarget)) reset();
        }, true);
    }

    function initTouchFlipCards() {
        var isTouchLike = window.matchMedia("(hover: none), (pointer: coarse)").matches;
        if (!isTouchLike) return;

        var cards = document.querySelectorAll("[data-flip-card]");
        if (!cards.length) return;

        Array.prototype.forEach.call(cards, function (card) {
            card.addEventListener("click", function () {
                var next = !card.classList.contains("is-flipped");
                card.classList.toggle("is-flipped", next);
                card.setAttribute("aria-pressed", next ? "true" : "false");
            });

            card.addEventListener("keydown", function (e) {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                var next = !card.classList.contains("is-flipped");
                card.classList.toggle("is-flipped", next);
                card.setAttribute("aria-pressed", next ? "true" : "false");
            });
        });
    }

    function initSafariCardFallback() {
        var ua = navigator.userAgent || "";
        var vendor = navigator.vendor || "";
        var isSafari =
            /Safari/i.test(ua) &&
            /Apple/i.test(vendor) &&
            !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Chromium/i.test(ua);

        if (!isSafari) return;
        document.documentElement.classList.add("safari-simple-cards");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    function boot() {
        initTheme();
        initHeader();
        initHeroMatrix();
        initReveal();
        initSectionSpy();
        initMobileNav();
        initFlowPanel();
        initTouchFlipCards();
        initSafariCardFallback();
    }
})();
