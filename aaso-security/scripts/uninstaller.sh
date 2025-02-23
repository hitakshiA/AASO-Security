

echo "Removing virtual environment and dependencies..."


rm -rf venv

# Optionally remove installed dependencies
pip uninstall -y -r requirements.txt

echo "Uninstallation complete!"
