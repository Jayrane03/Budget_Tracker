// Analyze Spending
export const analyzeSpending = (transactions = []) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      insights: ["No transactions available."],
      categorySummary: {},
      topCategories: []
    };
  }

  // Sum spending by category (expenses only)
  const categorySummary = transactions.reduce((summary, t) => {
    const category = t.category || "Miscellaneous";
    const amount = Number(t.amount) || 0;

    // Add only expenses (ignore income here)
    if (t.type === "expense") {
      summary[category] = (summary[category] || 0) + Math.abs(amount);
    }
    return summary;
  }, {});

  const topCategories = Object.entries(categorySummary)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2))
    }));

  const insights = topCategories.length
    ? [`Your highest spending category is ${topCategories[0].category} ($${topCategories[0].amount})`]
    : ["No significant spending data available."];

  return { insights, categorySummary, topCategories };
};

// Predict Budget
export const predictBudget = (transactions = [], income = 0) => {
  const analysis = analyzeSpending(transactions);
  const categorySpending = analysis.categorySummary;
  const totalSpending = Object.values(categorySpending).reduce(
    (sum, amount) => sum + amount,
    0
  );

  if (totalSpending <= 0 || income <= 0) {
    return {
      recommendations: {},
      message: "Cannot recommend a budget without valid spending history and income."
    };
  }

  // Reserve 10% savings
  const savingsRate = 0.1;
  const budgetAvailable = income * (1 - savingsRate);
  const recommendations = {};

  for (const [category, amount] of Object.entries(categorySpending)) {
    recommendations[category] = Number(
      ((amount / totalSpending) * budgetAvailable).toFixed(2)
    );
  }

  // Always include savings
  recommendations["Savings"] = Number((income * savingsRate).toFixed(2));

  return {
    recommendations,
    message: "Budget recommendations are based on your spending and income.",
    insights: analysis.insights,
    topCategories: analysis.topCategories
  };
};
