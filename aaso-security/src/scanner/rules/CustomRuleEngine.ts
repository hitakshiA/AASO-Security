

import * as vscode from 'vscode';

export interface Rule {
    id: string;
    name: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    category: string;
    pattern: RegExp | ((code: string) => boolean);
    message: string;
    remediation: string;
}

export class CustomRuleEngine {
    private rules: Rule[] = [];

    constructor() {
       
        this.loadDefaultRules();
    }

    private loadDefaultRules() {
        this.rules = [
            {
                id: 'SEC001',
                name: 'Hardcoded Secrets',
                description: 'Detects hardcoded API keys, passwords, and other secrets',
                severity: 'Critical',
                category: 'Security',
                pattern: /(password|secret|api[_-]?key|access[_-]?token)[\s]*[:=]\s*['"][^'"]+['"]/i,
                message: 'Hardcoded secret detected',
                remediation: 'Move secrets to environment variables or secure secret storage'
            },
            {
                id: 'SEC002',
                name: 'SQL Injection',
                description: 'Detects potential SQL injection vulnerabilities',
                severity: 'Critical',
                category: 'Security',
                pattern: /executeQuery\s*\(\s*['"`]\s*[^'"`]+\$\{.*?\}/,
                message: 'Potential SQL injection vulnerability',
                remediation: 'Use parameterized queries or an ORM'
            }
        ];
    }

    public addRule(rule: Rule) {
        this.rules.push(rule);
    }

    public removeRule(ruleId: string) {
        this.rules = this.rules.filter(rule => rule.id !== ruleId);
    }

    public async scanFile(document: vscode.TextDocument): Promise<any[]> {
        const results = [];
        const text = document.getText();

        for (const rule of this.rules) {
            if (rule.pattern instanceof RegExp) {
                let match;
                while ((match = rule.pattern.exec(text)) !== null) {
                    const startPos = document.positionAt(match.index);
                    const endPos = document.positionAt(match.index + match[0].length);
                    
                    results.push({
                        ruleId: rule.id,
                        type: rule.name,
                        severity: rule.severity,
                        message: rule.message,
                        remediation: rule.remediation,
                        location: new vscode.Range(startPos, endPos)
                    });
                }
            } else if (typeof rule.pattern === 'function') {
                if (rule.pattern(text)) {
                    results.push({
                        ruleId: rule.id,
                        type: rule.name,
                        severity: rule.severity,
                        message: rule.message,
                        remediation: rule.remediation,
                        location: new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(text.length)
                        )
                    });
                }
            }
        }

        return results;
    }
}