

import * as vscode from 'vscode';

export class ScanResultItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly severity: string,
        public readonly description?: string,
        public readonly location?: vscode.Location
    ) {
        super(label, collapsibleState);

        this.tooltip = description;
        this.description = severity;
        
        // Fix the ThemeIcon instantiation
        this.iconPath = this.getIconForSeverity(severity);

        if (location) {
            this.command = {
                command: 'aaso.showIssue',
                title: 'Show Issue',
                arguments: [location]
            };
        }
    }

    private getIconForSeverity(severity: string): vscode.ThemeIcon {
        switch (severity) {
            case 'Critical':
                return {
                    id: 'error'
                } as vscode.ThemeIcon;
            case 'High':
                return {
                    id: 'warning'
                } as vscode.ThemeIcon;
            case 'Medium':
                return {
                    id: 'info'
                } as vscode.ThemeIcon;
            default:
                return {
                    id: 'check'
                } as vscode.ThemeIcon;
        }
    }
        
        
        return vscode.ThemeIcon[iconName];
    }


export class ScanResultProvider implements vscode.TreeDataProvider<ScanResultItem> {
  
}