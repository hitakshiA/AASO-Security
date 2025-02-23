# backend/api/services/sonarqube.py

import requests
from typing import List, Dict, Any
import base64

class SonarQubeService:
    def __init__(self, url: str, token: str):
        self.base_url = url
        self.auth = base64.b64encode(f"{token}:".encode()).decode()
        self.headers = {
            'Authorization': f'Basic {self.auth}',
            'Content-Type': 'application/json'
        }

    def start_scan(self, file_content: str, file_name: str) -> List[Dict[str, Any]]:
        """Start a SonarQube scan on the provided file content."""
        try:
            # Create temporary project
            project_key = f"temp_{hash(file_content)}"
            
            # Submit file for analysis
            analysis_url = f"{self.base_url}/api/projects/create"
            project_data = {
                'name': project_key,
                'project': project_key
            }
            
            response = requests.post(
                analysis_url,
                headers=self.headers,
                json=project_data
            )
            response.raise_for_status()

            # Submit source
            source_url = f"{self.base_url}/api/sources/submit"
            files = {
                'file': (file_name, file_content)
            }
            data = {
                'project': project_key
            }
            
            response = requests.post(
                source_url,
                headers=self.headers,
                data=data,
                files=files
            )
            response.raise_for_status()

            # Get analysis results
            results = self._get_analysis_results(project_key)
            
            # Cleanup temporary project
            self._delete_project(project_key)
            
            return results

        except requests.exceptions.RequestException as e:
            print(f"Error scanning with SonarQube: {e}")
            return []

    def _get_analysis_results(self, project_key: str) -> List[Dict[str, Any]]:
        """Get analysis results for a project."""
        try:
            issues_url = f"{self.base_url}/api/issues/search"
            params = {
                'componentKeys': project_key,
                'types': 'VULNERABILITY,BUG,CODE_SMELL'
            }
            
            response = requests.get(
                issues_url,
                headers=self.headers,
                params=params
            )
            response.raise_for_status()
            
            issues = response.json().get('issues', [])
            return self._format_results(issues)

        except requests.exceptions.RequestException as e:
            print(f"Error getting analysis results: {e}")
            return []

    def _delete_project(self, project_key: str) -> None:
        """Delete temporary project."""
        try:
            delete_url = f"{self.base_url}/api/projects/delete"
            params = {
                'project': project_key
            }
            
            requests.post(
                delete_url,
                headers=self.headers,
                params=params
            )

        except requests.exceptions.RequestException as e:
            print(f"Error deleting project: {e}")

    def _format_results(self, issues: List[Dict]) -> List[Dict]:
        """Format SonarQube issues into standardized format."""
        formatted_results = []

        for issue in issues:
            formatted_results.append({
                'id': issue.get('key'),
                'type': issue.get('type'),
                'severity': issue.get('severity'),
                'description': issue.get('message'),
                'location': {
                    'file': issue.get('component', ''),
                    'line': issue.get('line', 0),
                    'column': 0
                },
                'remediation': issue.get('debt'),
                'rule_id': issue.get('rule')
            })

        return formatted_results