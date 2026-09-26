import random

from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import init_db, seed_db, get_db, get_user_by_email, get_user_by_id, get_spending_summary, get_category_totals, get_all_transactions, get_filtered_expenses_count, get_total_transaction_count, add_expense, add_income, delete_expense, update_expense, get_expense_by_id, add_category, get_user_categories, ensure_default_categories, update_category, delete_category, get_category_name, count_expenses_in_category, get_assets, get_asset_by_id, add_asset, update_asset, delete_asset, get_total_assets, get_financial_summary, get_analytics_summary, get_spending_trends, get_category_distribution, get_category_trends, get_spend_by_day_of_week, get_asset_metrics, get_previous_month_salary, set_category_limit, get_user_limits, get_income_by_id, update_income, delete_income, get_budget_adherence, get_spending_velocity, get_baseline_split
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

PRO_TIPS = [
    "The 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings. Master your money, master your life. 🚀",
    "Pay yourself first. Automate your savings before you spend a single rupee. 💰",
    "Small leaks sink big ships. Track those tiny daily expenses to save thousands monthly. ⚓",
    "Avoid 'lifestyle creep'. As your income grows, keep your expenses steady. 📈",
    "Invest in yourself. The best return on investment is your own knowledge. 📚",
    "Don't save what is left after spending; spend what is left after saving. 🎯",
    "A budget isn't a restriction; it's a blueprint for your freedom. 🗽"
]

@app.template_filter('indian_format')
def indian_format(value):
    """Formats a number with Indian comma system (e.g., 1,23,456.78)."""
    try:
        val = float(value)
        # Separate integer and decimal parts
        s = str(int(val))
        decimal = abs(val) - int(abs(val))

        if not s:
            s = "0"

        # Handle negative numbers
        prefix = "-" if val < 0 else ""

        # Last 3 digits
        last_three = s[-3:]
        remaining = s[:-3]

        # Every 2 digits for the rest
        if remaining:
            # Reverse remaining, chunk by 2, join with comma, reverse back
            remaining = remaining[::-1]
            chunks = [remaining[i:i+2] for i in range(0, len(remaining), 2)]
            remaining = ",".join(chunks)[::-1]
            result = f"{prefix}{remaining},{last_three}"
        else:
            result = f"{prefix}{last_three}"

        return f"{result}{f'{decimal:.2f}'[1:] if decimal != 0 else '.00'}"
    except (ValueError, TypeError):
        return value

@app.context_processor
def inject_financial_summary():
    if "user_id" in session:
        user_id = session["user_id"]
        # Use the pro tip from the session, or pick one if not set (e.g., for existing sessions)
        pro_tip = session.get("pro_tip")
        if not pro_tip:
            pro_tip = random.choice(PRO_TIPS)
            session["pro_tip"] = pro_tip
        return dict(
            financial_summary=get_financial_summary(user_id),
            pro_tip=pro_tip
        )
    return dict(financial_summary=None, pro_tip=None)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            if request.path.startswith("/api/") or (request.content_type and "application/json" in request.content_type):
                return jsonify({"error": "Please sign in to access this resource."}), 401
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
            session["pro_tip"] = random.choice(PRO_TIPS)
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
    sort = request.args.get("sort")

    # Pagination parameters
    try:
        limit = int(request.args.get("limit", 10))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        limit = 10
        offset = 0

    summary = get_spending_summary(user_id)

    # Merge all user categories with their total spend to ensure zero-spend categories are visible
    user_categories_list = get_user_categories(user_id)
    spend_totals = {row["category"]: row["total"] for row in get_category_totals(user_id)}

    categories = []
    for cat in user_categories_list:
        name = cat["name"]
        categories.append({
            "category": name,
            "total": spend_totals.get(name, 0)
        })

    # Sort by total descending, then by name ascending
    categories.sort(key=lambda x: (-x["total"], x["category"]))

    # Get total count for pagination
    total_expenses = get_filtered_expenses_count(user_id, category, start_date, end_date)
    expenses = get_all_transactions(user_id, category, start_date, end_date, sort, limit=limit, offset=offset)
    total_transactions = get_total_transaction_count(user_id)

    user_categories = get_user_categories(user_id)
    total_assets = get_total_assets(user_id)

    return render_template("dashboard.html",
                           summary=summary,
                           categories=categories,
                           expenses=expenses,
                           category_colors=CATEGORY_COLORS,
                           user_categories=user_categories,
                           total_assets=total_assets,
                           total_count=total_expenses,
                           limit=limit,
                           offset=offset,
                           total_transactions=total_transactions)


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


