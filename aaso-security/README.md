AASO Security Scanner
Overview
AASO (Advanced Application Security Observer) is a VS Code extension that provides real-time security scanning and vulnerability detection for your code. It integrates with multiple security tools and provides AI-powered remediation suggestions.
Features

Real-time security scanning
Integration with OWASP ZAP, SonarQube, and Snyk
Business logic vulnerability detection
Custom security rules engine
AI-powered remediation suggestions
Detailed vulnerability reporting

Installation

Install the required dependencies:

bashCopynpm install

Set up environment variables:


Copy .env.example to .env
Fill in your API keys and service URLs


Build the extension:

bashCopynpm run compile

Install the backend requirements:

bashCopycd backend
pip install -r requirements.txt
Usage

Start the backend server:

bashCopycd backend
flask run

Press F5 in VS Code to start the extension in debug mode
Use the command palette (Ctrl+Shift+P) and search for:


AASO: Start Security Scan
AASO: Configure Settings

Development
Project Structure
Copyaaso-security/
├── src/                    # Extension source code
├── backend/               # Flask backend
└── scripts/              # Utility scripts
Adding New Rules

Create a new rule in src/scanner/rules/
Implement the rule interface
Register the rule in CustomRuleEngine.ts

Testing
Run the test suite:
bashCopynpm test
Building
Build the extension:
bashCopynpm run package
Troubleshooting
Common issues and solutions:

Backend Connection Failed

Check if Flask server is running
Verify endpoint configuration in settings


Scan Not Working

Ensure all API keys are properly configured
Check service connections (ZAP, SonarQube, Snyk)


Missing Results

Verify file permissions
Check console for errors



Contributing

Fork the repository
Create a feature branch
Submit a pull request