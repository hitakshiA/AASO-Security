from flask import Blueprint, request, jsonify
from ..services.ai_remediation import AIRemediationService

bp = Blueprint('remediation', __name__, url_prefix='/api/remediation')

@bp.route('/suggest', methods=['POST'])
def suggest_remediation():
    data = request.json
    vulnerability = data.get('vulnerability')
    code_context = data.get('code_context')
    
    try:
        suggestions = ai_service.get_remediation_suggestions(
            vulnerability=vulnerability,
            code_context=code_context
        )
        return jsonify(suggestions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500