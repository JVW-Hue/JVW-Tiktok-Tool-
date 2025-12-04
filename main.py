from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import secrets
import re

app = Flask(__name__, static_folder='.')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))

# CORS - Allow all origins for maximum compatibility
CORS(app, resources={r"/*": {"origins": "*"}})

# Rate limiting to prevent brute force attacks
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

DATA_FILE = 'users_data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {'total_users': 0, 'users': {}}

def save_data(data):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 6

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/user-count', methods=['GET'])
@limiter.limit("30 per minute")
def get_user_count():
    data = load_data()
    return jsonify({'total_users': data['total_users']})

@app.route('/api/signup', methods=['POST', 'OPTIONS'])
@limiter.limit("100 per hour")  # Increased limit
def signup():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    try:
        print(f"Signup request received")
        data = load_data()
        email = request.json.get('email', '').strip().lower()
        password = request.json.get('password', '')
        print(f"Signup for: {email}")
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not validate_password(password):
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        if email in data['users']:
            return jsonify({'error': 'User exists'}), 400
        
        data['total_users'] += 1
        user_plan = 'pro' if data['total_users'] <= 100 else 'free'
        
        data['users'][email] = {
            'password': generate_password_hash(password),
            'plan': user_plan,
            'user_number': data['total_users']
        }
        
        save_data(data)
        print(f"Signup success: User #{data['total_users']}")
        return jsonify({
            'user_number': data['total_users'],
            'plan': user_plan,
            'total_users': data['total_users']
        }), 200
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
@limiter.limit("100 per minute")  # Increased limit
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    try:
        print(f"Login request received")
        data = load_data()
        email = request.json.get('email', '').strip().lower()
        password = request.json.get('password', '')
        print(f"Login for: {email}")
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        if email not in data['users']:
            return jsonify({'error': 'User not found'}), 404
        
        stored_password = data['users'][email].get('password', '')
        
        # Handle legacy plain text passwords - migrate to hashed
        if stored_password and not stored_password.startswith('pbkdf2:sha256:'):
            if stored_password == password:
                data['users'][email]['password'] = generate_password_hash(password)
                save_data(data)
            else:
                return jsonify({'error': 'Invalid password'}), 401
        else:
            if not check_password_hash(stored_password, password):
                return jsonify({'error': 'Invalid password'}), 401
        
        # Track login count
        if 'login_count' not in data['users'][email]:
            data['users'][email]['login_count'] = 0
        data['users'][email]['login_count'] += 1
        save_data(data)
        print(f"Login success: {email}")
        
        return jsonify({
            'plan': data['users'][email]['plan'],
            'user_number': data['users'][email]['user_number'],
            'login_count': data['users'][email]['login_count']
        }), 200
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/upgrade', methods=['POST'])
@limiter.limit("5 per minute")
def upgrade():
    try:
        data = load_data()
        email = request.json.get('email', '').strip().lower()
        plan = request.json.get('plan', '')
        
        if not email or not plan:
            return jsonify({'error': 'Email and plan required'}), 400
        
        if plan not in ['free', 'pro', 'enterprise']:
            return jsonify({'error': 'Invalid plan'}), 400
        
        if email not in data['users']:
            return jsonify({'error': 'User not found'}), 404
        
        data['users'][email]['plan'] = plan
        save_data(data)
        
        return jsonify({'success': True, 'plan': plan})
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/admin/users', methods=['GET'])
@limiter.limit("10 per minute")
def get_all_users():
    admin_key = request.headers.get('X-Admin-Key')
    if admin_key != os.environ.get('ADMIN_KEY', 'your-secret-admin-key-123'):
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = load_data()
    users_list = []
    for email, info in data['users'].items():
        users_list.append({
            'email': email,
            'plan': info['plan'],
            'user_number': info['user_number'],
            'has_password': 'password' in info,
            'login_count': info.get('login_count', 0)
        })
    return jsonify({
        'total_users': data['total_users'],
        'users': users_list
    })

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': 'Too many requests. Please try again later.'}), 429

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
