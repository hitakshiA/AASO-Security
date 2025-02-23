from typing import Dict, List, Optional
import json
from dataclasses import dataclass

@dataclass
class SecurityVulnerability:
    id: str
    title: Optional[str]
    description: str
    severity: str
    path: Optional[str]

@dataclass
class RemediationSuggestion:
    vulnerability_id: str
    suggestion: str
    code_example: Optional[str]
    references: List[str]
    confidence: float

class AIRemediation:
    def __init__(self):
        self.remediation_database: Dict[str, List[str]] = {}
        self.initialize_remediation_database()

    def initialize_remediation_database(self):
        """Initialize database with common vulnerability types and remediation patterns."""
        self.remediation_database = {
            'sql-injection': [
                'Use parameterized queries instead of string concatenation',
                'Implement input validation and sanitization',
                'Use an ORM (Object-Relational Mapping) library'
            ],
            'xss': [
                'Escape all user input before rendering',
                'Use Content Security Policy (CSP) headers',
                'Implement input validation on both client and server side'
            ],
            'path-traversal': [
                'Validate and sanitize file paths',
                'Use secure file handling libraries',
                'Implement proper access controls'
            ]
        }

    def suggest_remediation(self, vulnerability: SecurityVulnerability) -> RemediationSuggestion:
        """Generate remediation suggestions for a given vulnerability."""
        vulnerability_type = self._categorize_vulnerability(vulnerability)
        suggestions = self.remediation_database.get(vulnerability_type, [])
        confidence = self._calculate_confidence(vulnerability, suggestions)

        return RemediationSuggestion(
            vulnerability_id=vulnerability.id,
            suggestion=self._get_best_suggestion(suggestions, vulnerability),
            code_example=self._generate_code_example(vulnerability),
            references=self._get_references(vulnerability_type),
            confidence=confidence
        )

    def _categorize_vulnerability(self, vulnerability: SecurityVulnerability) -> str:
        """Analyze vulnerability description and title to categorize it."""
        description = vulnerability.description.lower()
        
        if any(term in description for term in ['sql', 'injection']):
            return 'sql-injection'
        if any(term in description for term in ['xss', 'cross-site scripting']):
            return 'xss'
        if any(term in description for term in ['path', 'traversal', 'directory']):
            return 'path-traversal'
        
        return 'unknown'

    def _get_best_suggestion(self, suggestions: List[str], vulnerability: SecurityVulnerability) -> str:
        """Return the most relevant suggestion based on context."""
        if not suggestions:
            return f"Review the {vulnerability.severity} severity issue in {vulnerability.path or 'your code'} and implement appropriate security controls."
        
        return suggestions[0]

    def _generate_code_example(self, vulnerability: SecurityVulnerability) -> Optional[str]:
        """Generate context-aware code examples based on vulnerability type."""
        vulnerability_type = self._categorize_vulnerability(vulnerability)
        
        code_examples = {
            'sql-injection': '''
# ❌ Vulnerable code
query = f"SELECT * FROM users WHERE id = {user_id}"

# ✅ Safe code
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
''',
            'xss': '''
# ❌ Vulnerable code
@app.route('/profile')
def profile():
    return f"<h1>Welcome {request.args.get('name')}</h1>"

# ✅ Safe code
from flask import escape
@app.route('/profile')
def profile():
    return f"<h1>Welcome {escape(request.args.get('name', ''))}</h1>"
''',
            'path-traversal': '''
# ❌ Vulnerable code
with open(user_provided_path) as f:
    content = f.read()

# ✅ Safe code
from pathlib import Path
safe_path = Path(base_dir).resolve().joinpath(user_provided_path).resolve()
if safe_path.is_relative_to(Path(base_dir)):
    with safe_path.open() as f:
        content = f.read()
'''
        }
        
        return code_examples.get(vulnerability_type)

    def _get_references(self, vulnerability_type: str) -> List[str]:
        """Get relevant security references for the vulnerability type."""
        references = {
            'sql-injection': [
                'https://owasp.org/www-community/attacks/SQL_Injection',
                'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'
            ],
            'xss': [
                'https://owasp.org/www-community/attacks/xss/',
                'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'
            ],
            'path-traversal': [
                'https://owasp.org/www-community/attacks/Path_Traversal',
                'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html'
            ]
        }
        
        return references.get(vulnerability_type, [])

    def _calculate_confidence(self, vulnerability: SecurityVulnerability, suggestions: List[str]) -> float:
        """Calculate confidence score (0-1) based on various factors."""
        confidence = 0.5  # Base confidence

        # Adjust based on available information
        if len(vulnerability.description) > 100:
            confidence += 0.1
        if vulnerability.path:
            confidence += 0.1
        if suggestions:
            confidence += 0.1
        if vulnerability.title:
            confidence += 0.1

       
        return min(max(confidence, 0.0), 1.0)


if __name__ == "__main__":
   
    vulnerability = SecurityVulnerability(
        id="VULN-001",
        title="SQL Injection Risk",
        description="Unsanitized SQL query found in login function",
        severity="high",
        path="/src/auth/login.py"
    )

   
    ai_remediation = AIRemediation()

    
    suggestion = ai_remediation.suggest_remediation(vulnerability)
    print(json.dumps(vars(suggestion), indent=2))