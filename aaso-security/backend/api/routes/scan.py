
from flask import Blueprint, request, jsonify
from ..services import sonarqube, snyk, owasp_zap
from functools import wraps

bp = Blueprint('scan', __name__, url_prefix='/api/scan')

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
       
        return f(*args, **kwargs)
    return decorated

@bp.route('/start', methods=['POST'])
@require_auth
def start_scan():
    data = request.json
    target_url = data.get('url')
    scan_type = data.get('type', 'all')
    
    results = {
        'scan_id': None,
        'status': 'started',
        'errors': []
    }
    
    try:
        if scan_type in ['all', 'zap']:
            scan_id = zap_service.start_scan(target_url)
            results['scan_id'] = scan_id
            
        if scan_type in ['all', 'sonarqube']:
            sonarqube_service.start_scan(target_url)
            
        if scan_type in ['all', 'snyk']:
            snyk_service.start_scan(target_url)
    
    except Exception as e:
        results['errors'].append(str(e))
        results['status'] = 'error'
    
    return jsonify(results)

@bp.route('/status/<scan_id>', methods=['GET'])
@require_auth
def scan_status(scan_id):
    try:
        status = zap_service.get_scan_status(scan_id)
        return jsonify({
            'scan_id': scan_id,
            'status': status
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/results/<scan_id>', methods=['GET'])
@require_auth
def scan_results(scan_id):
    try:
        results = zap_service.get_scan_results(scan_id)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
