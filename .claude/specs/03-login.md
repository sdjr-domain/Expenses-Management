# Spec: Login and Logout

## Overview
The Login and Logout feature implements secure session management for Spendly. It allows registered users to authenticate using their email and password, granting them access to protected areas of the application. This feature is critical for ensuring that users can only access and manage their own personal expense data.

## Depends on
Step 01: Database setup
Step 02: Registration

## Routes
- `GET /login` — Display sign-in form — public
- `POST /login` — Authenticate user and establish session — public
- `GET /logout` — Terminate session and redirect to landing — logged-in

## Database changes
No database changes.

## Templates
- **Modify:** `templates/login.html` — Implement the sign-in form with validation and error handling.
- **Modify:** `templates/base.html` — Update navigation to show "Logout" and "Profile" when authenticated, and "Sign in" / "Get started" when guest.

## Files to change
- `app.py` — Implement login/logout logic and session management.
- `templates/login.html` — Implement the UI for the login form.
- `templates/base.html` — Implement dynamic navigation based on authentication state.

## Files to create
No new files.

## New dependencies
No new dependencies.

## Rules for implementation
- No SQLAlchemy or ORMs
- Parameterised queries only
- Passwords hashed with werkzeug
- Use CSS variables — never hardcode hex values
- All templates extend `base.html`
- Use Flask `session` for authentication state.
- Use `flask_login` is NOT required; use basic `session` management for this step.
- Implement secure password verification using `check_password_hash`.

## Definition of done
- [ ] User can navigate to `/login` and see a sign-in form.
- [ ] User can successfully log in with valid credentials and be redirected to a protected page (e.g., landing or a placeholder profile page).
- [ ] Invalid credentials (wrong password or non-existent email) result in a "Invalid email or password" flash error.
- [ ] Authenticated users see "Logout" in the navigation bar instead of "Sign in".
- [ ] Clicking "Logout" successfully clears the session and redirects the user to the landing page.
- [ ] Attempting to access a protected route without being logged in redirects to `/login`.
