
export const analyzeSpending = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      insights: ["No transactions available."],
      categorySummary: {},
      topCategories: []
    };
  }

  const categorySummary = transactions.reduce((summary, t) => {
    const category = t.category || 'Miscellaneous';
    summary[category] = (summary[category] || 0) + Math.abs(t.amount);
    return summary;
  }, {});

  const topCategories = Object.entries(categorySummary)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({ category, amount }));

  const insights = topCategories.length
    ? [`Your highest spending category is ${topCategories[0].category} ($${topCategories[0].amount.toFixed(2)})`]
    : ["No significant spending data available."];

  return { insights, categorySummary, topCategories };
};

export const predictBudget = (transactions, income) => {
  const analysis = analyzeSpending(transactions);
  const categorySpending = analysis.categorySummary;
  const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);

  if (!totalSpending || !income) {
    return {
      recommendations: {},
      message: "Cannot recommend a budget without spending history or income."
    };
  }

  const savingsRate = 0.1;
  const budgetAvailable = income * (1 - savingsRate);
  const recommendations = {};

  for (const [category, amount] of Object.entries(categorySpending)) {
    recommendations[category] = (amount / totalSpending) * budgetAvailable;
  }

  recommendations['Savings'] = income * savingsRate;

  return {
    recommendations,
    message: "Budget recommendations are based on your spending and income."
  };
};
