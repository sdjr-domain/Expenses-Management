from flask import Flask, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import init_db, seed_db, get_db, get_user_by_email, get_user_by_id, get_spending_summary, get_category_totals, get_filtered_expenses, add_expense, delete_expense, update_expense, get_expense_by_id, add_category, get_user_categories, ensure_default_categories
from functools import wraps

# Category color mapping for the UI
CATEGORY_COLORS = {
    "Food": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Transport": "bg-blue-100 text-blue-700 border-blue-200",
    "Bills": "bg-rose-100 text-rose-700 border-rose-200",
    "Health": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "Entertainment": "bg-purple-100 text-purple-700 border-purple-200",
    "Shopping": "bg-amber-100 text-amber-700 border-amber-200",
    "Other": "bg-slate-100 text-slate-700 border-slate-200",
}

app = Flask(__name__)
app.secret_key = "spendly-secret-key-for-flashing"

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please sign in to access this page.", "error")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


# ------------------------------------------------------------------ #
# Routes                                                              #
# ------------------------------------------------------------------ #

@app.route("/")
def landing():
    if session.get("user_id"):
        return redirect(url_for("dashboard"))
    return render_template("landing.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if session.get("user_id"):
        return redirect(url_for("landing"))

    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")

        if not name or not email or not password or not confirm_password:
            return render_template("register.html", error="All fields are required.")

        if password != confirm_password:
            return render_template("register.html", error="Passwords do not match.")

        if get_user_by_email(email):
            return render_template("register.html", error="This email is already registered.")

        try:
            password_hash = generate_password_hash(password)
            with get_db() as db:
                db.execute(
                    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                    (name, email, password_hash)
                )
                db.commit()
            flash("Account created successfully! Please sign in.", "success")
            return redirect(url_for("login"))
        except Exception as e:
            return render_template("register.html", error="An unexpected error occurred. Please try again.")

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("user_id"):
        return redirect(url_for("landing"))

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        if not email or not password:
            return render_template("login.html", error="All fields are required.")

        user = get_user_by_email(email)
        if user and check_password_hash(user["password_hash"], password):
            session["user_id"] = user["id"]
            flash("Welcome back!", "success")
            return redirect(url_for("dashboard"))

        return render_template("login.html", error="Invalid email or password.")

    return render_template("login.html")


@app.route("/terms")
def terms():
    return render_template("terms.html")


@app.route("/privacy")
def privacy():
    return render_template("privacy.html")


@app.route("/dashboard")
@login_required
def dashboard():
    user_id = session["user_id"]
    ensure_default_categories(user_id)
    category = request.args.get("category")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    summary = get_spending_summary(user_id)
    categories = get_category_totals(user_id)
    expenses = get_filtered_expenses(user_id, category, start_date, end_date)
    user_categories = get_user_categories(user_id)

    return render_template("dashboard.html", summary=summary, categories=categories, expenses=expenses, category_colors=CATEGORY_COLORS, user_categories=user_categories)

@app.route("/logout")
def logout():
    session.clear()
    flash("You have been signed out.", "success")
    return redirect(url_for("landing"))


@app.route("/profile")
@login_required
def profile():
    user_id = session.get("user_id")
    user = get_user_by_id(user_id)
    categories = get_user_categories(user_id)
    return render_template("profile.html", user=user, categories=categories)


@app.route("/expenses/add", methods=["GET", "POST"])
@login_required
def add_expense():
    user_id = session["user_id"]
    ensure_default_categories(user_id)
    if request.method == "POST":
        amount = request.form.get("amount")
        category = request.form.get("category")
        date = request.form.get("date")
        description = request.form.get("description")

        if not amount or not category or not date:
            flash("Amount, category, and date are required.", "error")
            return redirect(url_for("add_expense"))

        try:
            amount_val = float(amount)
            with get_db() as db:
                add_expense(db, user_id, amount_val, category, date, description)
            flash("Expense added successfully!", "success")
            return redirect(url_for("dashboard"))
        except ValueError:
            flash("Invalid amount. Please enter a numeric value.", "error")
            return redirect(url_for("add_expense"))
        except Exception:
            flash("An error occurred while adding the expense.", "error")
            return redirect(url_for("add_expense"))

    user_categories = get_user_categories(user_id)
    return render_template("add_expense.html", user_categories=user_categories)


@app.route("/expenses/<int:id>/edit", methods=["GET", "POST"])
@login_required
def edit_expense(id):
    user_id = session["user_id"]
    with get_db() as db:
        expense = get_expense_by_id(db, id)

        if not expense or expense["user_id"] != user_id:
            flash("Expense not found or unauthorized.", "error")
            return redirect(url_for("dashboard"))

        if request.method == "POST":
            amount = request.form.get("amount")
            category = request.form.get("category")
            date = request.form.get("date")
            description = request.form.get("description")

            if not amount or not category or not date:
                flash("Amount, category, and date are required.", "error")
                return redirect(url_for("edit_expense", id=id))

            try:
                amount_val = float(amount)
                if update_expense(db, id, user_id, amount_val, category, date, description):
                    flash("Expense updated successfully!", "success")
                    return redirect(url_for("dashboard"))
                else:
                    flash("Failed to update expense.", "error")
                    return redirect(url_for("edit_expense", id=id))
            except ValueError:
                flash("Invalid amount. Please enter a numeric value.", "error")
                return redirect(url_for("edit_expense", id=id))
            except Exception:
                flash("An error occurred while updating the expense.", "error")
                return redirect(url_for("edit_expense", id=id))

    return render_template("edit_expense.html", expense=expense)


@app.route("/categories")
@login_required
def categories():
    user_id = session["user_id"]
    user_categories = get_user_categories(user_id)
    return render_template("categories.html", categories=user_categories)

@app.route("/categories/add", methods=["POST"])
@login_required
def add_category():
    category_name = request.form.get("name")
    if not category_name:
        flash("Category name is required.", "error")
        return redirect(url_for("categories"))

    user_id = session["user_id"]
    with get_db() as db:
        exists = db.execute("SELECT 1 FROM categories WHERE user_id = ? AND name = ?", (user_id, category_name)).fetchone()
        if exists:
            flash("Category already exists.", "error")
            return redirect(url_for("categories"))

        add_category(db, user_id, category_name)

    flash(f"Category '{category_name}' added successfully!", "success")
    return redirect(url_for("categories"))

@app.route("/categories/edit/<int:id>", methods=["GET", "POST"])
@login_required
def edit_category(id):
    user_id = session["user_id"]
    with get_db() as db:
        cat = db.execute("SELECT * FROM categories WHERE id = ? AND user_id = ?", (id, user_id)).fetchone()
        if not cat:
            flash("Category not found or unauthorized.", "error")
            return redirect(url_for("categories"))

        if request.method == "POST":
            new_name = request.form.get("name")
            if not new_name:
                flash("Category name is required.", "error")
                return redirect(url_for("edit_category", id=id))

            if update_category(db, id, user_id, new_name):
                flash("Category updated successfully!", "success")
                return redirect(url_for("categories"))
            else:
                flash("Failed to update category.", "error")
                return redirect(url_for("edit_category", id=id))

    return render_template("edit_category.html", category=cat)

@app.route("/categories/delete/<int:id>", methods=["POST"])
@login_required
def delete_category_route(id):
    user_id = session["user_id"]
    with get_db() as db:
        if delete_category(db, id, user_id):
            flash("Category deleted successfully.", "success")
        else:
            flash("Category not found or unauthorized.", "error")
    return redirect(url_for("categories"))

@app.route("/expenses/<int:id>/delete", methods=["POST"])
@login_required
def delete_expense(id):
    with get_db() as db:
        if delete_expense(db, id, session["user_id"]):
            flash("Expense deleted successfully.", "success")
        else:
            flash("Expense not found or unauthorized.", "error")
    return redirect(url_for("dashboard"))


if __name__ == "__main__":
    with app.app_context():
        init_db()
        seed_db()
    app.run(debug=True, port=5001)
