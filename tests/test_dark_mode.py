import pytest
from app import app as flask_app

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

def test_dark_mode_config(client):
    """Verify that Tailwind is configured for class-based dark mode."""
    response = client.get('/')
    html = response.data.decode('utf-8')
    assert "darkMode: 'class'" in html

def test_dark_mode_init_script(client):
    """Verify that the initial theme loading script is present in base.html."""
    response = client.get('/')
    html = response.data.decode('utf-8')
    assert "localStorage.getItem('color-theme')" in html
    assert "window.matchMedia('(prefers-color-scheme: dark)')" in html
    assert "document.documentElement.classList.add('dark')" in html

def test_theme_toggle_button_exists(client):
    """Verify that the theme toggle button is present in the navigation."""
    response = client.get('/')
    html = response.data.decode('utf-8')
    assert 'id="theme-toggle"' in html
    assert 'id="theme-toggle-dark-icon"' in html
    assert 'id="theme-toggle-light-icon"' in html

def test_main_js_linked(client):
    """Verify that main.js (which handles the toggle logic) is linked."""
    response = client.get('/')
    html = response.data.decode('utf-8')
    assert 'src="/static/js/main.js"' in html

def test_dark_mode_classes_present(client):
    """Verify that some key elements have dark mode classes."""
    response = client.get('/')
    html = response.data.decode('utf-8')
    # Check for a few representative dark: classes
    assert 'dark:bg-slate-950' in html
    assert 'dark:text-slate-50' in html
    assert 'dark:text-white' in html
    assert 'dark:border-slate-800' in html
