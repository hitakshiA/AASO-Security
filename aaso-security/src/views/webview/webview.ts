import * as vscode from 'vscode';

export class SecurityScanWebview {
    private readonly _webview: vscode.Webview;

    constructor(webview: vscode.Webview) {
        this._webview = webview;
    }

    public updateResults(results: any[]) {
        this._webview.postMessage({
            command: 'updateResults',
            results: results
        });
    }

    public showError(error: string) {
        this._webview.postMessage({
            command: 'showError',
            error: error
        });
    }

    public updateProgress(progress: number) {
        this._webview.postMessage({
            command: 'updateProgress',
            progress: progress
        });
    }
}