@app.route("/transactions/add", methods=["GET", "POST"])
@login_required
def add_transaction_route():
    user_id = session["user_id"]
    ensure_default_categories(user_id)
    if request.method == "POST":
        transaction_type = request.form.get("type")
        amount = request.form.get("amount")
        category = request.form.get("category")
        date = request.form.get("date")
        description = request.form.get("description")

        if not amount or not category or not date or not transaction_type:
            flash("Amount, category, date, and type are required.", "error")
            return redirect(url_for("add_transaction_route"))

        try:
            amount_val = float(amount)
            with get_db() as db:
                if transaction_type == "income":
                    add_income(db, user_id, amount_val, category, date, description)
                else:
                    add_expense(db, user_id, amount_val, category, date, description)
            flash(f"{'Income' if transaction_type == 'income' else 'Expense'} added successfully!", "success")
            return redirect(url_for("dashboard"))
        except ValueError:
            flash("Invalid amount. Please enter a numeric value.", "error")
            return redirect(url_for("add_transaction_route"))
        except Exception as e:
            app.logger.error(f"Error adding transaction: {e}", exc_info=True)
            flash(f"An error occurred while adding the transaction: {str(e)}", "error")
            return redirect(url_for("add_transaction_route"))

    user_categories = get_user_categories(user_id)
    return render_template("add_transaction.html", user_categories=user_categories)

@app.route("/expenses/add", methods=["GET", "POST"])
@login_required
def add_expense_route():
    return redirect(url_for("add_transaction_route"))


@app.route("/expenses/<int:id>/edit", methods=["GET", "POST"])
@login_required
def edit_expense(id):
    user_id = session["user_id"]
    user_categories = get_user_categories(user_id)
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
            transaction_type = request.form.get("type")

            if not amount or not category or not date or not transaction_type:
                flash("Amount, category, date, and type are required.", "error")
                return redirect(url_for("edit_expense", id=id))

            try:
                amount_val = float(amount)

                # Handle transaction type change:
                # If the type changed, we must delete from one table and add to the other.
                # We need to know the ORIGINAL type.
                # Since expenses table only contains expenses, if it was in 'expenses', it was an expense.
                # BUT the user might be editing an income record via this route?
                # No, this route is explicitly /expenses/<id>/edit.

                # To support changing type from Expense to Income, we need to handle the movement.
                # However, the `get_expense_by_id` specifically looks in the `expenses` table.

                # If the user changes type to 'income':
                if transaction_type == "income":
                    # 1. Delete from expenses
                    delete_expense(db, id, user_id)
                    # 2. Add to income
                    add_income(db, user_id, amount_val, category, date, description)
                    flash("Transaction converted to Income successfully!", "success")
                    return redirect(url_for("dashboard"))
                else:
                    # Just update existing expense
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

    return render_template("edit_expense.html", expense=expense, user_categories=user_categories)


@app.route("/categories")
@login_required
def categories():
    user_id = session["user_id"]
    user_categories = get_user_categories(user_id)
    return render_template("categories.html", categories=user_categories)

@app.route("/categories/add", methods=["POST"])
@login_required
def add_category_route():
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
        # Check if category exists and get its name
        cat_name = get_category_name(db, id, user_id)
        if not cat_name:
            flash("Category not found or unauthorized.", "error")
            return redirect(url_for("categories"))

        # Check if category has associated expenses
        expense_count = count_expenses_in_category(db, user_id, cat_name)
        if expense_count > 0:
            flash(f"Cannot delete category '{cat_name}' because it has {expense_count} associated expense(s). Please remove or move the expenses first.", "error")
            return redirect(url_for("categories"))

        if delete_category(db, id, user_id):
            flash("Category deleted successfully.", "success")
        else:
            flash("Category not found or unauthorized.", "error")
    return redirect(url_for("categories"))

