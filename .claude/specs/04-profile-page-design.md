---
# Spec: Profile Page Design

## Overview
The Profile Page provides a dedicated space for authenticated users to view their account information. This feature is a foundational part of the user experience, establishing a personal area within the Spendly application and paving the way for future account management and settings features.

## Depends on
- 02-registration
- 03-login

## Routes
- `GET /profile` — Displays the authenticated user's name and email — logged-in

## Database changes
No database changes. The existing `users` table provides the necessary fields (`name`, `email`, `created_at`).

## Templates
- **Create:** `templates/profile.html`
- **Modify:** `templates/base.html` (Add a link to the Profile page in the navigation for logged-in users)

## Files to change
- `app.py`: Implement the logic for the `/profile` route to fetch and display user data.

## Files to create
- `templates/profile.html`: The view for the user profile page.

## New dependencies
No new dependencies.

## Rules for implementation
- No SQLAlchemy or ORMs
- Parameterised queries only
- Passwords hashed with werkzeug
- Use CSS variables — never hardcode hex values
- All templates extend `base.html`

## Definition of done
- [ ] Navigating to `/profile` while logged in displays the correct user's name and email.
- [ ] Navigating to `/profile` while logged out redirects the user to the login page with a flash message.
- [ ] The Profile page extends `base.html` and adheres to the minimalist "Fintech" aesthetic (White, Slate, Emerald).
- [ ] A link to the Profile page is visible in the navigation bar when the user is authenticated.
---
