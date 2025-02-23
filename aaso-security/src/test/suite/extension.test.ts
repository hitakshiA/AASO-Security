import * as assert from 'assert';
import * as vscode from 'vscode';
import { SecurityScanner } from '../../scanner/SecurityScanner';


import { BusinessLogicScanner } from '../../scanner/BusinessLogicScanner';
import { CustomRuleEngine } from '../../scanner/rules/CustomRuleEngine';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting all tests.');

    test('Security Scanner Initialization', () => {
        const scanner = new SecurityScanner();
        assert.strictEqual(typeof scanner.scanFile, 'function');
    });

    test('Business Logic Scanner Detection', async () => {
        const scanner = new BusinessLogicScanner();
        const testDocument = {
            getText: () => 'const password = "hardcoded123";',
            uri: vscode.Uri.file('test.ts'),
            positionAt: (offset: number) => new vscode.Position(0, offset)
        } as vscode.TextDocument;

        const results = await scanner.scanFile(testDocument);
        assert.strictEqual(results.length > 0, true);
    });

    test('Custom Rule Engine Rules', () => {
        const engine = new CustomRuleEngine();
        const rules = engine['rules']; 
        assert.strictEqual(rules.length > 0, true);
    });
});
