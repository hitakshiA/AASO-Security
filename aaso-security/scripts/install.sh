

echo "Installing dependencies..."


sudo apt update -y


sudo apt install -y python3 python3-pip virtualenv


python3 -m venv venv
source venv/bin/activate


pip install -r requirements.txt

echo "Installation complete!"
