import { SecurityVulnerability } from '../SecurityScanner';
import axios from 'axios';
import * as vscode from 'vscode';

// Define the sonarqube-scanner type to avoid the import error
declare function sonarqubeScanner(config: any, callback: () => void, errorCallback: (error: any) => void): void;

export class SonarQubeScanner {
    private sonarUrl: string;
    private sonarToken: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('aaso');
        this.sonarUrl = config.get('sonarqube.url') || 'http://localhost:9000';
        this.sonarToken = config.get('sonarqube.token') || '';
    }

    async scan(workspacePath: string): Promise<SecurityVulnerability[]> {
        try {
            await this.runSonarScan(workspacePath);
            const issues = await this.fetchSonarIssues();
            return this.transformIssues(issues);
        } catch (error) {
            console.error('SonarQube scan failed:', error);
            return [];
        }
    }

    private async runSonarScan(workspacePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            sonarqubeScanner(
                {
                    serverUrl: this.sonarUrl,
                    token: this.sonarToken,
                    options: {
                        'sonar.sources': workspacePath,
                        'sonar.projectKey': 'aaso-scan',
                        'sonar.projectName': 'AASO Security Scan',
                        'sonar.projectVersion': '1.0',
                        'sonar.sourceEncoding': 'UTF-8',
                        'sonar.host.url': this.sonarUrl,
                        'sonar.login': this.sonarToken,
                        'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info'
                    }
                },
                () => resolve(),
                error => reject(error)
            );
        });
    }

    private async fetchSonarIssues(): Promise<any[]> {
        const response = await axios.get(`${this.sonarUrl}/api/issues/search`, {
            headers: {
                'Authorization': `Bearer ${this.sonarToken}`
            },
            params: {
                componentKeys: 'aaso-scan',
                types: 'VULNERABILITY,SECURITY_HOTSPOT'
            }
        });

        return response.data.issues || [];
    }

    private transformIssues(issues: any[]): SecurityVulnerability[] {
        return issues.map(issue => ({
            id: `SONAR-${issue.key}`,
            title: issue.message,
            description: `${issue.message} (Rule: ${issue.rule})`,
            severity: this.mapSeverity(issue.severity),
            path: issue.component
        }));
    }

    private mapSeverity(sonarSeverity: string): 'low' | 'medium' | 'high' | 'critical' {
        const severityMap: { [key: string]: SecurityVulnerability['severity'] } = {
            'BLOCKER': 'critical',
            'CRITICAL': 'critical',
            'MAJOR': 'high',
            'MINOR': 'medium',
            'INFO': 'low'
        };
        return severityMap[sonarSeverity] || 'medium';
    }
}