import pandas as pd
import sqlite3
import os
from database.db import init_db

DATABASE = "spendly.db"
EXCEL_FILE = "Expenses sheet.xlsx"

def import_financials():
    # Ensure database is initialized with latest schema
    init_db()

    if not os.path.exists(EXCEL_FILE):
        print(f"Error: {EXCEL_FILE} not found.")
        return

    # Read the Excel file
    xls = pd.ExcelFile(EXCEL_FILE)

    # We are interested in the 'I&E Annual' sheet
    if 'I&E Annual' not in xls.sheet_names:
        print("Error: 'I&E Annual' sheet not found in Excel file.")
        return

    df = pd.read_excel(xls, sheet_name='I&E Annual')

    # Connect to DB
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    # Get the first user as the target for import
    user = conn.execute("SELECT id FROM users LIMIT 1").fetchone()
    if not user:
        print("Error: No users found in database. Please register a user first.")
        return
    user_id = user["id"]
    print(f"Importing data for User ID: {user_id}")

    # We will use a fixed date for these annual aggregates
    fixed_date = "2026-12-31"

    for index, row in df.iterrows():
        category = row['Type of income / expense']
        income_val = row['Sum of Income (cr)']
        expense_val = row['Sum of Expense (dr)']

        # Handle Income
        if pd.notnull(income_val) and income_val != '-' and float(str(income_val).replace(',', '')) > 0:
            try:
                amt = float(str(income_val).replace(',', ''))
                conn.execute(
                    "INSERT INTO income (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
                    (user_id, amt, category, fixed_date, "Imported from Annual Sheet")
                )
                print(f"Imported Income: {category} - {amt}")
            except ValueError:
                print(f"Skipping invalid income value for {category}: {income_val}")

        # Handle Expenses
        if pd.notnull(expense_val) and expense_val != '-' and float(str(expense_val).replace(',', '')) > 0:
            try:
                amt = float(str(expense_val).replace(',', ''))
                conn.execute(
                    "INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)",
                    (user_id, amt, category, fixed_date, "Imported from Annual Sheet")
                )
                print(f"Imported Expense: {category} - {amt}")
            except ValueError:
                print(f"Skipping invalid expense value for {category}: {expense_val}")

    conn.commit()
    conn.close()
    print("Import completed successfully.")

if __name__ == "__main__":
    import_financials()