@app.route("/expenses/<int:id>/delete", methods=["POST"])
@login_required
def delete_expense_route(id):
    with get_db() as db:
        if delete_expense(db, id, session["user_id"]):
            flash("Expense deleted successfully.", "success")
        else:
            flash("Expense not found or unauthorized.", "error")
    return redirect(url_for("dashboard"))

@app.route("/income/<int:id>/edit", methods=["GET", "POST"])
@login_required
def edit_income(id):
    user_id = session["user_id"]
    user_categories = get_user_categories(user_id)
    with get_db() as db:
        income = get_income_by_id(db, id)

        if not income or income["user_id"] != user_id:
            flash("Income record not found or unauthorized.", "error")
            return redirect(url_for("dashboard"))

        if request.method == "POST":
            amount = request.form.get("amount")
            category = request.form.get("category")
            date = request.form.get("date")
            description = request.form.get("description")
            transaction_type = request.form.get("type")

            if not amount or not category or not date or not transaction_type:
                flash("Amount, category, date, and type are required.", "error")
                return redirect(url_for("edit_income", id=id))

            try:
                amount_val = float(amount)

                if transaction_type == "expense":
                    # Convert Income to Expense
                    delete_income(db, id, user_id)
                    add_expense(db, user_id, amount_val, category, date, description)
                    flash("Transaction converted to Expense successfully!", "success")
                    return redirect(url_for("dashboard"))
                else:
                    # Update existing income
                    if update_income(db, id, user_id, amount_val, category, date, description):
                        flash("Income updated successfully!", "success")
                        return redirect(url_for("dashboard"))
                    else:
                        flash("Failed to update income.", "error")
                        return redirect(url_for("edit_income", id=id))

            except ValueError:
                flash("Invalid amount. Please enter a numeric value.", "error")
                return redirect(url_for("edit_income", id=id))
            except Exception:
                flash("An error occurred while updating the income.", "error")
                return redirect(url_for("edit_income", id=id))

    return render_template("edit_income.html", income=income, user_categories=user_categories)


@app.route("/income/<int:id>/delete", methods=["POST"])
@login_required
def delete_income_route(id):
    with get_db() as db:
        if delete_income(db, id, session["user_id"]):
            flash("Income deleted successfully.", "success")
        else:
            flash("Income record not found or unauthorized.", "error")
    return redirect(url_for("dashboard"))


@app.route("/assets")
@login_required
def assets():
    user_id = session["user_id"]
    asset_type = request.args.get("type")
    assets_list = get_assets(user_id, asset_type)

    # Get unique asset types for the filter pills
    with get_db() as db:
        types = db.execute("SELECT DISTINCT type FROM assets WHERE user_id = ?", (user_id,)).fetchall()
        asset_types = [row["type"] for row in types]

    return render_template("assets.html", assets=assets_list, current_type=asset_type, asset_types=asset_types)

@app.route("/assets/add", methods=["GET", "POST"])
@login_required
def add_asset_route():
    user_id = session["user_id"]
    if request.method == "POST":
        asset_type = request.form.get("type")
        amount = request.form.get("amount")
        date = request.form.get("date")
        description = request.form.get("description")
        maturity_date = request.form.get("maturity_date")
        interest_rate = request.form.get("interest_rate")
        maturity_amount = request.form.get("maturity_amount")

        if not asset_type or not amount or not date:
            flash("Type, amount, and date are required.", "error")
            return redirect(url_for("add_asset_route"))

        try:
            amount_val = float(amount)
            interest_rate_val = float(interest_rate) if interest_rate else None
            maturity_amount_val = float(maturity_amount) if maturity_amount else None

            with get_db() as db:
                add_asset(db, user_id, asset_type, amount_val, date, description, maturity_date, interest_rate_val, maturity_amount_val)
            flash("Asset added successfully!", "success")
            return redirect(url_for("assets"))
        except ValueError:
            flash("Invalid numeric value. Please check your amount, interest rate, or maturity amount.", "error")
            return redirect(url_for("add_asset_route"))
        except Exception as e:
            app.logger.error(f"Error adding asset: {e}", exc_info=True)
            flash(f"An error occurred while adding the asset: {str(e)}", "error")
            return redirect(url_for("add_asset_route"))

    return render_template("add_asset.html")

