import requests
from typing import List, Dict, Any
import json

class SnykService:
    def __init__(self, token: str):
        self.token = token
        self.api_url = "https://snyk.io/api/v1"
        self.headers = {
            'Authorization': f'token {token}',
            'Content-Type': 'application/json'
        }

    def start_scan(self, project_content: str, file_name: str) -> List[Dict[str, Any]]:
        """Scan project for vulnerabilities using Snyk."""
        try:
           
            test_api = f"{self.api_url}/test"
            payload = {
                'files': {
                    file_name: {
                        'content': project_content
                    }
                }
            }

            response = requests.post(
                test_api,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()

            vulnerabilities = response.json().get('issues', {}).get('vulnerabilities', [])
            return self._format_results(vulnerabilities)

        except requests.exceptions.RequestException as e:
            print(f"Error scanning with Snyk: {e}")
            return []

    def _format_results(self, vulnerabilities: List[Dict]) -> List[Dict]:
        """Format Snyk vulnerabilities into standardized format."""
        formatted_results = []

        for vuln in vulnerabilities:
            formatted_results.append({
                'id': vuln.get('id'),
                'type': 'Dependency Vulnerability',
                'severity': vuln.get('severity', 'Low'),
                'description': vuln.get('title'),
                'location': {
                    'file': vuln.get('packageName', ''),
                    'line': vuln.get('line', 0),
                    'column': vuln.get('column', 0)
                },
                'remediation': vuln.get('remediation', {}).get('advice', ''),
                'cwe_id': vuln.get('identifiers', {}).get('CWE', [])
            })

        return formatted_results