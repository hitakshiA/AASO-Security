import * as vscode from 'vscode';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { Pattern } from './rules/Pattern';

export interface BusinessLogicVulnerability {
    type: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    location: vscode.Location;
    description: string;
    remediation: string;
}

export class BusinessLogicScanner {
    private patterns: Pattern[];

    constructor() {
        this.patterns = [
            {
                name: 'Insecure Direct Object Reference',
                severity: 'High',
                detect: (node: any) => {
                    return node.type === 'CallExpression' &&
                        node.callee?.property?.name === 'findById' &&
                        !this.hasAuthorizationCheck(node);
                },
                message: 'Potential IDOR vulnerability detected',
                remediation: 'Implement proper authorization checks before accessing objects'
            },
            {
                name: 'Missing Rate Limiting',
                severity: 'Medium',
                detect: (node: any) => {
                    return node.type === 'CallExpression' &&
                        ['login', 'register', 'reset'].includes(node.callee?.property?.name) &&
                        !this.hasRateLimiting(node);
                },
                message: 'Endpoint may be vulnerable to brute force attacks',
                remediation: 'Implement rate limiting middleware'
            }
        ];
    }

    async scanFile(document: vscode.TextDocument): Promise<BusinessLogicVulnerability[]> {
        const vulnerabilities: BusinessLogicVulnerability[] = [];
        const sourceCode = document.getText();

        try {
            const ast = parse(sourceCode, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx']
            });

            traverse(ast, {
                enter: (path) => {
                    for (const pattern of this.patterns) {
                        if (pattern.detect(path.node)) {
                            const location = new vscode.Location(
                                document.uri,
                                document.positionAt(path.node.start || 0) // Ensure start is defined
                            );

                            vulnerabilities.push({
                                type: pattern.name,
                                severity: pattern.severity,
                                location: location,
                                description: pattern.message,
                                remediation: pattern.remediation
                            });
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error parsing file:', error);
        }

        return vulnerabilities;
    }

    private hasAuthorizationCheck(node: any): boolean {
        let currentNode = node;
        while (currentNode.parent) {
            if (this.isAuthCheck(currentNode.parent)) {
                return true;
            }
            currentNode = currentNode.parent;
        }
        return false;
    }

    private hasRateLimiting(node: any): boolean {
        let currentNode = node;
        while (currentNode.parent) {
            if (this.isRateLimitingMiddleware(currentNode.parent)) {
                return true;
            }
            currentNode = currentNode.parent;
        }
        return false;
    }

    private isAuthCheck(node: any): boolean {
        return node.type === 'CallExpression' &&
            ['checkAuth', 'isAuthenticated', 'requireAuth'].includes(node.callee?.name);
    }

    private isRateLimitingMiddleware(node: any): boolean {
        return node.type === 'CallExpression' &&
            ['rateLimit', 'throttle'].includes(node.callee?.name);
    }
}
