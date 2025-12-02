from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder='.')
CORS(app)

DATA_FILE = 'users_data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {'total_users': 0, 'users': {}}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/user-count', methods=['GET'])
def get_user_count():
    data = load_data()
    return jsonify({'total_users': data['total_users']})

@app.route('/api/signup', methods=['POST'])
def signup():
    data = load_data()
    email = request.json.get('email')
    
    if email in data['users']:
        return jsonify({'error': 'User exists'}), 400
    
    data['total_users'] += 1
    user_plan = 'pro' if data['total_users'] <= 100 else 'free'
    
    data['users'][email] = {
        'plan': user_plan,
        'user_number': data['total_users']
    }
    
    save_data(data)
    return jsonify({
        'user_number': data['total_users'],
        'plan': user_plan,
        'total_users': data['total_users']
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=False)
