
from flask import Flask, request, jsonify
from flask_cors import CORS
from .routes import scan, remediation, auth
from .services import sonarqube, snyk, owasp_zap, ai_remediation
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


sonarqube_service = sonarqube.SonarQubeService(
    url=os.getenv('SONARQUBE_URL'),
    token=os.getenv('SONARQUBE_TOKEN')
)

snyk_service = snyk.SnykService(
    token=os.getenv('SNYK_TOKEN')
)

zap_service = owasp_zap.OWASPZAPService(
    zap_api_url=os.getenv('ZAP_API_URL'),
    api_key=os.getenv('ZAP_API_KEY')
)

ai_service = ai_remediation.AIRemediationService(
    api_key=os.getenv('OPENAI_API_KEY')
)

# Register blueprints
app.register_blueprint(scan.bp)
app.register_blueprint(remediation.bp)
app.register_blueprint(auth.bp)

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_DEBUG', 'False') == 'True')
