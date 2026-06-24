# 5 Interactive Features for Bhoomi Decoration Website

Adding 5 high-conversion interactive features to `index.html` and `app.js` that make the site genuinely unforgettable.

## Proposed Changes

### Feature 1 — 💰 Budget Calculator
A live estimation tool with sliders for:
- Guest count (50 – 2000)
- Number of functions (1–6: Haldi, Mehendi, Sangeet, Wedding, Reception, Engagement)
- Venue type toggle (Indoor / Outdoor / Farmhouse)
- Mandap style (Simple / Premium / Luxury)

Output: Live animated cost range breakdown by category (Mandap, Florals, Lighting, Stage, Extras)

### Feature 2 — 🖼️ Before & After Drag Reveal
A single image comparison slider showing a bare banquet hall transformed by decor. Uses a `<canvas>` or CSS clip-path approach. Draggable handle reveals the "after" side in real time.

Uses two SVG illustrations (before: plain hall, after: decorated mandap) since we can't rely on uploaded photos.

### Feature 3 — 🎭 Ceremony Type Matcher
5 community tabs (Gujarati / Maharashtrian / Punjabi / South Indian / Muslim). Each tab shows:
- Specific mandap styles typical for that community
- Rituals Bhoomi understands (for trust)
- Relevant service highlights
- CTA to enquire for that style

### Feature 4 — 📋 Live Quote Estimator
4 quick dropdown questions:
1. City (Ahmedabad / Mumbai / Surat / Vadodara / Other Gujarat)
2. Number of functions (1 / 2 / 3-4 / Full Package)
3. Guest count (Under 200 / 200-500 / 500-1000 / 1000+)
4. Style preference (Classic / Modern Fusion / Traditional Royal)

Instantly shows: "Your setup would typically range between ₹X – ₹Y" with a breakdown, then one WhatsApp CTA.

### Feature 5 — 💍 Wedding Style Finder
A multi-step interactive card selector:
- Step 1: Pick function (Haldi / Mehendi / Sangeet / Wedding / Reception)
- Step 2: Pick vibe (Romantic / Traditional / Modern / Royal / Boho)
- Step 3: Pick palette (8 colour combinations)

Generates a live SVG mandap preview that recolours in real time + a "concept card" description.

> **Note**: The 360° Venue Visualiser (upload + overlay) is technically complex and requires AI/image processing backend. We'll skip this one for now and implement a simplified version as a style overlay picker instead.

## File Changes

### [MODIFY] [index.html](file:///h:/CODE%20(HEM)/Somthing%20Crazy/frontend/index.html)
- Add nav links for the 5 new sections
- Add all 5 section HTML blocks (after gallery, before contact/footer)
- Add `<script src="interactive.js">` at bottom

### [NEW] [interactive.js](file:///h:/CODE%20(HEM)/Somthing%20Crazy/frontend/interactive.js)
- All JavaScript for the 5 interactive features
- Self-contained, no external dependencies

### [MODIFY] [styles.css](file:///h:/CODE%20(HEM)/Somthing%20Crazy/frontend/styles.css)
- Add styles for all 5 new sections (sliders, tabs, cards, drag reveal, etc.)

### [NEW] Route for interactive.js in main.py
- `@app.get("/interactive.js")` to serve the new JS file

## Verification Plan
- Open `http://127.0.0.1:8000` and verify all 5 sections appear
- Test each interactive widget works on desktop and mobile
- Check animations and recolour logic in Style Finder
