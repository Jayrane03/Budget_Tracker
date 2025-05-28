# python-ai/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.spatial.distance import cdist
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Predefined categories for transaction classification
CATEGORIES = {
    'food': ['grocery', 'restaurant', 'cafe', 'food', 'dinner', 'lunch', 'breakfast', 'meal', 'takeout', 'pizza', 'burger'],
    'transportation': ['uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'subway', 'gas', 'fuel', 'parking', 'car'],
    'shopping': ['amazon', 'walmart', 'target', 'store', 'shop', 'purchase', 'buy', 'mall', 'clothing', 'shoes', 'electronics'],
    'entertainment': ['movie', 'cinema', 'theater', 'concert', 'show', 'netflix', 'spotify', 'subscription', 'streaming', 'game'],
    'utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'bill', 'utility', 'wifi', 'power', 'service'],
    'housing': ['rent', 'mortgage', 'lease', 'apartment', 'house', 'property', 'maintenance', 'repair', 'home'],
    'health': ['doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'health', 'dental', 'insurance', 'prescription'],
    'education': ['tuition', 'school', 'university', 'college', 'course', 'class', 'book', 'textbook', 'education', 'learn'],
    'personal': ['haircut', 'salon', 'spa', 'gym', 'fitness', 'personal', 'self', 'care'],
    'travel': ['hotel', 'flight', 'airfare', 'ticket', 'vacation', 'trip', 'travel', 'booking', 'airbnb'],
    'miscellaneous': []  # Default category
}

@app.route('/api/categorize', methods=['POST'])
def categorize_transaction():
    """Auto-categorize a transaction based on its description"""
    data = request.json
    description = data.get('description', '').lower()

    for category, keywords in CATEGORIES.items():
        if any(keyword in description for keyword in keywords):
            return jsonify({'category': category.capitalize()})

    return jsonify({'category': 'Miscellaneous'})


@app.route('/api/analyze', methods=['POST'])
def analyze_spending():
    """Analyze spending patterns from transaction data"""
    data = request.json
    transactions = data.get('transactions', [])

    if not transactions:
        return jsonify({'error': 'No transaction data provided'})

    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df['amount_abs'] = df['amount'].apply(lambda x: abs(x))

    results = {}

    # Spending by category
    if 'category' in df.columns:
        category_summary = df[df['type'] == 'expense'].groupby('category')['amount_abs'].sum().to_dict()
        results['category_summary'] = category_summary

        top_categories = sorted(category_summary.items(), key=lambda x: x[1], reverse=True)
        results['top_categories'] = [{"category": cat, "amount": amt} for cat, amt in top_categories[:3]]

    # Monthly trends
    df['month'] = df['date'].dt.month
    df['month_name'] = df['date'].dt.strftime('%b')
    df['year'] = df['date'].dt.year

    monthly_data = df.groupby(['year', 'month', 'month_name', 'type'])['amount_abs'].sum().reset_index()

    monthly_spending = [{
        'year': int(row['year']),
        'month': int(row['month']),
        'month_name': row['month_name'],
        'type': row['type'],
        'amount': float(row['amount_abs'])
    } for _, row in monthly_data.iterrows()]
    results['monthly_trend'] = monthly_spending

    # Anomaly detection
    if len(df) >= 5:
        expenses = df[df['type'] == 'expense']
        if not expenses.empty:
            mean_expense = expenses['amount_abs'].mean()
            std_expense = expenses['amount_abs'].std()
            threshold = mean_expense + (2 * std_expense)
            anomalies = expenses[expenses['amount_abs'] > threshold]

            anomalies_list = [{
                'description': row.get('description', ''),
                'amount': float(row.get('amount_abs', 0)),
                'date': row.get('date').strftime('%Y-%m-%d'),
                'category': row.get('category', 'Uncategorized')
            } for _, row in anomalies.iterrows()]
            results['anomalies'] = anomalies_list

    # Generate insights
    insights = []

    # Top category insight
    if 'category_summary' in results and results['category_summary']:
        top_cat = max(results['category_summary'], key=results['category_summary'].get)
        top_amt = results['category_summary'][top_cat]
        insights.append(f"Your highest spending category is {top_cat} (${top_amt:.2f})")

    # Monthly trend insight
    if len(results.get('monthly_trend', [])) >= 2:
        expense_by_month = {
            (item['year'], item['month']): item['amount']
            for item in results['monthly_trend'] if item['type'] == 'expense'
        }

        if len(expense_by_month) >= 2:
            last_month, second_last_month = sorted(expense_by_month.keys())[-2:]
            last_amt = expense_by_month[last_month]
            second_last_amt = expense_by_month[second_last_month]
            month_name = next(
                (item['month_name'] for item in results['monthly_trend']
                 if item['year'] == last_month[0] and item['month'] == last_month[1]),
                'Last month'
            )
            if last_amt > second_last_amt:
                increase_pct = ((last_amt - second_last_amt) / second_last_amt) * 100
                insights.append(f"Your spending increased by {increase_pct:.1f}% in {month_name}")
            else:
                decrease_pct = ((second_last_amt - last_amt) / second_last_amt) * 100
                insights.append(f"Good job! Your spending decreased by {decrease_pct:.1f}% in {month_name}")

    # Anomalies insight
    anomalies = results.get('anomalies', [])
    if anomalies:
        insights.append(f"You have {len(anomalies)} unusually large {'expense' if len(anomalies) == 1 else 'expenses'}")
        largest = max(anomalies, key=lambda x: x['amount'])
        insights.append(f"Your largest unusual expense was ${largest['amount']:.2f} for {largest['description']}")

    # Frequency insight
    if not df.empty:
        total_days = (df['date'].max() - df['date'].min()).days + 1
        expense_count = len(df[df['type'] == 'expense'])
        if total_days > 0 and expense_count > 0:
            insights.append(f"You make approximately {expense_count / total_days:.1f} expenses per day")

    results['insights'] = insights
    return jsonify(results)


@app.route('/api/predict-budget', methods=['POST'])
def predict_budget():
    """Predict and recommend budget allocations based on spending patterns"""
    data = request.json
    transactions = data.get('transactions', [])
    income = data.get('income', 0)

    if not transactions:
        return jsonify({'error': 'No transaction data provided'})

    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df['amount_abs'] = df['amount'].apply(lambda x: abs(x))
    expenses = df[df['type'] == 'expense']

    if 'category' in expenses.columns and not expenses.empty:
        category_spending = expenses.groupby('category')['amount_abs'].sum().to_dict()
        total_spending = sum(category_spending.values())
        category_percentages = {cat: (amt / total_spending) * 100 for cat, amt in category_spending.items()}

        budget_base = income if income > 0 else total_spending
        savings_rate = 0.1 if income > 0 else 0
        budget_available = budget_base * (1 - savings_rate)

        budget_recommendations = {
            cat: round((pct / 100) * budget_available, 2)
            for cat, pct in category_percentages.items()
        }

        if income > 0:
            budget_recommendations['Savings'] = round(income * savings_rate, 2)

        return jsonify({
            'current_spending': category_spending,
            'spending_percentages': category_percentages,
            'budget_recommendations': budget_recommendations,
            'total_budget': budget_base,
            'message': f"Budget recommendations based on your {'income' if income > 0 else 'historical spending'}"
        })

    return jsonify({'error': 'Not enough category data for budget prediction'})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
