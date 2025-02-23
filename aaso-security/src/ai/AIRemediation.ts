

import * as vscode from 'vscode';
import axios from 'axios';
import { SecurityVulnerability } from '@/scanner/SecurityScanner';

interface RemediationSuggestion {
    description: string;
    code_example: string;
    confidence: number;
    references: string[];
}

export class AIRemediationService {
    static getFix(issue: SecurityVulnerability) {
        throw new Error('Method not implemented.');
    }
    private apiEndpoint: string;
    private apiKey: string;

    constructor(apiEndpoint: string, apiKey: string) {
        this.apiEndpoint = apiEndpoint;
        this.apiKey = apiKey;
    }

    async getSuggestions(
        vulnerability: string,
        codeContext: string
    ): Promise<RemediationSuggestion[]> {
        try {
            const response = await axios.post(
                `${this.apiEndpoint}/api/remediation/suggest`,
                {
                    vulnerability,
                    code_context: codeContext
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error getting AI remediation suggestions:', error);
            throw new Error('Failed to get remediation suggestions');
        }
    }

    async generateExplanation(vulnerability: any): Promise<string> {
        try {
            const response = await axios.post(
                `${this.apiEndpoint}/api/remediation/explain`,
                { vulnerability },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.explanation;
        } catch (error) {
            console.error('Error generating explanation:', error);
            throw new Error('Failed to generate vulnerability explanation');
        }
    }

    async getPriorityRecommendation(vulnerabilities: any[]): Promise<string> {
        try {
            const response = await axios.post(
                `${this.apiEndpoint}/api/remediation/prioritize`,
                { vulnerabilities },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.recommendation;
        } catch (error) {
            console.error('Error getting priority recommendation:', error);
            throw new Error('Failed to get priority recommendation');
        }
    }
}