@app.route("/assets/<int:id>/edit", methods=["GET", "POST"])
@login_required
def edit_asset(id):
    user_id = session["user_id"]
    with get_db() as db:
        asset = get_asset_by_id(db, id)
        if not asset or asset["user_id"] != user_id:
            flash("Asset not found or unauthorized.", "error")
            return redirect(url_for("assets"))

        if request.method == "POST":
            asset_type = request.form.get("type")
            amount = request.form.get("amount")
            date = request.form.get("date")
            description = request.form.get("description")
            maturity_date = request.form.get("maturity_date")
            interest_rate = request.form.get("interest_rate")
            maturity_amount = request.form.get("maturity_amount")

            if not asset_type or not amount or not date:
                flash("Type, amount, and date are required.", "error")
                return redirect(url_for("edit_asset", id=id))

            try:
                amount_val = float(amount)
                interest_rate_val = float(interest_rate) if interest_rate else None
                maturity_amount_val = float(maturity_amount) if maturity_amount else None

                if update_asset(db, id, user_id, asset_type, amount_val, date, description, maturity_date, interest_rate_val, maturity_amount_val):
                    flash("Asset updated successfully!", "success")
                    return redirect(url_for("assets"))
                else:
                    flash("Failed to update asset.", "error")
                    return redirect(url_for("edit_asset", id=id))
            except ValueError:
                flash("Invalid numeric value. Please check your amount, interest rate, or maturity amount.", "error")
                return redirect(url_for("edit_asset", id=id))
            except Exception:
                flash("An error occurred while updating the asset.", "error")
                return redirect(url_for("edit_asset", id=id))

    return render_template("edit_asset.html", asset=asset)

@app.route("/assets/<int:id>/delete", methods=["POST"])
@login_required
def delete_asset_route(id):
    with get_db() as db:
        if delete_asset(db, id, session["user_id"]):
            flash("Asset deleted successfully.", "success")
        else:
            flash("Asset not found or unauthorized.", "error")
    return redirect(url_for("assets"))

@app.route("/analytics")
@login_required
def analytics():
    return render_template("analytics.html")

@app.route("/api/analytics")
@login_required
def analytics_api():
    user_id = session["user_id"]
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    category = request.args.get("category", "All")

    if not start_date or not end_date:
        return jsonify({"error": "start_date and end_date are required"}), 400

    try:
        summary = get_analytics_summary(user_id, start_date, end_date)
        trends = get_spending_trends(user_id, start_date, end_date, category=category)
        distribution = get_category_distribution(user_id, start_date, end_date)
        cat_trends = get_category_trends(user_id, start_date, end_date)
        dow_spend = get_spend_by_day_of_week(user_id, start_date, end_date)
        assets_data = get_asset_metrics(user_id)

        # New Fintech Metrics
        budget_burn = get_budget_adherence(user_id, start_date, end_date)
        velocity = get_spending_velocity(user_id)
        baseline_split = get_baseline_split(user_id, start_date, end_date)

        with get_db() as db:
            top_expenses = db.execute(
                "SELECT date, category, description, amount FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY amount DESC LIMIT 5",
                (user_id, start_date, end_date)
            ).fetchall()

        return jsonify({
            "summary": summary,
            "trends": trends,
            "distribution": [dict(row) for row in distribution],
            "category_trends": [dict(row) for row in cat_trends],
            "dow_spend": [dict(row) for row in dow_spend],
            "assets": assets_data,
            "top_expenses": [dict(row) for row in top_expenses],
            "budget_burn": budget_burn,
            "velocity": velocity,
            "baseline_split": baseline_split
        })
    except Exception as e:
        app.logger.error(f"Analytics API error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/limits")
