from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer 
# Google News RSS imports (built into Python - no pip install needed!)
import urllib.request
import xml.etree.ElementTree as ET
# Database imports
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)  # This allows your React website to talk to this Python script

# Initialize the AI News Reader
analyzer = SentimentIntensityAnalyzer()

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///advisor.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Create the User Table
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

# ==========================================
# NEW: WATCHLIST TABLE
# ==========================================
class Watchlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    
    # Relationship so we can easily get a user's watchlist
    user = db.relationship('User', backref=db.backref('watchlist', lazy=True))

# Create the database file when the app starts
with app.app_context():
    db.create_all()
    print("✅ Database initialized: advisor.db (User + Watchlist tables)")

# ============================================
# AUTHENTICATION ROUTES
# ============================================
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not name or not email or not password:
            return jsonify({"error": "Name, email, and password are required"}), 400
        
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered"}), 400

        # Secure the password and save the user
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(name=name, email=email, password=hashed_password)
        
        db.session.add(new_user)
        db.session.commit()
        
        print(f"✅ New user registered: {name} ({email})")
        return jsonify({
            "message": "User created successfully!", 
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            print(f"✅ User logged in: {user.name} ({user.email})")
            return jsonify({
                "message": "Login successful", 
                "user": {
                    "id": user.id, 
                    "name": user.name, 
                    "email": user.email
                }
            }), 200
        
        return jsonify({"error": "Invalid email or password"}), 401
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({"error": "Login failed"}), 500

@app.route('/users', methods=['GET'])
def get_users():
    """Get all registered users (for testing)"""
    users = User.query.all()
    user_list = [{"id": u.id, "name": u.name, "email": u.email} for u in users]
    return jsonify({"users": user_list, "total": len(user_list)})

# ============================================
# NEW: WATCHLIST ROUTES
# ============================================
@app.route('/watchlist/<int:user_id>', methods=['GET'])
def get_watchlist(user_id):
    """Get a user's watchlist"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        watchlist_items = Watchlist.query.filter_by(user_id=user_id).all()
        items = [{
            "id": item.id, 
            "symbol": item.symbol, 
            "name": item.name
        } for item in watchlist_items]
        
        return jsonify({
            "watchlist": items,
            "total": len(items)
        })
    except Exception as e:
        print(f"❌ Error fetching watchlist: {e}")
        return jsonify({"error": "Failed to fetch watchlist"}), 500

@app.route('/watchlist/add', methods=['POST'])
def add_to_watchlist():
    """Add a stock to a user's watchlist"""
    try:
        data = request.json
        user_id = data.get('user_id')
        symbol = data.get('symbol', '').upper().strip()
        name = data.get('name', symbol)
        
        if not user_id or not symbol:
            return jsonify({"error": "User ID and symbol are required"}), 400
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if already in watchlist
        existing = Watchlist.query.filter_by(user_id=user_id, symbol=symbol).first()
        if existing:
            return jsonify({"error": f"{symbol} is already in your watchlist"}), 400
        
        # Add to watchlist
        new_item = Watchlist(user_id=user_id, symbol=symbol, name=name)
        db.session.add(new_item)
        db.session.commit()
        
        print(f"✅ Added {symbol} to user {user_id}'s watchlist")
        return jsonify({
            "message": f"{symbol} added to watchlist",
            "item": {
                "id": new_item.id,
                "symbol": symbol,
                "name": name
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Error adding to watchlist: {e}")
        return jsonify({"error": "Failed to add to watchlist"}), 500

@app.route('/watchlist/remove/<int:item_id>', methods=['DELETE'])
def remove_from_watchlist(item_id):
    """Remove a stock from watchlist"""
    try:
        item = Watchlist.query.get(item_id)
        if not item:
            return jsonify({"error": "Watchlist item not found"}), 404
        
        symbol = item.symbol
        db.session.delete(item)
        db.session.commit()
        
        print(f"✅ Removed {symbol} from watchlist")
        return jsonify({"message": f"{symbol} removed from watchlist"})
        
    except Exception as e:
        print(f"❌ Error removing from watchlist: {e}")
        return jsonify({"error": "Failed to remove from watchlist"}), 500

@app.route('/watchlist/check/<int:user_id>/<symbol>', methods=['GET'])
def check_watchlist(user_id, symbol):
    """Check if a stock is in user's watchlist"""
    try:
        item = Watchlist.query.filter_by(user_id=user_id, symbol=symbol.upper()).first()
        return jsonify({
            "in_watchlist": item is not None,
            "item_id": item.id if item else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# HOME PAGE - Works when you visit localhost:5000
# ============================================
@app.route('/')
def home():
    return '''
    <html>
    <head>
        <title>Stock Advisor API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #0f172a, #1e3a5f);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                padding: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                max-width: 600px;
            }
            h1 { color: #60a5fa; margin-bottom: 10px; }
            .status { color: #4ade80; font-size: 20px; margin: 10px 0; }
            .info { color: #94a3b8; margin: 20px 0; line-height: 1.6; }
            .feature { margin: 8px 0; font-size: 14px; }
            .feature-green { color: #4ade80; }
            .feature-yellow { color: #fbbf24; }
            .feature-blue { color: #60a5fa; }
            .feature-purple { color: #a855f7; }
            .test-links { margin-top: 30px; }
            .test-links a {
                display: inline-block;
                margin: 8px;
                padding: 10px 20px;
                background: #3b82f6;
                color: white;
                text-decoration: none;
                border-radius: 10px;
                transition: 0.3s;
                font-size: 14px;
            }
            .test-links a:hover {
                background: #2563eb;
                transform: scale(1.05);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Stock Advisor API</h1>
            <p class="status">✅ Server is Running!</p>
            <p class="info">Your Python backend is live with all features active.</p>
            <p class="feature feature-green">🧠 Google News RSS Sentiment Analysis</p>
            <p class="feature feature-yellow">📊 30-Day Price History for Charts</p>
            <p class="feature feature-blue">🔐 User Authentication (Register/Login)</p>
            <p class="feature feature-green">💾 SQLite Database (advisor.db)</p>
            <p class="feature feature-yellow">🔄 Dynamic AI Confidence Scoring</p>
            <p class="feature feature-purple">⭐ Watchlist System (Add/Remove Stocks)</p>
            <div class="test-links">
                <p style="color: #94a3b8;">Test Stock Analysis:</p>
                <a href="/analyze-stock?ticker=AAPL">📈 Analyze AAPL</a>
                <a href="/analyze-stock?ticker=TSLA">🚗 Analyze TSLA</a>
                <a href="/analyze-stock?ticker=NVDA">💻 Analyze NVDA</a>
                <a href="/analyze-stock?ticker=MSFT">📊 Analyze MSFT</a>
                <a href="/users">👥 View Users</a>
            </div>
        </div>
    </body>
    </html>
    '''

# ============================================
# ANALYZE STOCK - UPGRADED WITH GOOGLE NEWS RSS
# ============================================
@app.route('/analyze-stock', methods=['GET', 'POST'])
def analyze_stock():
    ticker_symbol = None
    
    # Check if it's a POST request (from React)
    if request.method == 'POST':
        data = request.get_json()
        if data:
            ticker_symbol = data.get('ticker')
    
    # Check if it's a GET request (from browser testing)
    if not ticker_symbol:
        ticker_symbol = request.args.get('ticker')
    
    # If still no ticker, show error
    if not ticker_symbol:
        return jsonify({
            "error": "Please provide a ticker symbol",
            "example": "Try /analyze-stock?ticker=AAPL"
        }), 400
    
    try:
        # Clean the ticker symbol
        ticker_symbol = ticker_symbol.upper().strip()
        
        print(f"\n" + "="*60)
        print(f"📊 FETCHING DATA FOR: {ticker_symbol}")
        print("="*60)
        
        # 1. Fetch real data from Yahoo Finance
        stock = yf.Ticker(ticker_symbol)
        info = stock.info
        
        # 2. Extract financial data
        price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('previousClose', 0)
        previous_close = info.get('previousClose', price)
        change = info.get('regularMarketChangePercent', 0)
        name = info.get('longName') or info.get('shortName', ticker_symbol)
        volume = info.get('volume', 0)
        market_cap = info.get('marketCap', 0)
        recommendation = info.get('recommendationKey', 'N/A')
        target_price = info.get('targetMeanPrice', price)

        print(f"  💰 Current Price: ${price:.2f}")
        print(f"  🎯 Analyst Target: ${target_price:.2f}")
        print(f"  📈 Daily Change: {change:+.2f}%")

        # ==========================================
        # 3. GRAB 30-DAY PRICE HISTORY FOR CHARTS
        # ==========================================
        print(f"\n📈 FETCHING 30-DAY PRICE HISTORY...")
        hist = stock.history(period="1mo")
        historical_data = []
        
        for date, row in hist.iterrows():
            historical_data.append({
                "date": date.strftime('%b %d'),
                "price": round(row['Close'], 2)
            })
        
        print(f"  ✅ Retrieved {len(historical_data)} days of price data for chart")

        # ==========================================
        # 4. UPGRADED AI SENTIMENT (Google News RSS)
        # ==========================================
        total_sentiment = 0
        article_count = 0
        news_summary = "Neutral"
        news_headlines = []
        
        try:
            url = f"https://news.google.com/rss/search?q={ticker_symbol}+stock&hl=en-US&gl=US&ceid=US:en"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req, timeout=10)
            root = ET.fromstring(response.read())
            
            print(f"\n📰 READING GOOGLE NEWS HEADLINES FOR {ticker_symbol}...")
            print(f"  📡 Source: Google News RSS Feed")
            
            headlines_found = False
            for item in root.findall('.//item')[:5]:
                title = item.find('title').text
                if title:
                    clean_title = title.split(' - ')[0] if ' - ' in title else title
                    score = analyzer.polarity_scores(clean_title)['compound']
                    total_sentiment += score
                    article_count += 1
                    headlines_found = True
                    
                    news_headlines.append({
                        "title": clean_title[:100],
                        "sentiment": score,
                        "sentiment_label": "Positive" if score > 0.2 else ("Negative" if score < -0.2 else "Neutral")
                    })
                    
                    if score > 0.2:
                        emoji = "🟢"
                    elif score > -0.2:
                        emoji = "🟡"
                    else:
                        emoji = "🔴"
                    
                    print(f"  {emoji} [{score:+.3f}] {clean_title[:80]}...")
            
            if not headlines_found:
                print(f"  ⚠️ No headlines found in RSS feed")
                
        except Exception as e:
            print(f"  ⚠️ Could not fetch Google News: {e}")
            print(f"  ℹ️ Falling back to neutral sentiment")

        avg_sentiment = (total_sentiment / article_count) if article_count > 0 else 0
        
        if avg_sentiment > 0.15:
            news_summary = "Positive"
            sentiment_emoji = "🟢"
        elif avg_sentiment < -0.15:
            news_summary = "Negative"
            sentiment_emoji = "🔴"
        else:
            news_summary = "Neutral"
            sentiment_emoji = "🟡"
        
        print(f"\n  {sentiment_emoji} OVERALL SENTIMENT: {news_summary} (Score: {avg_sentiment:.3f})")
        print(f"  📊 Articles Analyzed: {article_count}")

        # ==========================================
        # 5. DYNAMIC AI VERDICT (Math + News)
        # ==========================================
        verdict = "HOLD"
        confidence = 50
        verdict_color = "yellow"

        if target_price and price and price > 0:
            price_diff_percent = ((target_price - price) / price) * 100
            base_confidence = min(int(abs(price_diff_percent) + 50), 98)
            
            print(f"\n🧠 MAKING AI DECISION...")
            print(f"  💰 Current Price: ${price:.2f}")
            print(f"  🎯 Analyst Target: ${target_price:.2f}")
            print(f"  📊 Price Gap: {price_diff_percent:+.2f}%")
            print(f"  📰 News Mood: {news_summary} ({avg_sentiment:.3f})")
            print(f"  📈 Base Confidence: {base_confidence}%")

            if price_diff_percent > 5:
                if news_summary == "Positive":
                    verdict = "STRONG BUY"
                    confidence = min(base_confidence + 5, 99)
                    verdict_color = "green"
                elif news_summary == "Negative":
                    verdict = "HOLD"
                    confidence = 60
                    verdict_color = "yellow"
                else:
                    verdict = "BUY"
                    confidence = base_confidence
                    verdict_color = "green"
            elif price_diff_percent > 0:
                if news_summary == "Positive":
                    verdict = "BUY"
                    confidence = min(base_confidence + 3, 97)
                    verdict_color = "green"
                elif news_summary == "Negative":
                    verdict = "HOLD"
                    confidence = 55
                    verdict_color = "yellow"
                else:
                    verdict = "BUY"
                    confidence = base_confidence - 5
                    verdict_color = "green"
            elif price_diff_percent > -5:
                if news_summary == "Positive":
                    verdict = "HOLD"
                    confidence = 65
                    verdict_color = "yellow"
                elif news_summary == "Negative":
                    verdict = "SELL"
                    confidence = base_confidence
                    verdict_color = "red"
                else:
                    verdict = "HOLD"
                    confidence = 50
                    verdict_color = "yellow"
            elif price_diff_percent > -10:
                if news_summary == "Negative":
                    verdict = "SELL"
                    confidence = min(base_confidence + 3, 97)
                    verdict_color = "red"
                elif news_summary == "Positive":
                    verdict = "HOLD"
                    confidence = 60
                    verdict_color = "yellow"
                else:
                    verdict = "SELL"
                    confidence = base_confidence
                    verdict_color = "red"
            else:
                if news_summary == "Negative":
                    verdict = "STRONG SELL"
                    confidence = min(base_confidence + 5, 99)
                    verdict_color = "red"
                elif news_summary == "Positive":
                    verdict = "HOLD"
                    confidence = 55
                    verdict_color = "yellow"
                else:
                    verdict = "STRONG SELL"
                    confidence = base_confidence
                    verdict_color = "red"
            
            confidence = min(max(confidence, 30), 99)
            
        print(f"\n  🎯 FINAL VERDICT: {verdict} (Confidence: {confidence}%)")
        print(f"  📊 Chart data points: {len(historical_data)}")
        print(f"  📰 News articles analyzed: {article_count}")
        print("="*60 + "\n")
        
        response_data = {
            "symbol": ticker_symbol,
            "name": name,
            "price": f"{price:.2f}",
            "previousClose": f"{previous_close:.2f}",
            "targetPrice": f"{target_price:.2f}" if target_price else "N/A",
            "verdict": verdict,
            "verdictColor": verdict_color,
            "confidence": confidence,
            "change": f"{change:+.2f}%",
            "isPositive": change > 0,
            "volume": volume,
            "marketCap": market_cap,
            "recommendation": recommendation.upper() if recommendation else "N/A",
            "sentiment": news_summary,
            "sentimentScore": round(avg_sentiment, 3),
            "articlesAnalyzed": article_count,
            "headlines": news_headlines,
            "history": historical_data
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error: {error_msg}")
        return jsonify({
            "error": f"Could not fetch data for {ticker_symbol}",
            "details": error_msg,
            "suggestion": "Check if the ticker symbol is correct (e.g., AAPL, TSLA)"
        }), 400

# ============================================
# PORTFOLIO RECOMMENDATION ENDPOINT
# ============================================
@app.route('/portfolio-recommend', methods=['GET', 'POST'])
def portfolio_recommend():
    amount = 5000
    risk = 50
    
    if request.method == 'POST':
        data = request.get_json()
        if data:
            amount = float(data.get('amount', 5000))
            risk = float(data.get('risk', 50))
    else:
        amount = float(request.args.get('amount', 5000))
        risk = float(request.args.get('risk', 50))
    
    if risk < 30:
        stocks_pct, bonds_pct, cash_pct = 30, 50, 20
        risk_level = "Conservative"
        recommendations = [
            {"symbol": "VTI", "name": "Vanguard Total Stock Market ETF", "allocation": 15},
            {"symbol": "BND", "name": "Vanguard Total Bond Market ETF", "allocation": 50},
            {"symbol": "VXUS", "name": "Vanguard Total International Stock ETF", "allocation": 15},
            {"symbol": "CASH", "name": "Cash Reserves", "allocation": 20}
        ]
    elif risk < 70:
        stocks_pct, bonds_pct, cash_pct = 60, 30, 10
        risk_level = "Moderate"
        recommendations = [
            {"symbol": "SPY", "name": "SPDR S&P 500 ETF", "allocation": 30},
            {"symbol": "QQQ", "name": "Invesco QQQ Trust", "allocation": 20},
            {"symbol": "AAPL", "name": "Apple Inc.", "allocation": 10},
            {"symbol": "BND", "name": "Vanguard Total Bond Market ETF", "allocation": 30},
            {"symbol": "CASH", "name": "Cash Reserves", "allocation": 10}
        ]
    else:
        stocks_pct, bonds_pct, cash_pct = 80, 15, 5
        risk_level = "Aggressive"
        recommendations = [
            {"symbol": "QQQ", "name": "Invesco QQQ Trust", "allocation": 25},
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "allocation": 20},
            {"symbol": "TSLA", "name": "Tesla Inc.", "allocation": 15},
            {"symbol": "AMD", "name": "Advanced Micro Devices", "allocation": 20},
            {"symbol": "BND", "name": "Vanguard Total Bond Market ETF", "allocation": 15},
            {"symbol": "CASH", "name": "Cash Reserves", "allocation": 5}
        ]
    
    print(f"\n📊 Portfolio Generated: {risk_level} (Risk: {risk}%)")
    print(f"  💰 Investment: ${amount:,.2f}")
    print(f"  📈 Stocks: {stocks_pct}% | Bonds: {bonds_pct}% | Cash: {cash_pct}%")
    
    return jsonify({
        "investment_amount": amount,
        "risk_level": risk,
        "risk_category": risk_level,
        "allocation": {
            "stocks_percent": stocks_pct,
            "bonds_percent": bonds_pct,
            "cash_percent": cash_pct,
            "stocks_amount": round(amount * stocks_pct / 100, 2),
            "bonds_amount": round(amount * bonds_pct / 100, 2),
            "cash_amount": round(amount * cash_pct / 100, 2)
        },
        "recommendations": recommendations
    })

# ============================================
# START THE SERVER
# ============================================
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 STOCK ADVISOR BACKEND STARTING...")
    print("="*60)
    print(f"📡 Server running at: http://localhost:5000")
    print(f"📊 Test in browser: http://localhost:5000")
    print(f"💡 Test API: http://localhost:5000/analyze-stock?ticker=AAPL")
    print(f"🧠 AI Sentiment Analysis: UPGRADED (Google News RSS)")
    print(f"📊 30-Day Chart Data: ENABLED")
    print(f"🔄 Dynamic Confidence Scoring: ENABLED")
    print(f"💾 Database: SQLite (advisor.db)")
    print(f"🔐 Auth Routes: /register & /login")
    print(f"⭐ Watchlist Routes: /watchlist/<user_id> | /watchlist/add | /watchlist/remove")
    print("="*60)
    print("Press Ctrl+C to stop the server\n")
    app.run(port=5000, debug=True)