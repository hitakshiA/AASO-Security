from flask import Blueprint, request, jsonify
import jwt
import datetime
import os

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
  
    
    token = jwt.encode(
        {
            'user': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        },
        os.getenv('JWT_SECRET'),
        algorithm='HS256'
    )
    
    return jsonify({'token': token})