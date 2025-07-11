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
    """Predict and recommend budget allocations based on spending patterns."""
    try:
        data = request.get_json()

        transactions = data.get('transactions', [])
        income = float(data.get('income', 0))

        # --- Debugging: Print incoming data to Flask server console ---
        print("\n--- Received data in Flask predict_budget ---")
        print(f"Transactions (first 2): {transactions[:2] if transactions else 'No transactions'}")
        print(f"Income: {income}")
        print("-------------------------------------------\n")

        if not transactions or not isinstance(transactions, list):
            return jsonify({'error': 'No transaction data provided or invalid format (must be a list)'}), 400

        # Ensure that `amount`, `type`, `date`, and `category` are present for all transactions
        # This is a robust check, as a single malformed transaction can break the DataFrame creation
        for i, t in enumerate(transactions):
            if not all(k in t for k in ['amount', 'type', 'date', 'category']):
                return jsonify({'error': f'Transaction at index {i} is missing required fields (amount, type, date, category)'}), 400
            # Ensure amount is convertible to float
            try:
                float(t['amount'])
            except (ValueError, TypeError):
                return jsonify({'error': f'Transaction at index {i} has an invalid amount: {t["amount"]}'}), 400


        df = pd.DataFrame(transactions)

        # Explicitly convert 'amount' column to numeric, coercing errors to NaN
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        # Drop rows where amount conversion failed
        df.dropna(subset=['amount'], inplace=True)


        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df['amount_abs'] = df['amount'].apply(lambda x: abs(float(x)))

        # Filter only expenses
        expenses = df[df['type'].str.lower() == 'expense']

        # Check if there are enough expenses to make predictions
        if expenses.empty:
            return jsonify({'error': 'No expense transactions found for budget prediction. Please add some expense transactions.'}), 400

        if 'category' not in expenses.columns:
             return jsonify({'error': 'Expense transactions are missing the "category" field.'}), 400


        # Group spending by category
        category_spending = expenses.groupby('category')['amount_abs'].sum().to_dict()
        total_spending = sum(category_spending.values())

        if total_spending == 0:
            # If there's income, we can still recommend savings, but category breakdown is impossible
            if income > 0:
                budget_recommendations = {'Savings': round(income * 0.1, 2)} # Default 10% savings
                return jsonify({
                    'current_spending': {},
                    'spending_percentages': {},
                    'budget_recommendations': budget_recommendations,
                    'total_budget': income,
                    'message': "No historical spending to categorize, recommending savings based on income."
                })
            else:
                return jsonify({'error': 'Total spending is zero, cannot calculate percentages or provide recommendations without income.'}), 400


        # Calculate category-wise spending percentage
        category_percentages = {
            cat: (amt / total_spending) * 100 for cat, amt in category_spending.items()
        }

        # Budgeting logic
        budget_base = income if income > 0 else total_spending
        savings_rate = 0.1 # Default savings rate
        budget_available = budget_base * (1 - savings_rate)

        budget_recommendations = {
            cat: round((pct / 100) * budget_available, 2)
            for cat, pct in category_percentages.items()
        }

        if income > 0:
            budget_recommendations['Savings'] = round(income * savings_rate, 2)
        else: # If no income, ensure a message about how savings are handled
            if 'Savings' in budget_recommendations:
                 del budget_recommendations['Savings'] # If total_spending was base, no explicit savings category from that.


        return jsonify({
            'current_spending': category_spending,
            'spending_percentages': category_percentages,
            'budget_recommendations': budget_recommendations,
            'total_budget': budget_base,
            'message': f"Budget recommendations based on your {'income' if income > 0 else 'historical spending'}"
        })

    except ValueError as ve:
        # Catch specific errors like float conversion issues or missing data in parsing
        return jsonify({'error': 'Invalid data format detected.', 'details': str(ve)}), 400
    except Exception as e:
        # Catch any other unexpected errors and log them server-side
        print(f"--- Flask Server Caught Exception ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {str(e)}")
        import traceback
        traceback.print_exc() # Print full traceback for debugging
        print(f"-------------------------------------\n")
        return jsonify({'error': 'Internal server error during budget prediction', 'details': str(e)}),500
if __name__ == '__main__':
    app.run(debug=True, port=5001)
