# Plan 002: Page Entrance Sequence
**Commit**: fbaa7f1
**Status**: PENDING
**Depends on**: 001-global-easing

## Problem
Page loads are currently instantaneous "snaps," which feels abrupt and utilitarian. A premium experience uses a choreographed entrance to signal the page is ready and guide the user's attention.

## Technical Specification

### 1. Define Entrance Animation
Add the following to `static/css/style.css`:

```css
@keyframes page-entrance {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-entrance {
    animation: page-entrance 0.6s var(--ease-standard) forwards;
}
```

### 2. Implementation Steps

**Step 1: Apply to Main Content**
In `templates/base.html`, find the main content wrapper (line 77):
- **Current**: `<main class="lg:col-span-9">`
- **Target**: `<main class="lg:col-span-9 animate-entrance">`

**Step 2: Stagger the Sidebar (Optional but Recommended)**
In `templates/base.html`, apply a delayed entrance to the sidebar block:
- **Target**: Add a wrapper inside `{% block sidebar %}` or a global class that adds `animation-delay: 0.1s`.

## Scope Boundaries
- Only apply to the top-level `<main>` container to avoid "jittery" internal elements.
- Do NOT use a duration longer than `0.6s` to avoid frustrating the user.

## Verification
- **Feel-Check**: Refresh the page.
- **Expected**: The main content should gently glide upward from 20px below its final position while fading in. The motion should feel cohesive with the updated global easing from Plan 001.
