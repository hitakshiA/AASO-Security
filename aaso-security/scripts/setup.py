import os

print("Setting up project environment...")


from dotenv import load_dotenv
load_dotenv()


os.makedirs("logs", exist_ok=True)
os.makedirs("data", exist_ok=True)

print("Setup complete!")
