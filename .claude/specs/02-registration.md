# Spec: Registration

## Overview
The Registration feature allows new users to create an account by providing their name, email, and password. This is the entry point for user personalization and is critical for the security and identity of the Spendly app. It transitions the app from a static landing page to a dynamic, user-centric application.

## Depends on
Step 01: Database setup.

## Routes
- `GET /register` — Display registration form — public
- `POST /register` — Process registration form and create user — public

## Database changes
No database changes.

## Templates
- **Modify:** `templates/register.html` — Implement the registration form with validation and submission.
- **Modify:** `templates/base.html` — Ensure navigation links to register/login are present.

## Files to change
- `app.py` — Implement the POST handler for `/register`.
- `templates/register.html` — Implement the form UI.
- `templates/base.html` — Update navigation.

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
- Validate that email is not already registered before creating user.
- Ensure form input is sanitized and validated.

## Definition of done
- [ ] User can navigate to `/register` and see a registration form.
- [ ] User can successfully register with a valid name, email, and password.
- [ ] Duplicate email registration is prevented and shows a user-friendly error message.
- [ ] Password is stored as a hash in the database, not plain text.
- [ ] Successful registration redirects user to login page or dashboard with a success message.
- [ ] Form validation prevents empty fields.
