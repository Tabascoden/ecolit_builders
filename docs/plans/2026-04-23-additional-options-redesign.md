# Additional Options Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Additional options section into a reference-inspired 2x2 icon-card layout with a decorative section background.

**Architecture:** Keep the existing section id and overall page flow, but replace the section internals with a more expressive wrapper, richer card structure, and dedicated section styling. Reuse existing icon assets so the section matches the rest of the brand system.

**Tech Stack:** Static HTML, CSS, existing SVG assets, Playwright for visual verification

---

### Task 1: Update section markup

**Files:**
- Modify: `index.html`

**Step 1: Replace the current options card markup**

- Add a dedicated section intro eyebrow and accent divider.
- Replace plain text cards with icon + content card rows.
- Keep the existing four offer items and section id.

**Step 2: Reuse existing project icons**

- Assign one icon per option from the existing green SVG set.

### Task 2: Rebuild section styling

**Files:**
- Modify: `assets/css/main.css`

**Step 1: Create the new section scene**

- Add decorative background layers, light depth, and subtle patterning.

**Step 2: Redesign the cards**

- Build a 2x2 grid with white cards, icon tiles, better spacing, and clearer hierarchy.

**Step 3: Add responsive behavior**

- Collapse cleanly to one column on mobile without overflow or excessive line wrapping.

### Task 3: Verify visually

**Files:**
- Modify: `output/playwright/*` only if new screenshots are generated during verification

**Step 1: Run Playwright visual check**

- Capture at least one desktop and one mobile screenshot.

**Step 2: Refine if necessary**

- Fix spacing, line wrapping, or icon alignment issues before finalizing.
