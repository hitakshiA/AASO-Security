

import requests
from typing import Dict, List, Optional
from urllib.parse import urljoin

class OWASPZAPService:
    def __init__(self, zap_api_url: str, api_key: str):
        """Initialize OWASP ZAP service with API URL and key."""
        self.base_url = zap_api_url
        self.api_key = api_key
        self.headers = {
            'X-ZAP-API-Key': api_key,
            'Content-Type': 'application/json'
        }

    def start_scan(self, target_url: str) -> str:
        """Start a new active scan against the target URL."""
        endpoint = 'JSON/ascan/action/scan/'
        data = {
            'url': target_url,
            'recurse': True,
            'inScopeOnly': True,
            'scanPolicyName': 'Default Policy'
        }
        
        response = requests.post(
            urljoin(self.base_url, endpoint),
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()['scan']

    def get_scan_status(self, scan_id: str) -> int:
        """Get the status of an ongoing scan."""
        endpoint = f'JSON/ascan/view/status/'
        params = {'scanId': scan_id}
        
        response = requests.get(
            urljoin(self.base_url, endpoint),
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return int(response.json()['status'])

    def get_scan_results(self, scan_id: str) -> List[Dict]:
        """Get the results of a completed scan."""
        endpoint = 'JSON/core/view/alerts/'
        params = {'scanId': scan_id}
        
        response = requests.get(
            urljoin(self.base_url, endpoint),
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        
        alerts = response.json()['alerts']
        return self._format_results(alerts)

    def _format_results(self, alerts: List[Dict]) -> List[Dict]:
        """Format ZAP alerts into standardized result format."""
        formatted_results = []
        
        for alert in alerts:
            formatted_results.append({
                'vulnerability_type': alert['name'],
                'severity': alert['risk'],
                'description': alert['description'],
                'location': {
                    'url': alert['url'],
                    'parameter': alert.get('param', ''),
                    'evidence': alert.get('evidence', '')
                },
                'remediation': alert['solution'],
                'cwe_id': alert.get('cweid', ''),
                'wasc_id': alert.get('wascid', '')
            })
        
        return formatted_results

    def stop_scan(self, scan_id: str) -> bool:
        """Stop an ongoing scan."""
        endpoint = 'JSON/ascan/action/stop/'
        params = {'scanId': scan_id}
        
        response = requests.get(
            urljoin(self.base_url, endpoint),
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()['Result'] == 'OK'