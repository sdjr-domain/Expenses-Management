# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands
- Run application: `python app.py` (runs on port 5001)
- Install dependencies: `pip install -r requirements.txt`
- Activate virtual environment: `source venv/bin/activate`
- Run tests: `pytest`

## Architecture
The project is a Flask-based web application following a basic MVC-like structure:
- **Controller**: `app.py` handles routing and request processing. Many routes are currently placeholders for student implementation.
- **Model**: `database/` directory contains SQLite interaction logic (e.g., `db.py`).
- **View**: `templates/` contains Jinja2 HTML templates, with `base.html` providing the shared layout.
- **Assets**: `static/` contains CSS and JavaScript files.

## UI Guidelines
- **Framework**: Uses Tailwind CSS via CDN in `base.html`.
- **Styling**: Employs a minimalist "Fintech" aesthetic with Inter (Sans) and Playfair Display (Serif) fonts.
- **Color Palette**: Primarily White, Slate (grayscale), and Emerald (accents).
