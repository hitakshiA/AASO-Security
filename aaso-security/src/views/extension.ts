

import * as vscode from 'vscode';
import { SecurityScanPanel } from './webview/panel';
import { SecurityScanner } from '../scanner/SecurityScanner';
import { BusinessLogicScanner } from '../scanner/BusinessLogicScanner';
import { CustomRuleEngine } from '../scanner/rules/CustomRuleEngine';
import { AIRemediationService } from '../ai/AIRemediation';
import { ScanResultProvider } from '../reporting/ScanResultProvider';

export function activate(context: vscode.ExtensionContext) {
    const securityScanner = new SecurityScanner();
    const businessLogicScanner = new BusinessLogicScanner();
    const customRuleEngine = new CustomRuleEngine();
    const resultProvider = new ScanResultProvider();
    
    const aiService = new AIRemediationService(
        vscode.workspace.getConfiguration().get('aaso.aiEndpoint') || '',
        vscode.workspace.getConfiguration().get('aaso.aiApiKey') || ''
    );

   
    let scanCommand = vscode.commands.registerCommand('myextension.start', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        try {
          
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Running security scan...",
                cancellable: true
            }, async (progress, token) => {
                progress.report({ increment: 0 });

             
                const securityResults = await securityScanner.scanFile(editor.document);
                progress.report({ increment: 30 });

              
                const businessLogicResults = await businessLogicScanner.scanFile(editor.document);
                progress.report({ increment: 30 });

                
                const customRuleResults = await customRuleEngine.scanFile(editor.document);
                progress.report({ increment: 30 });

                
                const allResults = [
                    ...securityResults,
                    ...businessLogicResults,
                    ...customRuleResults
                ];

               
                const criticalIssues = allResults.filter(r => r.severity === 'Critical');
                if (criticalIssues.length > 0) {
                    const suggestions = await aiService.getPriorityRecommendation(criticalIssues);
                    vscode.window.showInformationMessage(suggestions);
                }

                
                resultProvider.updateResults(allResults);
                progress.report({ increment: 10 });

                
                SecurityScanPanel.createOrShow(context.extensionUri);
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Scan failed: ${error}`);
        }
    });

    let configureCommand = vscode.commands.registerCommand('aaso.configure', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'aaso');
    });

   
    vscode.window.registerTreeDataProvider('securityResults', resultProvider);

 
    context.subscriptions.push(scanCommand);
    context.subscriptions.push(configureCommand);

    
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { scheme: 'file' },
            {
                provideCodeActions(document, range, context, token) {
                    const actions: vscode.CodeAction[] = [];
                    
                   
                    context.diagnostics.forEach(diagnostic => {
                        if (diagnostic.source === 'AASO') {
                            const fix = new vscode.CodeAction(
                                'Fix security issue',
                                vscode.CodeActionKind.QuickFix
                            );
                            fix.command = {
                                command: 'aaso.fixIssue',
                                title: 'Fix security issue',
                                arguments: [document, diagnostic]
                            };
                            actions.push(fix);
                        }
                    });

                    return actions;
                }
            }
        )
    );
}

export function deactivate() {
    
}