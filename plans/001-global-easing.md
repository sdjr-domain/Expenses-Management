# Plan 001: Global Easing Upgrade
**Commit**: fbaa7f1
**Status**: PENDING

## Problem
The application currently uses generic CSS easings (`ease-out`, `ease-in-out`). These are linear and "default," failing to convey the precision and luxury associated with premium fintech interfaces.

## Technical Specification

### 1. Define Easing Tokens
Add the following variables to `:root` in `static/css/style.css`:

```css
/* Easing Tokens */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1); /* For general UI transitions */
--ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);    /* For elements that "pop" in */
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);  /* For luxury, slower transitions */
```

### 2. Implementation Steps

**Step 1: Update Navbar Hover**
In `static/css/style.css`, update `.nav-links a` transition:
- **Current**: `transition: color 0.2s;`
- **Target**: `transition: color 0.2s var(--ease-standard);`

**Step 2: Update Button Transitions**
In `static/css/style.css`, update `.btn-primary` and `.btn-ghost` transitions:
- **Current**: `transition: background 0.2s;` / `transition: all 0.2s;`
- **Target**: `transition: background 0.2s var(--ease-standard), border-color 0.2s var(--ease-standard), color 0.2s var(--ease-standard);`

**Step 3: Update Logo Motion**
In `static/css/style.css`, update `.logo-container` transition:
- **Current**: `transition: transform 0.2s ease-out;`
- **Target**: `transition: transform 0.2s var(--ease-standard);`

## Scope Boundaries
- Do NOT change the durations (keep `0.2s` for now).
- Do NOT apply `var(--ease-pop)` to navigation elements; reserve it for modals or success states.

## Verification
- **Feel-Check**: Open the browser's Inspector $\rightarrow$ Animations tab. Slow the animation to 10%.
- **Expected**: The movement should feel "snappy" at the start and "settle" smoothly at the end, without the robotic feel of a standard `ease-out`.