@login_required
def limits():
    user_id = session["user_id"]

    # Fetch current limits and salary context
    user_limits = {row["category_name"]: row for row in get_user_limits(user_id)}
    prev_salary = get_previous_month_salary(user_id)

    # We use the standard categories to ensure every category is shown
    # categories are derived from get_user_categories to support custom ones
    user_categories = get_user_categories(user_id)

    limit_data = []
    for cat in user_categories:
        name = cat["name"]
        limit_row = user_limits.get(name)

        if limit_row:
            l_type = limit_row["limit_type"]
            l_val = limit_row["limit_value"]

            if l_type == "fixed":
                calculated_limit = l_val
                display_limit = f"₹{l_val:,.2f}"
            else: # percentage
                calculated_limit = (l_val / 100) * prev_salary
                display_limit = f"{l_val}%"

            limit_data.append({
                "category": name,
                "limit_type": l_type,
                "limit_value": l_val,
                "calculated_limit": calculated_limit,
                "display_limit": display_limit
            })
        else:
            limit_data.append({
                "category": name,
                "limit_type": None,
                "limit_value": None,
                "calculated_limit": None,
                "display_limit": "No limit set"
            })

    return render_template("limits.html", limits=limit_data, prev_salary=prev_salary)

@app.route("/limits/update", methods=["POST"])
@login_required
def update_limit():
    user_id = session["user_id"]
    category = request.form.get("category")
    limit_type = request.form.get("limit_type")
    limit_value = request.form.get("limit_value")

    if not category or not limit_type or not limit_value:
        flash("All fields are required to update a limit.", "error")
        return redirect(url_for("limits"))

    try:
        val = float(limit_value)
        set_category_limit(user_id, category, limit_type, val)
        flash(f"Limit for {category} updated successfully!", "success")
    except ValueError:
        flash("Invalid limit value. Please enter a number.", "error")

    return redirect(url_for("limits"))

if __name__ == "__main__":
    with app.app_context():
        init_db()
        seed_db()
    app.run(debug=True, port=5001)

@app.route("/expenses/<int:id>/delete", methods=["POST"])
@login_required
def delete_expense_route(id):
    with get_db() as db:
        if delete_expense(db, id, session["user_id"]):
            flash("Expense deleted successfully.", "success")
        else:
            flash("Expense not found or unauthorized.", "error")
    return redirect(url_for("dashboard"))

@app.route("/income/<int:id>/edit", methods=["GET", "POST"])
@login_required
def edit_income(id):
    user_id = session["user_id"]
    user_categories = get_user_categories(user_id)
    with get_db() as db:
        income = get_income_by_id(db, id)

        if not income or income["user_id"] != user_id:
            flash("Income not found or unauthorized.", "error")
            return redirect(url_for("dashboard"))

        if request.method == "POST":
            amount = request.form.get("amount")
            category = request.form.get("category")
            date = request.form.get("date")
            description = request.form.get("description")
            transaction_type = request.form.get("type")

            if not amount or not category or not date or not transaction_type:
                flash("Amount, category, date, and type are required.", "error")
                return redirect(url_for("edit_income", id=id))

            try:
                amount_val = float(amount)

                if transaction_type == "expense":
                    # Convert to expense: delete from income, add to expenses
                    delete_income(db, id, user_id)
                    add_expense(db, user_id, amount_val, category, date, description)
                    flash("Transaction converted to Expense successfully!", "success")
                    return redirect(url_for("dashboard"))
                else:
                    # Update existing income
                    if update_income(db, id, user_id, amount_val, category, date, description):
                        flash("Income updated successfully!", "success")
                        return redirect(url_for("dashboard"))
                    else:
                        flash("Failed to update income.", "error")
                        return redirect(url_for("edit_income", id=id))

            except ValueError:
                flash("Invalid amount. Please enter a numeric value.", "error")
                return redirect(url_for("edit_income", id=id))
            except Exception:
                flash("An error occurred while updating the income.", "error")
                return redirect(url_for("edit_income", id=id))

    return render_template("edit_income.html", income=income, user_categories=user_categories)


@app.route("/income/<int:id>/delete", methods=["POST"])
@login_required
def delete_income_route(id):
    with get_db() as db:
        if delete_income(db, id, session["user_id"]):
            flash("Income deleted successfully.", "success")
        else:
            flash("Income not found or unauthorized.", "error")
    return redirect(url_for("dashboard"))
