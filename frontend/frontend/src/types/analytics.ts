export interface AnalyticsSummary {
  total_expenses: number;
  total_income: number;
  net_savings: number;
  savings_rate: number;
}

export interface SpendingTrend {
  period: string;
  expense: number;
  income: number;
}

export interface CategoryDistribution {
  category: string;
  total: number;
}

export interface CategoryTrend {
  month: string;
  category: string;
  total: number;
}

export interface DayOfWeekSpend {
  dow: number; // 0-6
  total: number;
}

export interface AssetMetrics {
  growth: {
    date: string;
    total: number;
  }[];
  allocation: {
    type: string;
    total: number;
  }[];
}

export interface TopExpense {
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  trends: SpendingTrend[];
  distribution: CategoryDistribution[];
  category_trends: CategoryTrend[];
  dow_spend: DayOfWeekSpend[];
  assets: AssetMetrics;
  top_expenses: TopExpense[];
}
