import { SecurityVulnerability } from '../SecurityScanner';
import axios from 'axios';
import * as vscode from 'vscode';

export class SnykScanner {
    public snykToken: string;
    public snykApi: string = 'https://snyk.io/api/v1';

    constructor() {
        const config = vscode.workspace.getConfiguration('aaso');
        this.snykToken = config.get('snyk.token') || '';
    }

    async scan(workspacePath: string): Promise<SecurityVulnerability[]> {
        try {
            const testResults = await this.testProject(workspacePath);
            const vulnerabilities = await this.getVulnerabilityDetails(testResults);
            return this.transformResults(vulnerabilities);
        } catch (error) {
            console.error('Snyk scan failed:', error);
            return [];
        }
    }

    private async testProject(workspacePath: string): Promise<any> {
        const response = await axios.post(
            `${this.snykApi}/test`,
            {
                path: workspacePath
            },
            {
                headers: {
                    'Authorization': `token ${this.snykToken}`
                }
            }
        );
        return response.data;
    }

    private async getVulnerabilityDetails(testResults: any[]): Promise<any[]> {
        return testResults.map(result => ({
            ...result,
            details: result.vulnerabilities || []
        }));
    }

    private transformResults(vulnerabilities: any[]): SecurityVulnerability[] {
        return vulnerabilities.map(vuln => ({
            id: vuln.id || '',
            title: vuln.title || '',
            description: vuln.description || '',
            severity: this.mapSeverity(vuln.severity),
            path: vuln.path || ''
        }));
    }

    private mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'critical';
            case 'high':
                return 'high';
            case 'medium':
                return 'medium';
            default:
                return 'low';
        }
    }
}