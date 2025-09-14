import os, requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import datetime
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
 # Enable CORS for all routes

# NOTE: For production, use environment variables to store your API key
# API_KEY = "AIzaSyBBi5_ur6kUA-fmE9OIvnkyHXxDpNlSt6Y" 
# GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

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
        category_summary = df[df['type'].str.lower() == 'expense'].groupby('category')['amount_abs'].sum().to_dict()
        results['category_summary'] = category_summary
        top_categories = sorted(category_summary.items(), key=lambda x: x[1], reverse=True)
        results['top_categories'] = [{"category": cat, "amount": amt} for cat, amt in top_categories[:3]]

    # Monthly trends
    df['month'] = df['date'].dt.month
    df['month_name'] = df['date'].dt.strftime('%B')
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
        expenses = df[df['type'].str.lower() == 'expense']
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
    if 'category_summary' in results and results['category_summary']:
        top_cat_item = max(results['category_summary'], key=results['category_summary'].get)
        top_amt = results['category_summary'][top_cat_item]
        insights.append(f"Your highest spending category is {top_cat_item} (${top_amt:.2f})")
    
    anomalies = results.get('anomalies', [])
    if anomalies:
        insights.append(f"You have {len(anomalies)} unusually large expenses. The largest was ${anomalies[0]['amount']:.2f} for {anomalies[0]['description']}.")

    results['insights'] = insights
    return jsonify(results)


@app.route('/api/predict-budget', methods=['POST'])
def predict_budget():
    """Predict and recommend budget allocations based on spending patterns."""
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        income = float(data.get('income', 0))

        if not transactions or not isinstance(transactions, list):
            return jsonify({'error': 'No transaction data provided or invalid format'}), 400
        
        df = pd.DataFrame(transactions)
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        df.dropna(subset=['amount'], inplace=True)
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df['amount_abs'] = df['amount'].apply(lambda x: abs(float(x)))
        expenses = df[df['type'].str.lower() == 'expense']

        if expenses.empty:
            return jsonify({'error': 'No expense transactions found for budget prediction.'}), 400
        
        category_spending = expenses.groupby('category')['amount_abs'].sum().to_dict()
        total_spending = sum(category_spending.values())

        if total_spending == 0:
            return jsonify({'error': 'Total spending is zero, cannot calculate percentages.'}), 400
        
        category_percentages = {
            cat: (amt / total_spending) * 100 for cat, amt in category_spending.items()
        }

        budget_base = income if income > 0 else total_spending
        savings_rate = 0.1
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
            'message': "Budget recommendations based on your historical spending."
        })

    except Exception as e:
        print(f"Error in budget prediction: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500


def analyze_spending_internal(transactions):
    """Internal function to analyze spending without a new HTTP request."""
    if not transactions:
        return {'insights': [], 'category_summary': {}, 'top_categories': [], 'monthly_trend': []}
    
    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df['amount_abs'] = df['amount'].apply(lambda x: abs(x))

    results = {}
    if 'category' in df.columns:
        category_summary = df[df['type'].str.lower() == 'expense'].groupby('category')['amount_abs'].sum().to_dict()
        results['category_summary'] = category_summary
        top_categories = sorted(category_summary.items(), key=lambda x: x[1], reverse=True)
        results['top_categories'] = [{"category": cat, "amount": amt} for cat, amt in top_categories[:3]]
    
    insights = []
    if 'category_summary' in results and results['category_summary']:
        top_cat_item = max(results['category_summary'], key=results['category_summary'].get)
        top_amt = results['category_summary'][top_cat_item]
        insights.append(f"Your highest spending category is {top_cat_item} (${top_amt:.2f})")
    
    results['insights'] = insights
    return results

def predict_budget_internal(transactions, income):
    """Internal function to predict budget without a new HTTP request."""
    if not transactions:
        return {'budget_recommendations': {}, 'total_budget': income, 'message': "No historical spending."}
        
    df = pd.DataFrame(transactions)
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
    df.dropna(subset=['amount'], inplace=True)
    df['amount_abs'] = df['amount'].apply(lambda x: abs(float(x)))
    expenses = df[df['type'].str.lower() == 'expense']

    if expenses.empty:
        return {'budget_recommendations': {}, 'total_budget': income, 'message': "No expense transactions found."}
    
    category_spending = expenses.groupby('category')['amount_abs'].sum().to_dict()
    total_spending = sum(category_spending.values())
    if total_spending == 0:
        return {'budget_recommendations': {}, 'total_budget': income, 'message': "Total spending is zero."}
    
    category_percentages = {cat: (amt / total_spending) * 100 for cat, amt in category_spending.items()}
    
    budget_base = income if income > 0 else total_spending
    savings_rate = 0.1
    budget_available = budget_base * (1 - savings_rate)
    
    budget_recommendations = {
        cat: round((pct / 100) * budget_available, 2)
        for cat, pct in category_percentages.items()
    }
    
    if income > 0:
        budget_recommendations['Savings'] = round(income * savings_rate, 2)
    
    return {'budget_recommendations': budget_recommendations, 'total_budget': budget_base}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)