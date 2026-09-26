import sqlite3
from datetime import datetime
from database.db import get_db, get_analytics_summary, get_budget_adherence, get_spending_velocity, get_baseline_split

def test():
    user_id = 1
    start_date = "2026-09-01"
    end_date = "2026-09-27"
    
    print("Testing Analytics Data Layer...")
    try:
        print("\n--- Summary ---")
        print(get_analytics_summary(user_id, start_date, end_date))
        
        print("\n--- Budget Adherence ---")
        print(get_budget_adherence(user_id, start_date, end_date))
        
        print("\n--- Spending Velocity ---")
        print(get_spending_velocity(user_id))
        
        print("\n--- Baseline Split ---")
        print(get_baseline_split(user_id, start_date, end_date))
        
        print("\n✅ All database functions returned without crashing.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
