import * as assert from 'assert';
import * as vscode from 'vscode';
import { BusinessLogicScanner } from '../../scanner/BusinessLogicScanner';

suite('Business Logic Scanner Tests', () => {
    let scanner: BusinessLogicScanner;

    setup(() => {
        scanner = new BusinessLogicScanner();
    });

    test('Detects IDOR Vulnerabilities', async () => {
        const testCode = `
            app.get('/user/:id', (req, res) => {
                const userId = req.params.id;
                return db.findById(userId);
            });
        `;

        const testDocument = {
            getText: () => testCode,
            uri: vscode.Uri.file('test.js'),
            positionAt: (offset: number) => new vscode.Position(0, offset),
            languageId: 'javascript',
            version: 1,
            lineCount: testCode.split("\n").length
        } as unknown as vscode.TextDocument;

        const results = await scanner.scanFile(testDocument);
        assert.strictEqual(results.some(r => r.type === 'Insecure Direct Object Reference'), true);
    });
});
