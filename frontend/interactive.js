// ============================================================
// BHOOMI DECORATION — 5 INTERACTIVE FEATURES
// interactive.js — Self-contained, zero external dependencies
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initBudgetCalculator();
    initBeforeAfterReveal();
    initCeremonyMatcher();
    initQuoteEstimator();
    initStyleFinder();
    initRevealObserver();
});

// ─── Reveal Observer for Section Animations ─────────────────
function initRevealObserver() {
    const els = document.querySelectorAll(".interactive-reveal");
    if (!("IntersectionObserver" in window)) {
        els.forEach(el => el.classList.add("revealed"));
        return;
    }
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 1: BUDGET CALCULATOR
// ═══════════════════════════════════════════════════════════════
function initBudgetCalculator() {
    const sec = document.getElementById("budget-calculator");
    if (!sec) return;

    const VENUE_MULTIPLIER = { indoor: 1.0, outdoor: 1.25, farmhouse: 1.4 };
    const STYLE_MULTIPLIER = { simple: 0.75, premium: 1.0, royal: 1.55 };
    const BASE_PER_GUEST = 180;
    const FUNCTION_COST = { 1: 0, 2: 8000, 3: 18000, 4: 30000, 5: 45000, 6: 62000 };

    function calc() {
        const guests = parseInt(document.getElementById("bc-guests").value) || 200;
        const fns = parseInt(document.getElementById("bc-functions").value) || 2;
        const venue = document.querySelector(".bc-venue-btn.active")?.dataset.v || "indoor";
        const style = document.querySelector(".bc-style-btn.active")?.dataset.s || "premium";

        document.getElementById("bc-guests-val").innerText = guests.toLocaleString("en-IN");
        document.getElementById("bc-fn-val").innerText = fns;

        const vm = VENUE_MULTIPLIER[venue];
        const sm = STYLE_MULTIPLIER[style];
        const baseMandap = (guests * BASE_PER_GUEST * sm * vm);
        const fnExtra = FUNCTION_COST[fns] || 0;
        const florals = baseMandap * 0.3;
        const lighting = baseMandap * 0.2;
        const total = baseMandap + fnExtra;
        const extras = baseMandap * 0.05 + fnExtra;
        const totalLow = Math.round(total * 0.85 / 1000) * 1000;
        const totalHigh = Math.round(total * 1.15 / 1000) * 1000;

        const fmt = n => "₹" + Math.round(n / 1000).toLocaleString("en-IN") + "k";

        const bars = [
            { id: "bc-bar-mandap",   label: "Mandap & Structure",  pct: 35, val: Math.round(baseMandap * 0.35) },
            { id: "bc-bar-florals",  label: "Florals & Garlands",  pct: Math.round(florals / total * 100), val: Math.round(florals) },
            { id: "bc-bar-lighting", label: "Lighting & Stage",     pct: Math.round(lighting / total * 100), val: Math.round(lighting) },
            { id: "bc-bar-extras",   label: "Functions & Extras",   pct: Math.round(extras / total * 100), val: Math.round(extras) },
        ];

        bars.forEach(b => {
            const bar = document.getElementById(b.id);
            if (bar) {
                bar.style.width = Math.max(4, b.pct) + "%";
                const row = bar.closest(".bc-bar-row");
                if (row) {
                    const label = row.querySelector(".bc-bar-label");
                    const amount = row.querySelector(".bc-bar-amount");
                    if (label) label.innerText = b.label;
                    if (amount) amount.innerText = fmt(b.val);
                }
            }
        });

        const lo = document.getElementById("bc-total-lo");
        const hi = document.getElementById("bc-total-hi");
        if (lo) lo.innerText = fmt(totalLow);
        if (hi) hi.innerText = fmt(totalHigh);
    }

    ["bc-guests", "bc-functions"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", calc);
    });

    sec.querySelectorAll(".bc-venue-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            sec.querySelectorAll(".bc-venue-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            calc();
        });
    });

    sec.querySelectorAll(".bc-style-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            sec.querySelectorAll(".bc-style-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            calc();
        });
    });

    calc();
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 2: BEFORE & AFTER DRAG REVEAL
// ═══════════════════════════════════════════════════════════════
function initBeforeAfterReveal() {
    const container = document.getElementById("ba-container");
    if (!container) return;
    const handle = document.getElementById("ba-handle");
    const afterEl = document.getElementById("ba-after");
    let dragging = false;
    let pct = 50;

    function setPos(x) {
        const rect = container.getBoundingClientRect();
        pct = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
        afterEl.style.clipPath = "inset(0 0 0 " + pct + "%)";
        handle.style.left = pct + "%";
        const lbl = document.getElementById("ba-pct-label");
        if (lbl) lbl.innerText = Math.round(pct) + "%";
    }

    handle.addEventListener("mousedown", e => { dragging = true; e.preventDefault(); });
    window.addEventListener("mouseup", () => { dragging = false; });
    window.addEventListener("mousemove", e => { if (dragging) setPos(e.clientX); });

    handle.addEventListener("touchstart", e => { dragging = true; e.preventDefault(); }, { passive: false });
    window.addEventListener("touchend", () => { dragging = false; });
    window.addEventListener("touchmove", e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });

    handle.setAttribute("tabindex", "0");
    handle.addEventListener("keydown", e => {
        const rect = container.getBoundingClientRect();
        if (e.key === "ArrowLeft") { pct = Math.max(2, pct - 2); setPos(rect.left + (pct / 100) * rect.width); }
        if (e.key === "ArrowRight") { pct = Math.min(98, pct + 2); setPos(rect.left + (pct / 100) * rect.width); }
    });

    // Auto-demo animation on load
    let autoAnimDone = false;
    const autoAnim = () => {
        if (autoAnimDone) return;
        autoAnimDone = true;
        let p = 50, dir = -1;
        const rect = container.getBoundingClientRect();
        const step = () => {
            p += dir * 0.8;
            if (p <= 10) { dir = 1; }
            if (p >= 50) { setPos(rect.left + (p / 100) * rect.width); return; }
            setPos(rect.left + (p / 100) * rect.width);
            requestAnimationFrame(step);
        };
        step();
    };

    const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { setTimeout(autoAnim, 600); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(container);

    setPos(container.getBoundingClientRect().left + container.getBoundingClientRect().width * 0.5);
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 3: CEREMONY TYPE MATCHER
// ═══════════════════════════════════════════════════════════════
function initCeremonyMatcher() {
    const sec = document.getElementById("ceremony-matcher");
    if (!sec) return;

    const DATA = {
        gujarati: {
            label: "Gujarati", emoji: "🌻",
            mandapStyles: ["Four-pillar with Rajasthani jali work", "Floral tunnel entrance with marigold", "Torana with mango leaves & coconut"],
            rituals: ["Madhuparka welcome ceremony", "Kanyadaan & Saptapadi", "Ponkhal ritual with sacred fire", "Hastamelap — joined hand blessing"],
            palette: ["Deep saffron + ivory + gold", "Vibrant yellow + green + red", "Peacock blue + gold + white"],
            note: "Gujarati weddings love vivid colour and intricate craftsmanship. We specialise in jali-panel mandaps and saffron-marigold garland work typical of Saurashtra and Central Gujarat."
        },
        maharashtrian: {
            label: "Maharashtrian", emoji: "🌺",
            mandapStyles: ["Suvarna-chan mandap with banana columns", "Simple 4-pillar with mango leaf torana", "Modern minimalist with rangoli floor"],
            rituals: ["Sakhar puda (engagement setup)", "Muhurta — sacred fire timing", "Mangalsutra ceremony", "Antarpat — curtain reveal moment"],
            palette: ["Green + red + gold (traditional)", "White + gold + marigold", "Ivory + dark green + turmeric yellow"],
            note: "Maharashtrian weddings blend simplicity with deep symbolism. Our team understands the antarpat curtain moment, banana columns, and correct muhurta timing for mandap readiness."
        },
        punjabi: {
            label: "Punjabi", emoji: "🌸",
            mandapStyles: ["Grand floating canopy with draping silks", "Phoolon ki chaadar archway", "LED backdrop with heavy floral pillars"],
            rituals: ["Chunni ceremony & Shagun", "Anand Karaj — four laavan rounds", "Doli departure decor", "Joota chupai setup station"],
            palette: ["Hot pink + gold + ivory", "Royal blue + mustard + white", "Fuchsia + emerald + champagne"],
            note: "Punjabi weddings demand grandeur. We build statement canopy mandaps with flowing silk draping, neon florals, and backdrops that look incredible under uplighting at night functions."
        },
        southindian: {
            label: "South Indian", emoji: "🌿",
            mandapStyles: ["Kolam-patterned mandap base", "Bronze lamp (kuthuvilakku) arrangements", "Banana + mango leaf pillars with jasmine"],
            rituals: ["Nalangu — turmeric ritual", "Oonjal — swing ceremony", "Thaali tying (Mangalsutra)", "Kashi Yatra groom procession"],
            palette: ["Jasmine white + turmeric yellow + gold", "Red silk + gold zari + green", "Ivory + sandalwood + temple gold"],
            note: "South Indian weddings follow precise ritual timing and aesthetic. We carefully plan jasmine garland supply, lamp placement, and swing setup around the correct ceremony sequence."
        },
        muslim: {
            label: "Muslim / Nikah", emoji: "🌙",
            mandapStyles: ["Arched stage with hanging chandeliers", "Floral Nikah seating (floor cushions)", "Grand backdrop with calligraphic panels"],
            rituals: ["Nikah ceremony seating setup", "Meher display arrangement", "Walima reception backdrop", "Baraat welcome arch"],
            palette: ["Ivory + rose gold + blush", "Deep green + gold + white", "Burgundy + silver + champagne"],
            note: "Nikah ceremonies require dignified, elegant setups that respect tradition while creating a visually stunning backdrop. We specialise in arch-frame stages, calligraphy panels, and floral chandeliers."
        }
    };

    function render(key) {
        const d = DATA[key];
        const panel = sec.querySelector(".cm-panel");
        if (!panel) return;
        panel.innerHTML = `
            <div class="cm-panel-head">
                <div class="cm-panel-emoji">${d.emoji}</div>
                <h3>${d.label} Wedding Decor</h3>
                <p class="cm-note">${d.note}</p>
            </div>
            <div class="cm-panel-body">
                <div class="cm-col">
                    <div class="cm-col-title">✦ Mandap Styles We Build</div>
                    <ul>${d.mandapStyles.map(s => "<li>" + s + "</li>").join("")}</ul>
                </div>
                <div class="cm-col">
                    <div class="cm-col-title">✦ Rituals We Understand</div>
                    <ul>${d.rituals.map(r => "<li>" + r + "</li>").join("")}</ul>
                </div>
                <div class="cm-col">
                    <div class="cm-col-title">✦ Favourite Palettes</div>
                    <ul>${d.palette.map(p => "<li>" + p + "</li>").join("")}</ul>
                </div>
            </div>
            <a href="#contact" class="btn btn-primary" style="margin-top:1.5rem; display:inline-block;">Enquire for ${d.label} Wedding</a>
        `;
        panel.classList.add("cm-panel-animate");
        setTimeout(() => panel.classList.remove("cm-panel-animate"), 400);
    }

    sec.querySelectorAll(".cm-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            sec.querySelectorAll(".cm-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            render(tab.dataset.community);
        });
    });

    render("gujarati");
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 4: LIVE QUOTE ESTIMATOR
// ═══════════════════════════════════════════════════════════════
function initQuoteEstimator() {
    const sec = document.getElementById("quote-estimator");
    if (!sec) return;

    const CITY_FACTOR  = { ahmedabad: 1.0, mumbai: 1.35, surat: 0.95, vadodara: 0.90, other: 0.85 };
    const FN_FACTOR    = { "1": 0.5, "2": 0.75, "34": 1.0, "full": 1.4 };
    const GUEST_FACTOR = { "u200": 0.55, "200500": 1.0, "5001k": 1.4, "1kplus": 1.85 };
    const STYLE_MULT   = { classic: 0.85, fusion: 1.0, royal: 1.45 };
    const BASE = 70000;

    function fmt(n) {
        return "₹" + (n >= 100000 ? (n / 100000).toFixed(1) + "L" : Math.round(n / 1000) + "k");
    }

    function getFnDesc(fns) {
        return { "1": "Main wedding mandap & ceremony setup", "2": "Mandap + one pre-wedding function", "34": "Mandap + Haldi + Mehendi or Sangeet", "full": "Complete package — Haldi, Mehendi, Sangeet, Wedding & Reception" }[fns] || "";
    }
    function getStyleDesc(style) {
        return { classic: "Fresh florals, traditional mandap, simple uplighting", fusion: "Premium florals, LED backdrop, custom colour palette", royal: "Imported florals, floating mandap, chandeliers, full venue styling" }[style] || "";
    }

    function calc() {
        const city   = document.getElementById("qe-city")?.value || "ahmedabad";
        const fns    = document.getElementById("qe-fns")?.value || "2";
        const guests = document.getElementById("qe-guests")?.value || "200500";
        const style  = document.getElementById("qe-style")?.value || "fusion";

        const estimate = BASE * (CITY_FACTOR[city] || 1) * (FN_FACTOR[fns] || 1) * (GUEST_FACTOR[guests] || 1) * (STYLE_MULT[style] || 1);
        const lo = Math.round(estimate * 0.85 / 5000) * 5000;
        const hi = Math.round(estimate * 1.15 / 5000) * 5000;

        const resultEl = document.getElementById("qe-result");
        if (resultEl) {
            resultEl.innerHTML =
                "<div class='qe-range'>" + fmt(lo) + " <span>\u2014</span> " + fmt(hi) + "</div>" +
                "<div class='qe-includes'><b>" + getFnDesc(fns) + "</b><br>" + getStyleDesc(style) + "</div>";
            resultEl.classList.add("qe-pop");
            setTimeout(() => resultEl.classList.remove("qe-pop"), 300);
        }
    }

    ["qe-city", "qe-fns", "qe-guests", "qe-style"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", calc);
    });

    calc();

    document.getElementById("qe-whatsapp-btn")?.addEventListener("click", () => {
        const get = id => document.getElementById(id);
        const opt = id => { const el = get(id); return el?.options[el.selectedIndex]?.text || ""; };
        const range = document.querySelector(".qe-range")?.innerText || "";
        const msg = "Hi Bhoomi Decoration! I used your quote estimator and got an estimate of " + range + ".\nCity: " + opt("qe-city") + " | Functions: " + opt("qe-fns") + " | Guests: " + opt("qe-guests") + " | Style: " + opt("qe-style") + "\nCan we discuss further?";
        window.open("https://wa.me/919876543210?text=" + encodeURIComponent(msg), "_blank");
    });
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 5: WEDDING STYLE FINDER
// ═══════════════════════════════════════════════════════════════
function initStyleFinder() {
    const sec = document.getElementById("style-finder");
    if (!sec) return;

    const FUNCTIONS = [
        { id: "haldi",     label: "Haldi",     emoji: "🌼" },
        { id: "mehendi",   label: "Mehendi",   emoji: "🌿" },
        { id: "sangeet",   label: "Sangeet",   emoji: "🎶" },
        { id: "wedding",   label: "Wedding",   emoji: "💍" },
        { id: "reception", label: "Reception", emoji: "✨" },
    ];
    const VIBES = [
        { id: "romantic",    label: "Romantic",    emoji: "🌸" },
        { id: "traditional", label: "Traditional", emoji: "🏛️" },
        { id: "modern",      label: "Modern",      emoji: "⚡" },
        { id: "royal",       label: "Royal",       emoji: "👑" },
        { id: "boho",        label: "Boho",        emoji: "🌾" },
    ];
    const PALETTES = [
        { id: "saffron_gold",      label: "Saffron & Gold",        colors: ["#E85B04","#C9941F","#FFF3E0"] },
        { id: "rose_ivory",        label: "Rose & Ivory",          colors: ["#B5416B","#F8EBE8","#8B1A4A"] },
        { id: "peacock",           label: "Peacock & Gold",        colors: ["#005F73","#0A9396","#C9941F"] },
        { id: "marigold",          label: "Marigold & Green",      colors: ["#F4A111","#1F4B43","#FFF8E7"] },
        { id: "blush_gold",        label: "Blush & Gold",          colors: ["#F4C7C3","#C9941F","#FFF0EE"] },
        { id: "maroon_ivory",      label: "Maroon & Ivory",        colors: ["#6B1623","#C9941F","#F5F0E8"] },
        { id: "indigo_peach",      label: "Indigo & Peach",        colors: ["#3A0CA3","#F8A07A","#FFF3EE"] },
        { id: "emerald_champagne", label: "Emerald & Champagne",   colors: ["#1F4B43","#C9B48A","#F7F4ED"] },
    ];
    const COPY = {
        haldi:     { romantic:"Soft turmeric clouds, loose garden florals, and pastel drapery — intimate and personal.", traditional:"A classic banana-pillar haldi mandap with marigold garlands and copper vessels.", modern:"Clean geometric base, neon sign, minimal flowers with structural art.", royal:"Elevated haldi pavilion with gilded pillars and cascading floral curtains.", boho:"Wicker furniture, dried pampas, wildflowers, and macramé backdrop panels." },
        mehendi:   { romantic:"Low seating surrounded by pink and white florals, fairy lights, and draping fabric.", traditional:"Floor cushion setup with traditional torana and aromatic jasmine garland canopy.", modern:"Tropical green monstera backdrop, brass accents, Instagram-perfect arches.", royal:"Gilded throne-style seats, mirror-work backdrop, imported rose petal carpet.", boho:"Rattan swings, wildflower pots, dreamcatcher panels, and earthy cloth draping." },
        sangeet:   { romantic:"Glitter backdrop, soft rose gold uplighting, sweetheart table for first performance.", traditional:"Stage backdrop with deity-inspired cutwork and warm gold wash lighting.", modern:"LED pixel wall, clean monogram letters, colour-changing spotlights.", royal:"Grand crystal chandelier stage, plum velvet draping, silver-and-gold palette.", boho:"Neon sign stage, macramé panels, Edison bulbs, organic-shaped flower arches." },
        wedding:   { romantic:"Blush and dusty rose mandap with floating canopy and flowing fabric panels.", traditional:"Classic 4-pillar wooden mandap, marigold garlands, copper oil lamps, agni kund.", modern:"Acrylic panels, geometric gold frame mandap, clean white-and-gold palette.", royal:"Floating mandap with crystal drapes, imported orchids, and white marble floor wrap.", boho:"Pampas-and-greenery arch mandap, rattan accents, muted terracotta and sage palette." },
        reception: { romantic:"Soft fairy-light canopy, blush floral stage with trailing greens.", traditional:"Heritage-inspired backdrop with carved wooden arch and marigold pillars.", modern:"Giant illuminated letters, geometric mirror panels, dramatic LED uplighting.", royal:"Grand ballroom backdrop with cascading crystal curtains and candlelight columns.", boho:"Outdoor or indoor boho arch, string lights overhead, lush green and terracotta tones." }
    };

    let sel = { fn: "wedding", vibe: "traditional", palette: "saffron_gold" };

    function renderMandap(palId) {
        const pal = PALETTES.find(x => x.id === palId) || PALETTES[0];
        const [c1, c2, c3] = pal.colors;
        const dots = [85,115,145,180,215,245,275].map((x, i) => {
            const cy = 48 + Math.sin((i / 6) * Math.PI) * 30 + 5;
            return "<circle cx='" + x + "' cy='" + cy + "' r='4' fill='" + (i % 2 === 0 ? c1 : c2) + "' opacity='0.85'/>";
        }).join("");
        return "<svg viewBox='0 0 360 300' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>" +
            "<rect x='40' y='240' width='280' height='50' rx='4' fill='" + c3 + "' opacity='0.5'/>" +
            "<path d='M60 260 V150 C60 70 130 20 180 20 C230 20 300 70 300 150 V260' fill='none' stroke='" + c1 + "' stroke-width='5'/>" +
            "<path d='M85 260 V155 C85 90 140 48 180 48 C220 48 275 90 275 155 V260' fill='none' stroke='" + c2 + "' stroke-width='3'/>" +
            "<rect x='60' y='160' width='30' height='80' rx='4' fill='" + c1 + "' opacity='0.2'/>" +
            "<rect x='270' y='160' width='30' height='80' rx='4' fill='" + c1 + "' opacity='0.2'/>" +
            "<ellipse cx='180' cy='20' rx='10' ry='6' fill='" + c2 + "'/>" +
            "<circle cx='180' cy='12' r='5' fill='" + c1 + "'/>" +
            "<circle cx='155' cy='28' r='4' fill='" + c2 + "' opacity='0.7'/>" +
            "<circle cx='205' cy='28' r='4' fill='" + c2 + "' opacity='0.7'/>" +
            "<path d='M85 48 Q180 75 275 48' fill='none' stroke='" + c1 + "' stroke-width='2.5' opacity='0.7'/>" +
            "<path d='M85 48 Q130 95 180 85 Q230 95 275 48' fill='none' stroke='" + c2 + "' stroke-width='1.5' opacity='0.5'/>" +
            dots +
            "<rect x='56' y='120' width='38' height='12' rx='3' fill='" + c2 + "' opacity='0.45'/>" +
            "<rect x='266' y='120' width='38' height='12' rx='3' fill='" + c2 + "' opacity='0.45'/>" +
            "<rect x='125' y='222' width='50' height='20' rx='6' fill='" + c1 + "' opacity='0.3'/>" +
            "<rect x='185' y='222' width='50' height='20' rx='6' fill='" + c1 + "' opacity='0.3'/>" +
            "<rect x='100' y='238' width='160' height='8' rx='2' fill='" + c2 + "' opacity='0.45'/>" +
            "</svg>";
    }

    function renderCard() {
        const pal = PALETTES.find(p => p.id === sel.palette) || PALETTES[0];
        const copy = (COPY[sel.fn] && COPY[sel.fn][sel.vibe]) || "A beautiful, custom-designed setup awaits.";
        const fnLabel = FUNCTIONS.find(f => f.id === sel.fn)?.label || "";
        const vibeLabel = VIBES.find(v => v.id === sel.vibe)?.label || "";

        const preview = document.getElementById("sf-mandap-preview");
        const desc = document.getElementById("sf-concept-desc");
        const title = document.getElementById("sf-concept-title");
        const swatches = document.getElementById("sf-palette-swatches");

        if (preview) preview.innerHTML = renderMandap(sel.palette);
        if (title) title.innerText = vibeLabel + " " + fnLabel + " — " + pal.label;
        if (desc) desc.innerText = copy;
        if (swatches) swatches.innerHTML = pal.colors.map(c => "<div class='sf-swatch' style='background:" + c + ";' title='" + c + "'></div>").join("");
    }

    function makePills(container, items, key, dataAttr) {
        if (!container) return;
        container.innerHTML = items.map(item =>
            "<button class='sf-pill" + (item.id === sel[key] ? " active" : "") + "' data-" + dataAttr + "='" + item.id + "'>" + item.emoji + " " + item.label + "</button>"
        ).join("");
        container.querySelectorAll(".sf-pill").forEach(btn => {
            btn.addEventListener("click", () => {
                container.querySelectorAll(".sf-pill").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                sel[key] = btn.dataset[dataAttr];
                renderCard();
            });
        });
    }

    makePills(sec.querySelector(".sf-fn-grid"), FUNCTIONS, "fn", "fn");
    makePills(sec.querySelector(".sf-vibe-grid"), VIBES, "vibe", "vibe");

    const palGrid = sec.querySelector(".sf-palette-grid");
    if (palGrid) {
        palGrid.innerHTML = PALETTES.map(p =>
            "<button class='sf-palette-chip" + (p.id === sel.palette ? " active" : "") + "' data-pal='" + p.id + "' title='" + p.label + "'>" +
            "<div class='sf-chip-colors'>" + p.colors.map(c => "<span style='background:" + c + "'></span>").join("") + "</div>" +
            "<div class='sf-chip-label'>" + p.label + "</div>" +
            "</button>"
        ).join("");
        palGrid.querySelectorAll(".sf-palette-chip").forEach(btn => {
            btn.addEventListener("click", () => {
                palGrid.querySelectorAll(".sf-palette-chip").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                sel.palette = btn.dataset.pal;
                renderCard();
            });
        });
    }

    renderCard();

    document.getElementById("sf-save-btn")?.addEventListener("click", function() {
        const pal = PALETTES.find(p => p.id === sel.palette);
        const fn = FUNCTIONS.find(f => f.id === sel.fn);
        const vibe = VIBES.find(v => v.id === sel.vibe);
        const txt = "My Bhoomi Style: " + fn?.label + " | " + vibe?.label + " vibe | " + pal?.label + " palette.\nFound at bhoomidecoration.com";
        if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).then(() => { this.innerText = "✓ Copied!"; setTimeout(() => { this.innerText = "📋 Copy This Concept"; }, 2000); });
        }
    });

    document.getElementById("sf-enquire-btn")?.addEventListener("click", () => {
        const pal = PALETTES.find(p => p.id === sel.palette);
        const fn = FUNCTIONS.find(f => f.id === sel.fn);
        const vibe = VIBES.find(v => v.id === sel.vibe);
        const msg = "Hi! I loved the " + vibe?.label + " " + fn?.label + " concept with " + pal?.label + " palette from your Style Finder. Can we discuss?";
        window.open("https://wa.me/919876543210?text=" + encodeURIComponent(msg), "_blank");
    });
}
