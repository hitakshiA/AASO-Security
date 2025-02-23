import * as assert from 'assert';
import * as vscode from 'vscode';
import { CustomRuleEngine } from '../../scanner/rules/CustomRuleEngine';

suite('Custom Rule Engine Tests', () => {
    let engine: CustomRuleEngine;

    setup(() => {
        engine = new CustomRuleEngine();
    });

    test('Detects Hardcoded Secrets', async () => {
        const testCode = `
            const apiKey = "sk_test_1234567890";
            const password = "supersecret123";
        `;

        const testDocument = {
            getText: () => testCode,
            uri: vscode.Uri.file('test.js'),
            positionAt: (offset: number) => new vscode.Position(0, offset),
            languageId: 'javascript',  
            version: 1,  
            lineCount: testCode.split("\n").length,
        } as unknown as vscode.TextDocument;
        
        const results = await engine.scanFile(testDocument);
        assert.strictEqual(results.some(r => r.type === 'Hardcoded Secrets'), true);
    });
});
